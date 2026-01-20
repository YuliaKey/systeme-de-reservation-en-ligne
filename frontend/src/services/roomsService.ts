import { apiClient } from "./apiClient";
import {
  Room,
  PaginatedRooms,
  AvailabilityResponse,
  ListRoomsParams,
  GetAvailabilityParams,
} from "../types/index";

export const roomsService = {
  /**
   * Lister les salles disponibles pour un créneau et des filtres
   */
  listRooms: async (params: ListRoomsParams): Promise<PaginatedRooms> => {
    return apiClient.get<PaginatedRooms>("/rooms", params);
  },

  /**
   * Récupérer le détail d'une salle
   */
  getRoom: async (roomId: string): Promise<Room> => {
    return apiClient.get<Room>(`/rooms/${roomId}`);
  },

  /**
   * Obtenir les disponibilités d'une salle
   */
  getAvailability: async (
    params: GetAvailabilityParams,
  ): Promise<AvailabilityResponse> => {
    const { roomId, ...queryParams } = params;
    return apiClient.get<AvailabilityResponse>(
      `/rooms/${roomId}/availability`,
      queryParams,
    );
  },
};
