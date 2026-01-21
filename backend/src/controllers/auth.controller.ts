import { Response } from "express";
import { getClerkUser } from "../config/clerk.js";
import { AuthenticatedRequest } from "../types/index.js";

/**
 * Contrôleur pour les endpoints d'authentification
 */
export class AuthController {
  /**
   * GET /api/auth/session
   * Récupérer les informations de la session utilisateur actuelle
   */
  static async getCurrentSession(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const clerkUser = await getClerkUser(req.userId!);

      res.json({
        userId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        fullName:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        role: req.userRole,
        createdAt: new Date(clerkUser.createdAt),
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de la session:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la récupération de la session",
      });
    }
  }
}
