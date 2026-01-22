import { pool } from "../config/database.js";
import {
  Reservation,
  CreateReservationRequest,
  UpdateReservationRequest,
  ReservationStatus,
  User,
} from "../types/index.js";
import {
  NotFoundError,
  ConflictError,
  BusinessError,
} from "../middleware/errorHandler.js";
import { ResourceService } from "./resource.service.js";
import { EmailService } from "./email.service.js";

/**
 * Service pour gérer les réservations
 */
export class ReservationService {
  /**
   * Récupérer toutes les réservations avec filtres
   */
  static async getAllReservations(
    userId?: string,
    resourceId?: string,
    status?: ReservationStatus,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ reservations: Reservation[]; total: number }> {
    let query = `
      SELECT * FROM reservations
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
    const countResult = await pool.query(
      query.replace("*", "COUNT(*) as count"),
      params,
    );
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
    let query = "SELECT * FROM reservations WHERE id = $1";
    const params: any[] = [id];

    if (userId) {
      query += " AND user_id = $2";
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

    // Vérifier la disponibilité
    const isAvailable = await ResourceService.checkAvailability(
      data.resourceId,
      startTime,
      endTime,
    );

    if (!isAvailable) {
      throw new ConflictError(
        "La ressource n'est pas disponible pour cette période",
      );
    }

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
    // Récupérer la réservation existante
    const existing = isAdmin
      ? await this.getReservationById(id)
      : await this.getReservationById(id, userId);

    // Vérifier que la réservation est active
    if (existing.status !== "active") {
      throw new BusinessError(
        "Impossible de modifier une réservation qui n'est pas active",
      );
    }

    // Si modification des dates
    if (data.startTime || data.endTime) {
      const startTime = data.startTime
        ? new Date(data.startTime)
        : existing.startTime;
      const endTime = data.endTime ? new Date(data.endTime) : existing.endTime;

      if (startTime >= endTime) {
        throw new BusinessError(
          "La date de début doit être antérieure à la date de fin",
        );
      }

      if (startTime < new Date()) {
        throw new BusinessError("Impossible de réserver dans le passé");
      }

      // Vérifier la disponibilité (en excluant la réservation actuelle)
      const isAvailable = await ResourceService.checkAvailability(
        existing.resourceId,
        startTime,
        endTime,
        id,
      );

      if (!isAvailable) {
        throw new ConflictError(
          "La ressource n'est pas disponible pour cette période",
        );
      }
    }

    // Construire la requête de mise à jour
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.resourceId !== undefined) {
      // Vérifier la disponibilité pour la nouvelle ressource
      const startTime = data.startTime
        ? new Date(data.startTime)
        : existing.startTime;
      const endTime = data.endTime ? new Date(data.endTime) : existing.endTime;

      const isAvailable = await ResourceService.checkAvailability(
        data.resourceId,
        startTime,
        endTime,
      );

      if (!isAvailable) {
        throw new ConflictError(
          "La nouvelle ressource n'est pas disponible pour cette période",
        );
      }

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

    // Marquer comme modifiée
    updates.push(`status = 'modified'`);

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

    // Vérifier que la réservation est active ou modifiée
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
    let query = `
      SELECT * FROM reservations
      WHERE user_id = $1
    `;

    if (!includeActive) {
      query += ` AND (status != 'active' OR end_time < NOW())`;
    }

    // Compter le total
    const countResult = await pool.query(
      query.replace("*", "COUNT(*) as count"),
      [userId],
    );
    const total = parseInt(countResult.rows[0].count);

    // Ajouter pagination
    query += ` ORDER BY start_time DESC LIMIT $2 OFFSET $3`;

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
      // Récupérer les informations de la ressource
      const resource = await ResourceService.getResourceById(
        reservation.resourceId,
      );

      // Récupérer les informations de l'utilisateur
      const userResult = await pool.query<User>(
        "SELECT * FROM users WHERE id = $1",
        [reservation.userId],
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
