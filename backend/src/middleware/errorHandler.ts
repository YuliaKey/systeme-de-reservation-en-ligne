import { Request, Response, NextFunction } from "express";

// Type guard pour vérifier si c'est une erreur
function isError(err: unknown): err is Error {
  return err instanceof Error;
}

// Type guard pour vérifier si c'est une erreur avec statusCode
function hasStatusCode(err: unknown): err is Error & { statusCode: number } {
  return isError(err) && "statusCode" in err;
}

// Type guard pour vérifier si c'est une erreur avec details
function hasDetails(err: unknown): err is Error & { details: unknown } {
  return isError(err) && "details" in err;
}

// Gestion centralisée des erreurs
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Si ce n'est pas une erreur, la convertir
  const error = isError(err) ? err : new Error(String(err));

  console.error("Erreur:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  // Erreur de validation
  if (error.name === "ValidationError") {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: error.message,
        details: hasDetails(error) ? error.details : {},
      },
    });
    return;
  }

  // Erreur d'authentification
  if (error.name === "UnauthorizedError" || error.message.includes("Token")) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Token d'authentification manquant ou invalide",
      },
    });
    return;
  }

  // Erreur de permissions
  if (error.name === "ForbiddenError") {
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
  if (error.name === "NotFoundError") {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: error.message || "Ressource non trouvée",
      },
    });
    return;
  }

  // Erreur de conflit (créneau non disponible)
  if (error.name === "ConflictError") {
    res.status(409).json({
      error: {
        code: "CONFLICT",
        message: error.message || "Conflit détecté",
        details: hasDetails(error) ? error.details : {},
      },
    });
    return;
  }

  // Erreur métier (règles non respectées)
  if (error.name === "BusinessError") {
    res.status(422).json({
      error: {
        code: "UNPROCESSABLE_ENTITY",
        message: error.message,
        details: hasDetails(error) ? error.details : {},
      },
    });
    return;
  }

  // Erreur serveur générique
  const statusCode = hasStatusCode(error) ? error.statusCode : 500;
  res.status(statusCode).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Une erreur interne est survenue"
          : error.message,
    },
  });
};

// Classes d'erreurs personnalisées
export class ValidationError extends Error {
  public details: Record<string, string>;

  constructor(message: string, details: Record<string, string> = {}) {
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
  public details: Record<string, unknown>;

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "ConflictError";
    this.details = details;
  }
}

export class BusinessError extends Error {
  public details: Record<string, unknown>;

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "BusinessError";
    this.details = details;
  }
}
