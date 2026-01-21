import { pool } from "../config/database.js";
import {
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceStatus,
  AvailabilityRule,
} from "../types/index.js";
import {
  NotFoundError,
  ConflictError,
  BusinessError,
} from "../middleware/errorHandler.js";

/**
 * Service pour gérer les ressources
 */
export class ResourceService {
  /**
   * Récupérer toutes les ressources avec filtres
   */
  static async getAllResources(
    status?: ResourceStatus,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ resources: Resource[]; total: number }> {
    let query = `
      SELECT * FROM resources
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Compter le total
    const countResult = await pool.query(
      query.replace("*", "COUNT(*) as count"),
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    // Ajouter pagination
    query += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query<Resource>(query, params);

    return {
      resources: result.rows,
      total,
    };
  }

  /**
   * Récupérer une ressource par ID
   */
  static async getResourceById(id: string): Promise<Resource> {
    const result = await pool.query<Resource>(
      "SELECT * FROM resources WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundError("Ressource non trouvée");
    }

    return result.rows[0];
  }

  /**
   * Créer une nouvelle ressource
   */
  static async createResource(data: CreateResourceRequest): Promise<Resource> {
    // Vérifier l'unicité du nom
    const existing = await pool.query(
      "SELECT id FROM resources WHERE name = $1",
      [data.name],
    );

    if (existing.rows.length > 0) {
      throw new ConflictError("Une ressource avec ce nom existe déjà");
    }

    // Valider les règles de disponibilité
    this.validateAvailabilityRules(data.availabilityRules);

    const result = await pool.query<Resource>(
      `INSERT INTO resources (name, description, location, capacity, image_url, availability_rules, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.name,
        data.description || null,
        data.location || null,
        data.capacity,
        data.imageUrl || null,
        JSON.stringify(data.availabilityRules),
        data.status || "available",
      ],
    );

    return result.rows[0];
  }

  /**
   * Mettre à jour une ressource
   */
  static async updateResource(
    id: string,
    data: UpdateResourceRequest,
  ): Promise<Resource> {
    // Vérifier que la ressource existe
    await this.getResourceById(id);

    // Si le nom change, vérifier l'unicité
    if (data.name) {
      const existing = await pool.query(
        "SELECT id FROM resources WHERE name = $1 AND id != $2",
        [data.name, id],
      );

      if (existing.rows.length > 0) {
        throw new ConflictError("Une ressource avec ce nom existe déjà");
      }
    }

    // Valider les règles de disponibilité si fournies
    if (data.availabilityRules) {
      this.validateAvailabilityRules(data.availabilityRules);
    }

    // Construire la requête de mise à jour dynamiquement
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(data.name);
      paramIndex++;
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(data.description);
      paramIndex++;
    }

    if (data.location !== undefined) {
      updates.push(`location = $${paramIndex}`);
      values.push(data.location);
      paramIndex++;
    }

    if (data.capacity !== undefined) {
      updates.push(`capacity = $${paramIndex}`);
      values.push(data.capacity);
      paramIndex++;
    }

    if (data.imageUrl !== undefined) {
      updates.push(`image_url = $${paramIndex}`);
      values.push(data.imageUrl);
      paramIndex++;
    }

    if (data.availabilityRules !== undefined) {
      updates.push(`availability_rules = $${paramIndex}`);
      values.push(JSON.stringify(data.availabilityRules));
      paramIndex++;
    }

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(data.status);
      paramIndex++;
    }

    if (updates.length === 0) {
      // Aucune mise à jour, retourner la ressource existante
      return this.getResourceById(id);
    }

    values.push(id);
    const result = await pool.query<Resource>(
      `UPDATE resources 
       SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      values,
    );

    return result.rows[0];
  }

  /**
   * Supprimer une ressource
   */
  static async deleteResource(id: string): Promise<void> {
    // Vérifier qu'il n'y a pas de réservations actives
    const activeReservations = await pool.query(
      `SELECT COUNT(*) as count FROM reservations 
       WHERE resource_id = $1 AND status = 'active' AND end_time > NOW()`,
      [id],
    );

    if (parseInt(activeReservations.rows[0].count) > 0) {
      throw new BusinessError(
        "Impossible de supprimer une ressource avec des réservations actives",
      );
    }

    const result = await pool.query("DELETE FROM resources WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      throw new NotFoundError("Ressource non trouvée");
    }
  }

  /**
   * Vérifier la disponibilité d'une ressource sur une période
   */
  static async checkAvailability(
    resourceId: string,
    startTime: Date,
    endTime: Date,
    excludeReservationId?: string,
  ): Promise<boolean> {
    const resource = await this.getResourceById(resourceId);

    // Vérifier que la ressource est disponible
    if (resource.status !== "available") {
      return false;
    }

    // Vérifier les règles de disponibilité
    if (
      !this.isTimeWithinRules(startTime, endTime, resource.availabilityRules)
    ) {
      return false;
    }

    // Vérifier qu'il n'y a pas de conflit avec d'autres réservations
    let query = `
      SELECT COUNT(*) as count FROM reservations
      WHERE resource_id = $1
        AND status = 'active'
        AND (
          (start_time <= $2 AND end_time > $2)
          OR (start_time < $3 AND end_time >= $3)
          OR (start_time >= $2 AND end_time <= $3)
        )
    `;
    const params: any[] = [resourceId, startTime, endTime];

    if (excludeReservationId) {
      query += " AND id != $4";
      params.push(excludeReservationId);
    }

    const result = await pool.query(query, params);
    const conflictCount = parseInt(result.rows[0].count);

    return conflictCount === 0;
  }

  /**
   * Valider les règles de disponibilité
   */
  private static validateAvailabilityRules(rules: unknown): void {
    if (!rules || typeof rules !== "object") {
      throw new BusinessError("Les règles de disponibilité sont requises");
    }

    // Cast vers un type qui peut contenir ces propriétés
    const r = rules as Partial<AvailabilityRule> & Record<string, unknown>;

    // Valider minDuration et maxDuration
    if (
      r.minDuration !== undefined &&
      r.maxDuration !== undefined &&
      typeof r.minDuration === "number" &&
      typeof r.maxDuration === "number"
    ) {
      if (r.minDuration > r.maxDuration) {
        throw new BusinessError(
          "La durée minimale ne peut pas être supérieure à la durée maximale",
        );
      }
    }

    // Valider les jours de la semaine
    if (r.daysOfWeek && Array.isArray(r.daysOfWeek)) {
      const validDays = [0, 1, 2, 3, 4, 5, 6];
      for (const day of r.daysOfWeek) {
        if (!validDays.includes(day)) {
          throw new BusinessError(
            "Les jours de la semaine doivent être entre 0 (dimanche) et 6 (samedi)",
          );
        }
      }
    }

    // Valider les plages horaires
    if (r.timeRanges && Array.isArray(r.timeRanges)) {
      for (const range of r.timeRanges) {
        if (
          !range ||
          typeof range !== "object" ||
          !("start" in range) ||
          !("end" in range)
        ) {
          throw new BusinessError(
            "Chaque plage horaire doit avoir un début et une fin",
          );
        }
        const timeRange = range as { start: number; end: number };
        if (timeRange.start >= timeRange.end) {
          throw new BusinessError(
            "L'heure de début doit être antérieure à l'heure de fin",
          );
        }
      }
    }
  }

  /**
   * Vérifier si une période respecte les règles de disponibilité
   */
  private static isTimeWithinRules(
    startTime: Date,
    endTime: Date,
    rules: AvailabilityRule,
  ): boolean {
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // en minutes

    // Vérifier la durée minimale
    if (rules.minDuration && duration < rules.minDuration) {
      return false;
    }

    // Vérifier la durée maximale
    if (rules.maxDuration && duration > rules.maxDuration) {
      return false;
    }

    // Vérifier le jour de la semaine
    if (rules.daysOfWeek && Array.isArray(rules.daysOfWeek)) {
      const dayOfWeek = startTime.getDay();
      if (!rules.daysOfWeek.includes(dayOfWeek)) {
        return false;
      }
    }

    // Vérifier les plages horaires
    if (rules.timeRanges && Array.isArray(rules.timeRanges)) {
      const startHour = startTime.getHours() + startTime.getMinutes() / 60;
      const endHour = endTime.getHours() + endTime.getMinutes() / 60;

      let isWithinRange = false;
      for (const range of rules.timeRanges) {
        if (startHour >= range.start && endHour <= range.end) {
          isWithinRange = true;
          break;
        }
      }

      if (!isWithinRange) {
        return false;
      }
    }

    return true;
  }
}
