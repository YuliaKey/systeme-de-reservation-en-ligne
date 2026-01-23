import api from "./api";
import type {
  Reservation,
  CreateReservationRequest,
  UpdateReservationRequest,
} from "../types";

export const reservationsService = {
  // Get user's active reservations
  getMy: async (): Promise<Reservation[]> => {
    const response = await api.get<{
      reservations: Reservation[];
      total: number;
    }>("/reservations");
    return response.data.reservations;
  },

  // Get user's reservation history (all statuses)
  getHistory: async (): Promise<Reservation[]> => {
    const response = await api.get<{
      reservations: Reservation[];
      total: number;
    }>("/reservations/history");
    return response.data.reservations;
  },

  // Get reservation by ID
  getById: async (id: string): Promise<Reservation> => {
    const response = await api.get<Reservation>(`/reservations/${id}`);
    return response.data;
  },

  // Create reservation
  create: async (data: CreateReservationRequest): Promise<Reservation> => {
    const response = await api.post<Reservation>("/reservations", data);
    return response.data;
  },

  // Update reservation
  update: async (
    id: string,
    data: UpdateReservationRequest,
  ): Promise<Reservation> => {
    const response = await api.put<Reservation>(`/reservations/${id}`, data);
    return response.data;
  },

  // Cancel reservation
  cancel: async (id: string): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },
};
