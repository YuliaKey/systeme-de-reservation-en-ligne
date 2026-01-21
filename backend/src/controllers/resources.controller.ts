import { Request, Response } from "express";
import { ResourceService } from "../services/resource.service.js";
import {
  AuthenticatedRequest,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceQueryParams,
} from "../types/index.js";

/**
 * Contrôleur pour les endpoints de ressources
 */
export class ResourcesController {
  /**
   * GET /api/resources
   * Récupérer toutes les ressources
   */
  static async getAllResources(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as unknown as ResourceQueryParams;
      const limit = query.limit ? parseInt(query.limit as string) : 50;
      const offset = query.offset ? parseInt(query.offset as string) : 0;

      const result = await ResourceService.getAllResources(
        query.status,
        limit,
        offset,
      );

      res.json({
        resources: result.resources,
        total: result.total,
        limit,
        offset,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des ressources:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la récupération des ressources",
      });
    }
  }

  /**
   * GET /api/resources/:id
   * Récupérer une ressource par ID
   */
  static async getResourceById(req: Request, res: Response): Promise<void> {
    try {
      const resource = await ResourceService.getResourceById(req.params.id);
      res.json(resource);
    } catch (error) {
      if (
        error instanceof Error &&
        error.constructor.name === "NotFoundError"
      ) {
        res.status(404).json({
          error: "Not Found",
          message: error.message,
        });
      } else {
        console.error("Erreur lors de la récupération de la ressource:", error);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Erreur lors de la récupération de la ressource",
        });
      }
    }
  }

  /**
   * GET /api/resources/:id/availability
   * Vérifier la disponibilité d'une ressource
   */
  static async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = req.query;

      if (!startTime || !endTime) {
        res.status(400).json({
          error: "Bad Request",
          message: "startTime et endTime sont requis",
        });
        return;
      }

      const start = new Date(startTime as string);
      const end = new Date(endTime as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          error: "Bad Request",
          message: "Format de date invalide",
        });
        return;
      }

      const isAvailable = await ResourceService.checkAvailability(
        req.params.id,
        start,
        end,
      );

      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Erreur lors de la vérification de disponibilité:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la vérification de disponibilité",
      });
    }
  }

  /**
   * POST /api/resources
   * Créer une nouvelle ressource (admin uniquement)
   */
  static async createResource(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const data: CreateResourceRequest = req.body;
      const resource = await ResourceService.createResource(data);
      res.status(201).json(resource);
    } catch (error) {
      if (
        error instanceof Error &&
        error.constructor.name === "ConflictError"
      ) {
        res.status(409).json({
          error: "Conflict",
          message: error.message,
        });
      } else if (
        error instanceof Error &&
        error.constructor.name === "BusinessError"
      ) {
        res.status(400).json({
          error: "Bad Request",
          message: error.message,
        });
      } else {
        console.error("Erreur lors de la création de la ressource:", error);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Erreur lors de la création de la ressource",
        });
      }
    }
  }

  /**
   * PUT /api/resources/:id
   * Mettre à jour une ressource (admin uniquement)
   */
  static async updateResource(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const data: UpdateResourceRequest = req.body;
      const resource = await ResourceService.updateResource(
        req.params.id,
        data,
      );
      res.json(resource);
    } catch (error) {
      if (
        error instanceof Error &&
        error.constructor.name === "NotFoundError"
      ) {
        res.status(404).json({
          error: "Not Found",
          message: error.message,
        });
      } else if (
        error instanceof Error &&
        error.constructor.name === "ConflictError"
      ) {
        res.status(409).json({
          error: "Conflict",
          message: error.message,
        });
      } else if (
        error instanceof Error &&
        error.constructor.name === "BusinessError"
      ) {
        res.status(400).json({
          error: "Bad Request",
          message: error.message,
        });
      } else {
        console.error("Erreur lors de la mise à jour de la ressource:", error);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Erreur lors de la mise à jour de la ressource",
        });
      }
    }
  }

  /**
   * DELETE /api/resources/:id
   * Supprimer une ressource (admin uniquement)
   */
  static async deleteResource(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      await ResourceService.deleteResource(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        error.constructor.name === "NotFoundError"
      ) {
        res.status(404).json({
          error: "Not Found",
          message: error.message,
        });
      } else if (
        error instanceof Error &&
        error.constructor.name === "BusinessError"
      ) {
        res.status(400).json({
          error: "Bad Request",
          message: error.message,
        });
      } else {
        console.error("Erreur lors de la suppression de la ressource:", error);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Erreur lors de la suppression de la ressource",
        });
      }
    }
  }
}
