import api from "./api";
import type {
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
} from "../types";

export const resourcesService = {
  // Get all rooms
  getAll: async (): Promise<Resource[]> => {
    const response = await api.get<{ resources: Resource[]; total: number }>(
      "/resources",
    );
    return response.data.resources;
  },

  // Get resource by ID
  getById: async (id: string): Promise<Resource> => {
    const response = await api.get<Resource>(`/resources/${id}`);
    return response.data;
  },

  // Check resource availability
  checkAvailability: async (
    id: string,
    data: CheckAvailabilityRequest,
  ): Promise<CheckAvailabilityResponse> => {
    const response = await api.post<CheckAvailabilityResponse>(
      `/resources/${id}/availability`,
      data,
    );
    return response.data;
  },

  // Create resource (admin only)
  create: async (data: CreateResourceRequest): Promise<Resource> => {
    const response = await api.post<Resource>("/resources", data);
    return response.data;
  },

  // Update resource (admin only)
  update: async (
    id: string,
    data: UpdateResourceRequest,
  ): Promise<Resource> => {
    const response = await api.put<Resource>(`/resources/${id}`, data);
    return response.data;
  },

  // Delete resource (admin only)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/resources/${id}`);
  },
};
