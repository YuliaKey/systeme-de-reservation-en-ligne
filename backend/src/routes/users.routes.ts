import { Router } from "express";
import { body } from "express-validator";
import { UsersController } from "../controllers/users.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

/**
 * GET /api/users/me
 * Récupérer le profil de l'utilisateur connecté
 * Requires: Authentication
 */
router.get("/me", requireAuth, UsersController.getMyProfile);

/**
 * PUT /api/users/me
 * Mettre à jour le profil de l'utilisateur connecté
 * Requires: Authentication
 */
router.put(
  "/me",
  requireAuth,
  [
    body("fullName")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Le nom complet doit contenir entre 1 et 255 caractères"),
    body("preferences")
      .optional()
      .isObject()
      .withMessage("Les préférences doivent être un objet"),
    validateRequest,
  ],
  UsersController.updateMyProfile,
);

/**
 * DELETE /api/users/me
 * Supprimer le compte de l'utilisateur connecté
 * Requires: Authentication
 */
router.delete("/me", requireAuth, UsersController.deleteMyAccount);

export default router;
