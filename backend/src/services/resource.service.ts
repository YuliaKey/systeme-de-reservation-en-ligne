import { pool } from "../config/database.js";
import {
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
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
    active?: boolean,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ resources: Resource[]; total: number }> {
    let query = `
      SELECT * FROM resources
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (active !== undefined) {
      query += ` AND active = $${paramIndex}`;
      params.push(active);
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
   * Rechercher les salles disponibles par ville et dates
   */
  static async searchAvailableResources(
    city: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Resource[]> {
    // Récupérer toutes les salles actives de la ville
    const query = `
      SELECT r.* 
      FROM resources r
      WHERE r.city = $1 
        AND r.active = true
        AND NOT EXISTS (
          SELECT 1 FROM reservations res
          WHERE res.resource_id = r.id
            AND res.status = 'active'
            AND (
              (res.start_time <= $2 AND res.end_time > $2)
              OR (res.start_time < $3 AND res.end_time >= $3)
              OR (res.start_time >= $2 AND res.end_time <= $3)
            )
        )
      ORDER BY r.name ASC
    `;

    const result = await pool.query<Resource>(query, [
      city,
      startTime,
      endTime,
    ]);

    return result.rows;
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
    this.validateAvailabilityRules(data.availability);

    const result = await pool.query<Resource>(
      `INSERT INTO resources (name, description, location, city, capacity, images, price_per_hour, amenities, availability, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.name,
        data.description || null,
        data.location || null,
        data.city,
        data.capacity,
        data.images ? JSON.stringify(data.images) : "[]",
        data.pricePerHour || null,
        data.amenities ? JSON.stringify(data.amenities) : null,
        JSON.stringify(data.availability),
        data.active !== undefined ? data.active : true,
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
        "SELECT id, name FROM resources WHERE LOWER(name) = LOWER($1) AND id != $2",
        [data.name, id],
      );

      if (existing.rows.length > 0) {
        throw new ConflictError(
          `Une ressource avec le nom "${existing.rows[0].name}" existe déjà`,
        );
      }
    }

    // Valider les règles de disponibilité si fournies
    if (data.availability) {
      this.validateAvailabilityRules(data.availability);
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

    if (data.city !== undefined) {
      updates.push(`city = $${paramIndex}`);
      values.push(data.city);
      paramIndex++;
    }

    if (data.capacity !== undefined) {
      updates.push(`capacity = $${paramIndex}`);
      values.push(data.capacity);
      paramIndex++;
    }

    if (data.images !== undefined) {
      updates.push(`images = $${paramIndex}`);
      values.push(JSON.stringify(data.images));
      paramIndex++;
    }

    if (data.pricePerHour !== undefined) {
      updates.push(`price_per_hour = $${paramIndex}`);
      values.push(data.pricePerHour);
      paramIndex++;
    }

    if (data.amenities !== undefined) {
      updates.push(`amenities = $${paramIndex}`);
      values.push(JSON.stringify(data.amenities));
      paramIndex++;
    }

    if (data.availability !== undefined) {
      updates.push(`availability = $${paramIndex}`);
      values.push(JSON.stringify(data.availability));
      paramIndex++;
    }

    if (data.active !== undefined) {
      updates.push(`active = $${paramIndex}`);
      values.push(data.active);
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

    // Vérifier que la ressource est disponible (active)
    if (!resource.active) {
      throw new BusinessError(
        "Cette ressource n'est pas disponible à la réservation",
      );
    }

    // Vérifier les règles de disponibilité (si elles existent)
    if (resource.availability) {
      const validationError = this.validateTimeAgainstRules(
        startTime,
        endTime,
        resource.availability,
      );
      if (validationError) {
        throw new BusinessError(validationError);
      }
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

    if (conflictCount > 0) {
      throw new ConflictError(
        "Cette ressource est déjà réservée pour cette période",
      );
    }

    return true;
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
   * Valider une période contre les règles de disponibilité
   * Retourne un message d'erreur spécifique ou null si valide
   */
  private static validateTimeAgainstRules(
    startTime: Date,
    endTime: Date,
    rules?: AvailabilityRule | null,
  ): string | null {
    // Si pas de règles, la réservation est autorisée
    if (!rules) {
      return null;
    }

    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // en minutes

    // Vérifier la durée minimale
    if (rules.minDuration && duration < rules.minDuration) {
      return `La durée de réservation doit être d'au moins ${rules.minDuration} minutes (${Math.floor(rules.minDuration / 60)}h${rules.minDuration % 60 > 0 ? (rules.minDuration % 60).toString().padStart(2, "0") : ""})`;
    }

    // Vérifier la durée maximale
    if (rules.maxDuration && duration > rules.maxDuration) {
      return `La durée de réservation ne peut pas dépasser ${rules.maxDuration} minutes (${Math.floor(rules.maxDuration / 60)}h${rules.maxDuration % 60 > 0 ? (rules.maxDuration % 60).toString().padStart(2, "0") : ""})`;
    }

    // Vérifier le jour de la semaine
    if (rules.daysOfWeek && Array.isArray(rules.daysOfWeek)) {
      const dayOfWeek = startTime.getDay();
      if (!rules.daysOfWeek.includes(dayOfWeek)) {
        const daysNames = [
          "Dimanche",
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
        ];
        const allowedDays = rules.daysOfWeek
          .map((d) => daysNames[d])
          .join(", ");
        return `Cette ressource n'est disponible que les jours suivants: ${allowedDays}`;
      }
    }

    // Vérifier les plages horaires
    if (rules.timeRanges && Array.isArray(rules.timeRanges)) {
      const startHour = startTime.getHours() + startTime.getMinutes() / 60;
      const endHour = endTime.getHours() + endTime.getMinutes() / 60;

      // Helper to parse time (handles both string "HH:MM" and number formats)
      const parseTime = (time: string | number): number => {
        if (typeof time === "number") return time;
        if (typeof time === "string") {
          const [hours, minutes] = time.split(":").map(Number);
          return hours + minutes / 60;
        }
        return 0;
      };

      let isWithinRange = false;
      for (const range of rules.timeRanges) {
        const rangeStart = parseTime(range.start);
        const rangeEnd = parseTime(range.end);
        if (startHour >= rangeStart && endHour <= rangeEnd) {
          isWithinRange = true;
          break;
        }
      }

      if (!isWithinRange) {
        const ranges = rules.timeRanges
          .map((r) => {
            // Format time for display (handles both formats)
            if (typeof r.start === "string" && typeof r.end === "string") {
              return `${r.start} - ${r.end}`;
            }
            const startH = Math.floor(r.start);
            const startM = Math.round((r.start - startH) * 60);
            const endH = Math.floor(r.end);
            const endM = Math.round((r.end - endH) * 60);
            return `${startH.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")} - ${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
          })
          .join(", ");
        return `Cette ressource n'est disponible que pendant les plages horaires suivantes: ${ranges}`;
      }
    }

    return null;
  }
}
