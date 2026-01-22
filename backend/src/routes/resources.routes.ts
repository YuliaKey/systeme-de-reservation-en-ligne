import { Router } from "express";
import { body, query, param } from "express-validator";
import { ResourcesController } from "../controllers/resources.controller.js";
import { requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validateRequest.js";

const router = Router();

/**
 * GET /api/resources
 * Récupérer toutes les ressources
 * Public (ou avec auth optionnelle)
 */
router.get(
  "/",
  [
    query("status")
      .optional()
      .isIn(["available", "maintenance", "unavailable"])
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
  ResourcesController.getAllResources,
);

/**
 * GET /api/resources/:id
 * Récupérer une ressource par ID
 * Public
 */
router.get(
  "/:id",
  [
    param("id").isUUID().withMessage("ID de ressource invalide"),
    validate,
  ],
  ResourcesController.getResourceById,
);

/**
 * GET /api/resources/:id/availability
 * Vérifier la disponibilité d'une ressource
 * Public
 */
router.get(
  "/:id/availability",
  [
    param("id").isUUID().withMessage("ID de ressource invalide"),
    query("startTime")
      .notEmpty()
      .isISO8601()
      .withMessage("startTime est requis et doit être au format ISO 8601"),
    query("endTime")
      .notEmpty()
      .isISO8601()
      .withMessage("endTime est requis et doit être au format ISO 8601"),
    validate,
  ],
  ResourcesController.checkAvailability,
);

/**
 * POST /api/resources
 * Créer une nouvelle ressource
 * Requires: Admin
 */
router.post(
  "/",
  requireAdmin,
  [
    body("name")
      .notEmpty()
      .isString()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Le nom est requis (1-255 caractères)"),
    body("description")
      .optional()
      .isString()
      .trim()
      .withMessage("La description doit être une chaîne"),
    body("location")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Le lieu doit contenir au maximum 255 caractères"),
    body("capacity")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("La capacité est requise et doit être >= 1"),
    body("imageUrl")
      .optional()
      .isURL()
      .withMessage("L'URL de l'image doit être valide"),
    body("availabilityRules")
      .notEmpty()
      .isObject()
      .withMessage("Les règles de disponibilité sont requises"),
    body("availabilityRules.minDuration")
      .optional()
      .isInt({ min: 1 })
      .withMessage("La durée minimale doit être >= 1 minute"),
    body("availabilityRules.maxDuration")
      .optional()
      .isInt({ min: 1 })
      .withMessage("La durée maximale doit être >= 1 minute"),
    body("availabilityRules.daysOfWeek")
      .optional()
      .isArray()
      .withMessage("Les jours de la semaine doivent être un tableau"),
    body("availabilityRules.timeRanges")
      .optional()
      .isArray()
      .withMessage("Les plages horaires doivent être un tableau"),
    body("status")
      .optional()
      .isIn(["available", "maintenance", "unavailable"])
      .withMessage("Status invalide"),
    validate,
  ],
  ResourcesController.createResource,
);

/**
 * PUT /api/resources/:id
 * Mettre à jour une ressource
 * Requires: Admin
 */
router.put(
  "/:id",
  requireAdmin,
  [
    param("id").isUUID().withMessage("ID de ressource invalide"),
    body("name")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Le nom doit contenir entre 1 et 255 caractères"),
    body("description")
      .optional()
      .isString()
      .trim()
      .withMessage("La description doit être une chaîne"),
    body("location")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Le lieu doit contenir au maximum 255 caractères"),
    body("capacity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("La capacité doit être >= 1"),
    body("imageUrl")
      .optional()
      .isURL()
      .withMessage("L'URL de l'image doit être valide"),
    body("availabilityRules")
      .optional()
      .isObject()
      .withMessage("Les règles de disponibilité doivent être un objet"),
    body("status")
      .optional()
      .isIn(["available", "maintenance", "unavailable"])
      .withMessage("Status invalide"),
    validate,
  ],
  ResourcesController.updateResource,
);

/**
 * DELETE /api/resources/:id
 * Supprimer une ressource
 * Requires: Admin
 */
router.delete(
  "/:id",
  requireAdmin,
  [
    param("id").isUUID().withMessage("ID de ressource invalide"),
    validate,
  ],
  ResourcesController.deleteResource,
);

export default router;
