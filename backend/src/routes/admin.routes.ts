import { Router } from "express";
import { query, param, body } from "express-validator";
import { AdminController } from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validateRequest.js";

const router = Router();

/**
 * GET /api/admin/reservations
 * Récupérer toutes les réservations (tous utilisateurs)
 * Requires: Admin
 */
router.get(
  "/reservations",
  requireAdmin,
  [
    query("userId")
      .optional()
      .isString()
      .withMessage("ID utilisateur invalide"),
    query("resourceId")
      .optional()
      .isUUID()
      .withMessage("ID de ressource invalide"),
    query("status")
      .optional()
      .isIn(["active", "modified", "cancelled", "passed"])
      .withMessage("Status invalide"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("startDate doit être au format ISO 8601"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("endDate doit être au format ISO 8601"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit doit être entre 1 et 100"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset doit être >= 0"),
    validate,
  ],
  AdminController.getAllReservations,
);

/**
 * GET /api/admin/reservations/:id
 * Récupérer une réservation par ID
 * Requires: Admin
 */
router.get(
  "/reservations/:id",
  requireAdmin,
  [param("id").isUUID().withMessage("ID de réservation invalide"), validate],
  AdminController.getReservationById,
);

/**
 * DELETE /api/admin/reservations/:id
 * Supprimer définitivement une réservation
 * Requires: Admin
 */
router.delete(
  "/reservations/:id",
  requireAdmin,
  [param("id").isUUID().withMessage("ID de réservation invalide"), validate],
  AdminController.deleteReservation,
);

/**
 * GET /api/admin/statistics
 * Récupérer les statistiques globales
 * Requires: Admin
 */
router.get("/statistics", requireAdmin, AdminController.getStatistics);

/**
 * POST /api/admin/maintenance/update-past-reservations
 * Marquer les réservations passées
 * Requires: Admin
 */
router.post(
  "/maintenance/update-past-reservations",
  requireAdmin,
  AdminController.updatePastReservations,
);

/**
 * POST /api/admin/test-email
 * Envoyer un email de test
 * Requires: Admin
 */
router.post(
  "/test-email",
  requireAdmin,
  [
    body("email").notEmpty().isEmail().withMessage("Email valide requis"),
    validate,
  ],
  AdminController.sendTestEmail,
);

/**
 * GET /api/admin/email-logs
 * Récupérer les logs d'envoi d'emails
 * Requires: Admin
 */
router.get(
  "/email-logs",
  requireAdmin,
  [
    query("status")
      .optional()
      .isIn(["sent", "failed", "pending"])
      .withMessage("Status invalide"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit doit être entre 1 et 100"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset doit être >= 0"),
    validate,
  ],
  AdminController.getEmailLogs,
);

/**
 * POST /api/admin/test-reminder
 * Envoyer un email de rappel de test
 * Requires: Admin
 */
router.post(
  "/test-reminder",
  requireAdmin,
  [
    body("reservationId")
      .notEmpty()
      .isUUID()
      .withMessage("ID de réservation valide requis"),
    validate,
  ],
  AdminController.sendTestReminder,
);

/**
 * POST /api/admin/test-critical-incident
 * Envoyer un email d'alerte critique de test
 * Requires: Admin
 */
router.post(
  "/test-critical-incident",
  requireAdmin,
  [
    body("incidentType")
      .notEmpty()
      .isString()
      .withMessage("Type d'incident requis"),
    body("details").notEmpty().isString().withMessage("Détails requis"),
    validate,
  ],
  AdminController.sendTestCriticalIncident,
);

/**
 * POST /api/admin/check-reminders
 * Vérifier manuellement et envoyer les rappels (pour test/debug)
 * Requires: Admin
 */
router.post("/check-reminders", requireAdmin, AdminController.checkReminders);

export default router;
