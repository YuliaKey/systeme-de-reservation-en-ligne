import { Response } from "express";
import { ReservationService } from "../services/reservation.service.js";
import {
  AuthenticatedRequest,
  CreateReservationRequest,
  UpdateReservationRequest,
  ReservationQueryParams,
} from "../types/index.js";

/**
 * Contrôleur pour les endpoints de réservations
 */
export class ReservationsController {
  /**
   * GET /api/reservations
   * Récupérer toutes les réservations de l'utilisateur connecté
   */
  static async getMyReservations(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const query = req.query as unknown as ReservationQueryParams;
      const limit = query.limit ? parseInt(query.limit as string) : 50;
      const offset = query.offset ? parseInt(query.offset as string) : 0;

      const result = await ReservationService.getAllReservations(
        req.userId, // Filtrer par utilisateur connecté
        query.resourceId,
        query.status,
        query.startDate ? new Date(query.startDate as string) : undefined,
        query.endDate ? new Date(query.endDate as string) : undefined,
        limit,
        offset,
      );

      res.json({
        reservations: result.reservations,
        total: result.total,
        limit,
        offset,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la récupération des réservations",
      });
    }
  }

  /**
   * GET /api/reservations/history
   * Récupérer l'historique des réservations de l'utilisateur
   */
  static async getMyHistory(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const query = req.query as unknown as ReservationQueryParams;
      const limit = query.limit ? parseInt(query.limit as string) : 50;
      const offset = query.offset ? parseInt(query.offset as string) : 0;
      const includeActive =
        query.includeActive === "true" || query.includeActive === true;

      const result = await ReservationService.getUserReservationHistory(
        req.userId!,
        includeActive,
        limit,
        offset,
      );

      res.json({
        reservations: result.reservations,
        total: result.total,
        limit,
        offset,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la récupération de l'historique",
      });
    }
  }

  /**
   * GET /api/reservations/:id
   * Récupérer une réservation par ID
   */
  static async getReservationById(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const reservation = await ReservationService.getReservationById(
        req.params.id,
        req.userId, // Filtrer par utilisateur connecté
      );
      res.json(reservation);
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
        console.error(
          "Erreur lors de la récupération de la réservation:",
          error,
        );
        res.status(500).json({
          error: "Internal Server Error",
          message: "Erreur lors de la récupération de la réservation",
        });
      }
    }
  }

  /**
   * POST /api/reservations
   * Créer une nouvelle réservation
   */
  static async createReservation(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const data: CreateReservationRequest = req.body;
      const reservation = await ReservationService.createReservation(
        req.userId!,
        data,
      );
      res.status(201).json(reservation);
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
        console.error("Erreur lors de la création de la réservation:", error);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Erreur lors de la création de la réservation",
        });
      }
    }
  }

  /**
   * PUT /api/reservations/:id
   * Mettre à jour une réservation
   */
  static async updateReservation(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const data: UpdateReservationRequest = req.body;
      const reservation = await ReservationService.updateReservation(
        req.params.id,
        req.userId!,
        req.userRole === "admin",
        data,
      );
      res.json(reservation);
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
        console.error(
          "Erreur lors de la mise à jour de la réservation:",
          error,
        );
        res.status(500).json({
          error: "Internal Server Error",
          message: "Erreur lors de la mise à jour de la réservation",
        });
      }
    }
  }

  /**
   * DELETE /api/reservations/:id
   * Annuler une réservation
   */
  static async cancelReservation(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const reservation = await ReservationService.cancelReservation(
        req.params.id,
        req.userId!,
        req.userRole === "admin",
      );
      res.json(reservation);
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
        console.error("Erreur lors de l'annulation de la réservation:", error);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Erreur lors de l'annulation de la réservation",
        });
      }
    }
  }
}
