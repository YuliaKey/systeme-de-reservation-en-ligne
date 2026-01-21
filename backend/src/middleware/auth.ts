import { Request, Response, NextFunction } from "express";
import {
  verifyClerkToken,
  getClerkUser,
  isUserAdmin,
} from "../config/clerk.js";
import { UnauthorizedError, ForbiddenError } from "./errorHandler.js";

// Extension du type Request pour inclure les données utilisateur
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: "user" | "admin";
    }
  }
}

/**
 * Middleware pour vérifier l'authentification via Clerk
 * Extrait et vérifie le token JWT, récupère l'userId
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token d'authentification manquant");
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier le token avec Clerk
    const payload = await verifyClerkToken(token);

    if (!payload || !payload.sub) {
      throw new UnauthorizedError("Token invalide");
    }

    // Ajouter l'userId à la requête
    req.userId = payload.sub;

    // Récupérer le rôle de l'utilisateur
    try {
      const user = await getClerkUser(payload.sub);
      req.userRole = (user.publicMetadata?.role as "user" | "admin") || "user";
    } catch (error) {
      req.userRole = "user";
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware pour vérifier que l'utilisateur est administrateur
 * Doit être utilisé apres requireAuth
 */
export const requireAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new UnauthorizedError("Authentification requise");
    }

    // Vérifier si l'utilisateur est admin
    const isAdmin = await isUserAdmin(req.userId);

    if (!isAdmin) {
      throw new ForbiddenError("Accès réservé aux administrateurs");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware optionnel pour authentification
 * Ne bloque pas si pas de token, mais extrait les infos si présent
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = await verifyClerkToken(token);

      if (payload && payload.sub) {
        req.userId = payload.sub;

        try {
          const user = await getClerkUser(payload.sub);
          req.userRole =
            (user.publicMetadata?.role as "user" | "admin") || "user";
        } catch {
          req.userRole = "user";
        }
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, continuer sans authentification
    next();
  }
};
