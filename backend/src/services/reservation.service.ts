import { pool } from "../config/database.js";
import {
  Reservation,
  CreateReservationRequest,
  UpdateReservationRequest,
  ReservationStatus,
  User,
} from "../types/index.js";
import { NotFoundError, BusinessError } from "../middleware/errorHandler.js";
import { ResourceService } from "./resource.service.js";
import { EmailService } from "./email.service.js";

/**
 * Service pour gérer les réservations
 */
export class ReservationService {
  /**
   * Récupérer toutes les réservations avec filtres
   */
  static async updatePassedReservations(): Promise<void> {
    // Mettre à jour automatiquement le statut des réservations dont la date de fin est passée
    await pool.query(
      `UPDATE reservations 
       SET status = 'passed', updated_at = CURRENT_TIMESTAMP
       WHERE status IN ('active', 'modified') 
       AND end_time < NOW()`,
    );
  }

  static async getAllReservations(
    userId?: string,
    resourceId?: string,
    status?: ReservationStatus,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50,
    offset: number = 0,
    excludeCancelled: boolean = false,
  ): Promise<{ reservations: Reservation[]; total: number }> {
    // Mettre à jour les réservations passées
    await this.updatePassedReservations();

    let query = `
      SELECT 
        reservations.*,
        json_build_object(
          'id', resources.id,
          'name', resources.name,
          'description', resources.description,
          'location', resources.location,
          'capacity', resources.capacity,
          'active', resources.active
        ) as resource,
        json_build_object(
          'id', users.id,
          'email', users.email,
          'fullName', users.full_name,
          'role', users.role
        ) as user
      FROM reservations
      LEFT JOIN resources ON reservations.resource_id = resources.id
      LEFT JOIN users ON reservations.user_id = users.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (userId) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (resourceId) {
      query += ` AND resource_id = $${paramIndex}`;
      params.push(resourceId);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (excludeCancelled) {
      query += ` AND status != 'cancelled'`;
      query += ` AND end_time >= NOW()`;
    }

    if (startDate) {
      query += ` AND end_time >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND start_time <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    // Compter le total
    const countQuery = query
      .replace(
        /SELECT[\s\S]+?FROM reservations/,
        "SELECT COUNT(*) as count FROM reservations",
      )
      .replace(/LEFT JOIN[\s\S]+?WHERE/, "WHERE");
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Ajouter pagination
    query += ` ORDER BY start_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query<Reservation>(query, params);

    return {
      reservations: result.rows,
      total,
    };
  }

  /**
   * Récupérer une réservation par ID
   */
  static async getReservationById(
    id: string,
    userId?: string,
  ): Promise<Reservation> {
    // Mettre à jour les réservations passées
    await this.updatePassedReservations();

    console.log("[GET RESERVATION BY ID] ID:", id, "UserID:", userId);

    let query = `
      SELECT 
        reservations.*,
        json_build_object(
          'id', resources.id,
          'name', resources.name,
          'description', resources.description,
          'location', resources.location,
          'capacity', resources.capacity,
          'active', resources.active
        ) as resource,
        json_build_object(
          'id', users.id,
          'email', users.email,
          'fullName', users.full_name,
          'role', users.role
        ) as user
      FROM reservations
      LEFT JOIN resources ON reservations.resource_id = resources.id
      LEFT JOIN users ON reservations.user_id = users.id
      WHERE reservations.id = $1
    `;
    const params: any[] = [id];

    if (userId) {
      query += " AND reservations.user_id = $2";
      params.push(userId);
    }

    const result = await pool.query<Reservation>(query, params);

    if (result.rows.length === 0) {
      throw new NotFoundError("Réservation non trouvée");
    }

    return result.rows[0];
  }

  /**
   * Créer une nouvelle réservation
   */
  static async createReservation(
    userId: string,
    data: CreateReservationRequest,
  ): Promise<Reservation> {
    // Valider les dates
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (startTime >= endTime) {
      throw new BusinessError(
        "La date de début doit être antérieure à la date de fin",
      );
    }

    if (startTime < new Date()) {
      throw new BusinessError("Impossible de réserver dans le passé");
    }

    // Vérifier la disponibilité (lance une exception avec message détaillé si non disponible)
    await ResourceService.checkAvailability(
      data.resourceId,
      startTime,
      endTime,
    );

    // Créer la réservation
    const result = await pool.query<Reservation>(
      `INSERT INTO reservations (user_id, resource_id, start_time, end_time, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [userId, data.resourceId, startTime, endTime, data.notes || null],
    );

    const reservation = result.rows[0];

    // Envoyer l'email de confirmation
    this.sendReservationEmails(reservation, "created").catch((error) =>
      console.error("Erreur lors de l'envoi des emails:", error),
    );

    return reservation;
  }

  /**
   * Mettre à jour une réservation
   */
  static async updateReservation(
    id: string,
    userId: string,
    isAdmin: boolean,
    data: UpdateReservationRequest,
  ): Promise<Reservation> {
    console.log("[UPDATE RESERVATION] Starting update for ID:", id);
    console.log("[UPDATE RESERVATION] Data:", JSON.stringify(data));

    // Récupérer la réservation existante
    const existing = isAdmin
      ? await this.getReservationById(id)
      : await this.getReservationById(id, userId);

    console.log(
      "[UPDATE RESERVATION] Existing reservation found, status:",
      existing.status,
    );

    // Vérifier que la réservation est active ou modified (pour les anciennes réservations)
    if (existing.status !== "active" && existing.status !== "modified") {
      throw new BusinessError(
        "Impossible de modifier une réservation qui n'est pas active",
      );
    }

    // Si modification des dates
    if (data.startTime || data.endTime) {
      const existingStartTime =
        (existing as any).start_time || existing.startTime;
      const existingEndTime = (existing as any).end_time || existing.endTime;
      const startTime = data.startTime
        ? new Date(data.startTime)
        : new Date(existingStartTime);
      const endTime = data.endTime
        ? new Date(data.endTime)
        : new Date(existingEndTime);

      if (startTime >= endTime) {
        throw new BusinessError(
          "La date de début doit être antérieure à la date de fin",
        );
      }

      if (startTime < new Date()) {
        throw new BusinessError("Impossible de réserver dans le passé");
      }

      const resourceId = (existing as any).resource_id || existing.resourceId;
      console.log("[UPDATE RESERVATION] Resource ID:", resourceId);
      await ResourceService.checkAvailability(
        resourceId,
        startTime,
        endTime,
        id,
      );
    }

    // Construire la requête de mise à jour
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.resourceId !== undefined) {
      // Vérifier la disponibilité pour la nouvelle ressource
      const existingStartTime =
        (existing as any).start_time || existing.startTime;
      const existingEndTime = (existing as any).end_time || existing.endTime;
      const startTime = data.startTime
        ? new Date(data.startTime)
        : new Date(existingStartTime);
      const endTime = data.endTime
        ? new Date(data.endTime)
        : new Date(existingEndTime);

      await ResourceService.checkAvailability(
        data.resourceId,
        startTime,
        endTime,
      );

      updates.push(`resource_id = $${paramIndex}`);
      values.push(data.resourceId);
      paramIndex++;
    }

    if (data.startTime !== undefined) {
      updates.push(`start_time = $${paramIndex}`);
      values.push(new Date(data.startTime));
      paramIndex++;
    }

    if (data.endTime !== undefined) {
      updates.push(`end_time = $${paramIndex}`);
      values.push(new Date(data.endTime));
      paramIndex++;
    }

    if (data.notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      values.push(data.notes);
      paramIndex++;
    }

    // La réservation reste 'active' après modification
    // (pas de changement de status)

    if (updates.length === 0) {
      return existing;
    }

    values.push(id);
    const result = await pool.query<Reservation>(
      `UPDATE reservations 
       SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      values,
    );

    const reservation = result.rows[0];

    // Envoyer l'email de modification (sans await)
    this.sendReservationEmails(reservation, "updated").catch((error) =>
      console.error("Erreur lors de l'envoi des emails:", error),
    );

    return reservation;
  }

  /**
   * Annuler une réservation
   */
  static async cancelReservation(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<Reservation> {
    // Récupérer la réservation
    const existing = isAdmin
      ? await this.getReservationById(id)
      : await this.getReservationById(id, userId);

    // Vérifier que la réservation est active ou modified (pour les anciennes réservations)
    if (existing.status !== "active" && existing.status !== "modified") {
      throw new BusinessError(
        "Impossible d'annuler une réservation qui n'est pas active",
      );
    }

    // Annuler la réservation
    const result = await pool.query<Reservation>(
      `UPDATE reservations 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    const reservation = result.rows[0];

    // Envoyer l'email d'annulation (sans await)
    this.sendReservationEmails(reservation, "cancelled").catch((error) =>
      console.error("Erreur lors de l'envoi des emails:", error),
    );

    return reservation;
  }

  /**
   * Supprimer une réservation (admin uniquement)
   */
  static async deleteReservation(id: string): Promise<void> {
    const result = await pool.query("DELETE FROM reservations WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      throw new NotFoundError("Réservation non trouvée");
    }
  }

  /**
   * Récupérer l'historique des réservations d'un utilisateur
   */
  static async getUserReservationHistory(
    userId: string,
    includeActive: boolean = false,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ reservations: Reservation[]; total: number }> {
    // Mettre à jour les réservations passées
    await this.updatePassedReservations();

    let query = `
      SELECT reservations.*, 
             json_build_object(
               'id', resources.id,
               'name', resources.name,
               'description', resources.description,
               'capacity', resources.capacity,
               'location', resources.location,
               'active', resources.active
             ) as resource,
             json_build_object(
               'id', users.id,
               'email', users.email,
               'fullName', users.full_name,
               'role', users.role
             ) as user
      FROM reservations
      LEFT JOIN resources ON reservations.resource_id = resources.id
      LEFT JOIN users ON reservations.user_id = users.id
      WHERE reservations.user_id = $1
    `;

    if (!includeActive) {
      // Inclure toutes les réservations sauf celles qui sont actives/modifiées ET dont la date n'est pas passée
      query += ` AND (reservations.status IN ('cancelled', 'passed') OR reservations.end_time < NOW())`;
    }

    // Compter le total
    const countQuery =
      `
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE user_id = $1
    ` +
      (includeActive
        ? ""
        : ` AND (status IN ('cancelled', 'passed') OR end_time < NOW())`);

    const countResult = await pool.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].count);

    // Ajouter pagination
    query += ` ORDER BY reservations.start_time DESC LIMIT $2 OFFSET $3`;

    const result = await pool.query<Reservation>(query, [
      userId,
      limit,
      offset,
    ]);

    return {
      reservations: result.rows,
      total,
    };
  }

  /**
   * Marquer les réservations passées
   */
  static async markPassedReservations(): Promise<number> {
    const result = await pool.query(
      `UPDATE reservations 
       SET status = 'passed'
       WHERE status IN ('active', 'modified') 
         AND end_time < NOW()`,
    );

    return result.rowCount || 0;
  }

  /**
   * Envoyer les emails liés à une réservation
   */
  private static async sendReservationEmails(
    reservation: Reservation,
    action: "created" | "updated" | "cancelled",
  ): Promise<void> {
    try {
      // Handle both camelCase and snake_case from database
      const resourceId =
        (reservation as any).resource_id || reservation.resourceId;
      const userId = (reservation as any).user_id || reservation.userId;

      // Récupérer les informations de la ressource
      const resource = await ResourceService.getResourceById(resourceId);

      // Récupérer les informations de l'utilisateur
      const userResult = await pool.query<User>(
        "SELECT * FROM users WHERE id = $1",
        [userId],
      );

      if (userResult.rows.length === 0) {
        console.error(
          "Utilisateur non trouvé pour la réservation",
          reservation.id,
        );
        return;
      }

      const user = userResult.rows[0];

      // Envoyer l'email à l'utilisateur
      if (action === "created") {
        await EmailService.sendReservationCreatedEmail(
          user,
          reservation,
          resource,
        );
      } else if (action === "updated") {
        await EmailService.sendReservationUpdatedEmail(
          user,
          reservation,
          resource,
        );
      } else if (action === "cancelled") {
        await EmailService.sendReservationCancelledEmail(
          user,
          reservation,
          resource,
        );
      }

      // Envoyer une notification à l'admin
      await EmailService.sendAdminNotification(
        `Réservation ${action === "created" ? "créée" : action === "updated" ? "modifiée" : "annulée"}`,
        reservation,
        resource,
        user,
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi des emails:", error);
      // Ne pas propager l'erreur pour ne pas bloquer l'opération principale
    }
  }
}
