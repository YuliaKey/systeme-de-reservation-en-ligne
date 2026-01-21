import { Request, Response, NextFunction } from "express";
import { requireAuth as clerkRequireAuth, getAuth } from "@clerk/express";
import { isUserAdmin } from "../config/clerk.js";
import { UnauthorizedError, ForbiddenError } from "./errorHandler.js";

/**
 * Middleware pour vérifier l'authentification via Clerk
 * Utilise le middleware natif de @clerk/express
 */
export const requireAuth = clerkRequireAuth();

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
