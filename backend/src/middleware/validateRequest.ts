import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ValidationError } from "./errorHandler.js";

/**
 * Middleware pour valider les résultats de express-validator
 * À utiliser après les règles de validation
 */
export const validate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors: Record<string, string> = {};

    errors.array().forEach((error) => {
      if (error.type === "field") {
        formattedErrors[error.path] = error.msg;
      }
    });

    throw new ValidationError("Validation échouée", formattedErrors);
  }

  next();
};

/**
 * Helper pour exécuter une chaîne de validation
 */
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    validate(req, res, next);
  };
};
