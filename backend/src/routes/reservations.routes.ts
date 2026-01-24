import { Router } from "express";
import { body, query, param } from "express-validator";
import { ReservationsController } from "../controllers/reservations.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validateRequest.js";

const router = Router();

/**
 * GET /api/reservations
 * Récupérer toutes les réservations de l'utilisateur connecté
 * Requires: Authentication
 */
router.get(
  "/",
  requireAuth,
  [
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
  ReservationsController.getMyReservations,
);

/**
 * GET /api/reservations/history
 * Récupérer l'historique des réservations de l'utilisateur
 * Requires: Authentication
 */
router.get(
  "/history",
  requireAuth,
  [
    query("includeActive")
      .optional()
      .isBoolean()
      .withMessage("includeActive doit être un booléen"),
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
  ReservationsController.getMyHistory,
);

/**
 * GET /api/reservations/:id
 * Récupérer une réservation par ID
 * Requires: Authentication
 */
router.get(
  "/:id",
  requireAuth,
  [param("id").isUUID().withMessage("ID de réservation invalide"), validate],
  ReservationsController.getReservationById,
);

/**
 * POST /api/reservations
 * Créer une nouvelle réservation
 * Requires: Authentication
 */
router.post(
  "/",
  requireAuth,
  [
    body("resourceId")
      .notEmpty()
      .isUUID()
      .withMessage("ID de ressource requis et valide"),
    body("startTime")
      .notEmpty()
      .isISO8601()
      .withMessage("startTime est requis et doit être au format ISO 8601"),
    body("endTime")
      .notEmpty()
      .isISO8601()
      .withMessage("endTime est requis et doit être au format ISO 8601"),
    body("numberOfPeople")
      .optional()
      .isInt({ min: 1 })
      .withMessage("numberOfPeople doit être un entier >= 1"),
    body("notes")
      .optional()
      .isString()
      .trim()
      .withMessage("Les notes doivent être une chaîne"),
    validate,
  ],
  ReservationsController.createReservation,
);

/**
 * PUT /api/reservations/:id
 * Mettre à jour une réservation
 * Requires: Authentication
 */
router.put(
  "/:id",
  requireAuth,
  [
    param("id").isUUID().withMessage("ID de réservation invalide"),
    body("resourceId")
      .optional()
      .isUUID()
      .withMessage("ID de ressource invalide"),
    body("startTime")
      .optional()
      .isISO8601()
      .withMessage("startTime doit être au format ISO 8601"),
    body("endTime")
      .optional()
      .isISO8601()
      .withMessage("endTime doit être au format ISO 8601"),
    body("numberOfPeople")
      .optional()
      .isInt({ min: 1 })
      .withMessage("numberOfPeople doit être un entier >= 1"),
    body("notes")
      .optional()
      .isString()
      .trim()
      .withMessage("Les notes doivent être une chaîne"),
    validate,
  ],
  ReservationsController.updateReservation,
);

/**
 * DELETE /api/reservations/:id
 * Annuler une réservation
 * Requires: Authentication
 */
router.delete(
  "/:id",
  requireAuth,
  [param("id").isUUID().withMessage("ID de réservation invalide"), validate],
  ReservationsController.cancelReservation,
);

export default router;
