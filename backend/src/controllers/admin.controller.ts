import { Response } from "express";
import { pool } from "../config/database.js";
import { sendTestEmail } from "../config/email.js";
import { ReservationService } from "../services/reservation.service.js";
import { toCamelCase } from "../utils/caseConverter.js";
import {
  AuthenticatedRequest,
  ReservationQueryParams,
  Statistics,
} from "../types/index.js";

/**
 * Contrôleur pour les endpoints admin
 */
export class AdminController {
  /**
   * GET /api/admin/reservations
   * Récupérer toutes les réservations (tous utilisateurs)
   */
  static async getAllReservations(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const query = req.query as unknown as ReservationQueryParams;
      const limit = query.limit ? parseInt(query.limit as string) : 50;
      const offset = query.offset ? parseInt(query.offset as string) : 0;

      const result = await ReservationService.getAllReservations(
        query.userId, // Pas de filtre par défaut, admin voit tout
        query.resourceId,
        query.status,
        query.startDate ? new Date(query.startDate as string) : undefined,
        query.endDate ? new Date(query.endDate as string) : undefined,
        limit,
        offset,
      );

      res.json({
        reservations: toCamelCase(result.reservations),
        total: result.total,
        limit,
        offset,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la récupération des réservations",
      });
    }
  }

  /**
   * GET /api/admin/reservations/:id
   * Récupérer une réservation par ID (sans filtre utilisateur)
   */
  static async getReservationById(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const reservation = await ReservationService.getReservationById(
        req.params.id,
        // Pas de userId, l'admin peut voir toutes les réservations
      );
      res.json(toCamelCase(reservation));
    } catch (error) {
      if (
        error instanceof Error &&
        error.constructor.name === "NotFoundError"
      ) {
        res.status(404).json({
          error: "Not Found",
          message: error.message,
        });
      } else {
        console.error(
          "Erreur lors de la récupération de la réservation:",
          error,
        );
        res.status(500).json({
          error: "Internal Server Error",
          message: "Erreur lors de la récupération de la réservation",
        });
      }
    }
  }

  /**
   * DELETE /api/admin/reservations/:id
   * Supprimer définitivement une réservation
   */
  static async deleteReservation(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      await ReservationService.deleteReservation(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        error.constructor.name === "NotFoundError"
      ) {
        res.status(404).json({
          error: "Not Found",
          message: error.message,
        });
      } else {
        console.error(
          "Erreur lors de la suppression de la réservation:",
          error,
        );
        res.status(500).json({
          error: "Internal Server Error",
          message: "Erreur lors de la suppression de la réservation",
        });
      }
    }
  }

  /**
   * GET /api/admin/statistics
   * Récupérer les statistiques globales
   */
  static async getStatistics(
    _req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      // Statistiques des ressources
      const resourcesStats = await pool.query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE active = true)::int as active,
          COUNT(*) FILTER (WHERE active = false)::int as inactive
        FROM resources
      `);

      // Statistiques des réservations
      const reservationsStats = await pool.query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'active')::int as active,
          COUNT(*) FILTER (WHERE status = 'modified')::int as modified,
          COUNT(*) FILTER (WHERE status = 'cancelled')::int as cancelled,
          COUNT(*) FILTER (WHERE status = 'passed')::int as passed
        FROM reservations
      `);

      // Statistiques des utilisateurs
      const usersStats = await pool.query(`
        SELECT COUNT(*)::int as total
        FROM users
      `);

      // Statistiques des emails
      const emailsStats = await pool.query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'sent')::int as sent,
          COUNT(*) FILTER (WHERE status = 'failed')::int as failed,
          COUNT(*) FILTER (WHERE status = 'pending')::int as pending
        FROM email_notifications
      `);

      // Réservations par ressource (top 5)
      const reservationsByResource = await pool.query(`
        SELECT 
          r.id as "resourceId",
          r.name as "resourceName",
          COUNT(res.id)::int as "reservationCount"
        FROM resources r
        LEFT JOIN reservations res ON r.id = res.resource_id
        GROUP BY r.id, r.name
        ORDER BY "reservationCount" DESC
        LIMIT 5
      `);

      // Réservations par utilisateur (top 5)
      const reservationsByUser = await pool.query(`
        SELECT 
          u.clerk_id as "userId",
          u.full_name as "userName",
          COUNT(r.id)::int as "reservationCount"
        FROM users u
        LEFT JOIN reservations r ON u.clerk_id = r.user_id
        GROUP BY u.clerk_id, u.full_name
        ORDER BY "reservationCount" DESC
        LIMIT 5
      `);

      const statistics: Statistics = {
        resources: resourcesStats.rows[0],
        reservations: reservationsStats.rows[0],
        users: usersStats.rows[0],
        emails: emailsStats.rows[0],
        topResourcesByReservations: reservationsByResource.rows,
        topUsersByReservations: reservationsByUser.rows,
      };

      res.json(toCamelCase(statistics));
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la récupération des statistiques",
      });
    }
  }

  /**
   * POST /api/admin/maintenance/update-past-reservations
   * Marquer les réservations passées (tâche de maintenance)
   */
  static async updatePastReservations(
    _req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const count = await ReservationService.markPassedReservations();
      res.json({
        message: `${count} réservation(s) marquée(s) comme passée(s)`,
        count,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour des réservations passées:",
        error,
      );
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la mise à jour des réservations passées",
      });
    }
  }

  /**
   * POST /api/admin/test-email
   * Envoyer un email de test pour vérifier la configuration SMTP
   */
  static async sendTestEmail(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          error: "Bad Request",
          message: "L'adresse email est requise",
        });
        return;
      }

      const result = await sendTestEmail(email);

      if (result.success) {
        res.json({
          success: true,
          message: `Email de test envoyé à ${email}`,
          messageId: result.messageId,
          attempts: result.attempts,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Email Send Failed",
          message: `Échec de l'envoi après ${result.attempts} tentative(s)`,
          details: result.error,
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de test:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de l'envoi de l'email de test",
      });
    }
  }

  /**
   * GET /api/admin/email-logs
   * Récupérer les logs d'envoi d'emails
   */
  static async getEmailLogs(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { status, limit = 50, offset = 0 } = req.query;

      let query = "SELECT * FROM email_notifications WHERE 1=1";
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

      // Ajouter pagination et tri
      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      res.json({
        logs: toCamelCase(result.rows),
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des logs:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la récupération des logs d'emails",
      });
    }
  }
}
