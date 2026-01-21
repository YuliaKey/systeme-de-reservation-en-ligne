import { Response } from "express";
import { getAuth } from "@clerk/express";
import { clerkClient } from "../config/clerk.js";
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
      const { userId } = getAuth(req);
      if (!userId) throw new Error("Non authentifié");

      const clerkUser = await clerkClient.users.getUser(userId);

      res.json({
        userId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        fullName:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        role: (clerkUser.publicMetadata?.role as string) || "user",
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
