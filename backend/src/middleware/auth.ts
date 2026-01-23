import { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { isUserAdmin } from "../config/clerk.js";
import { UnauthorizedError, ForbiddenError } from "./errorHandler.js";
import { UsersService } from "../services/users.service.js";

/**
 * Middleware pour vérifier l'authentification via Clerk
 * ET synchroniser automatiquement l'utilisateur en base de données
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Vérifier l'authentification Clerk
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError("Authentification requise");
    }

    const userId = auth.userId;

    // Vérifier si l'utilisateur existe en base de données
    let user = await UsersService.getUserById(userId);

    // Si l'utilisateur n'existe pas encore, le synchroniser depuis Clerk
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        const email =
          clerkUser.emailAddresses[0]?.emailAddress || "no-email@example.com";
        const firstName = clerkUser.firstName || "";
        const lastName = clerkUser.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim() || email;
        const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber;

        user = await UsersService.syncUserFromClerk(
          userId,
          email,
          fullName,
          phone,
        );
        console.log(`[AUTH] Nouvel utilisateur synchronisé: ${email}`);
      } catch (error) {
        console.error("[AUTH] Erreur de synchronisation utilisateur:", error);
        throw new UnauthorizedError(
          "Erreur lors de la synchronisation du compte",
        );
      }
    }

    // L'utilisateur est maintenant disponible pour les routes suivantes
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Helper pour récupérer l'userId depuis la requête
 */
export const getUserId = (req: Request): string => {
  const auth = getAuth(req);
  if (!auth.userId) {
    throw new UnauthorizedError("Authentification requise");
  }
  return auth.userId;
};

/**
 * Middleware pour vérifier que l'utilisateur est administrateur
 * Doit être utilisé après requireAuth
 */
export const requireAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getUserId(req);

    // Vérifier si l'utilisateur est admin
    const isAdmin = await isUserAdmin(userId);

    if (!isAdmin) {
      throw new ForbiddenError("Accès réservé aux administrateurs");
    }

    next();
  } catch (error) {
    next(error);
  }
};
