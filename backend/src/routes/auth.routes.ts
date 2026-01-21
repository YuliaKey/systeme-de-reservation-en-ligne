import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/auth/session
 * Récupérer les informations de session de l'utilisateur connecté
 * Requires: Authentication
 */
router.get("/session", requireAuth, AuthController.getCurrentSession);

export default router;
