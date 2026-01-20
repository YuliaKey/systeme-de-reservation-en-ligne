import { Request, Response, NextFunction } from "express";

// Gestion centralisée des erreurs
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("❌ Erreur:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Erreur de validation
  if (err.name === "ValidationError") {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: err.message,
        details: err.details || {},
      },
    });
    return;
  }

  // Erreur d'authentification
  if (err.name === "UnauthorizedError" || err.message.includes("Token")) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Token d'authentification manquant ou invalide",
      },
    });
    return;
  }

  // Erreur de permissions
  if (err.name === "ForbiddenError") {
    res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message:
          "Vous n'avez pas les permissions nécessaires pour cette action",
      },
    });
    return;
  }

  // Erreur de ressource non trouvée
  if (err.name === "NotFoundError") {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: err.message || "Ressource non trouvée",
      },
    });
    return;
  }

  // Erreur de conflit (créneau non disponible)
  if (err.name === "ConflictError") {
    res.status(409).json({
      error: {
        code: "CONFLICT",
        message: err.message || "Conflit détecté",
        details: err.details || {},
      },
    });
    return;
  }

  // Erreur métier (règles non respectées)
  if (err.name === "BusinessError") {
    res.status(422).json({
      error: {
        code: "UNPROCESSABLE_ENTITY",
        message: err.message,
        details: err.details || {},
      },
    });
    return;
  }

  // Erreur serveur générique
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Une erreur interne est survenue"
          : err.message,
    },
  });
};

// Classes d'erreurs personnalisées
export class ValidationError extends Error {
  public details: any;

  constructor(message: string, details: any = {}) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = "Non autorisé") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = "Accès interdit") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string = "Ressource non trouvée") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  public details: any;

  constructor(message: string, details: any = {}) {
    super(message);
    this.name = "ConflictError";
    this.details = details;
  }
}

export class BusinessError extends Error {
  public details: any;

  constructor(message: string, details: any = {}) {
    super(message);
    this.name = "BusinessError";
    this.details = details;
  }
}
