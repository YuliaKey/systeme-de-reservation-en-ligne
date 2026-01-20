import { apiClient } from "./apiClient";
import {
  Reservation,
  PaginatedReservations,
  CreateReservationRequest,
  UpdateReservationRequest,
  ReservationUpdateResult,
  ReservationCancelResult,
  ReservationNotifications,
  ListMyReservationsParams,
} from "../types/index";

export const reservationsService = {
  /**
   * Récupérer mes réservations
   */
  listMyReservations: async (
    params?: ListMyReservationsParams,
  ): Promise<PaginatedReservations> => {
    return apiClient.get<PaginatedReservations>("/reservations", params);
  },

  /**
   * Créer une nouvelle réservation
   */
  createReservation: async (
    request: CreateReservationRequest,
  ): Promise<Reservation> => {
    return apiClient.post<Reservation>("/reservations", request);
  },

  /**
   * Récupérer une réservation par son ID
   */
  getReservation: async (reservationId: string): Promise<Reservation> => {
    return apiClient.get<Reservation>(`/reservations/${reservationId}`);
  },

  /**
   * Modifier une réservation
   */
  updateReservation: async (
    reservationId: string,
    request: UpdateReservationRequest,
  ): Promise<ReservationUpdateResult> => {
    return apiClient.patch<ReservationUpdateResult>(
      `/reservations/${reservationId}`,
      request,
    );
  },

  /**
   * Annuler une réservation
   */
  cancelReservation: async (
    reservationId: string,
  ): Promise<ReservationCancelResult> => {
    return apiClient.delete<ReservationCancelResult>(
      `/reservations/${reservationId}`,
    );
  },

  /**
   * Récupérer l'historique des notifications
   */
  getNotifications: async (
    reservationId: string,
  ): Promise<ReservationNotifications> => {
    return apiClient.get<ReservationNotifications>(
      `/reservations/${reservationId}/notifications`,
    );
  },
};
