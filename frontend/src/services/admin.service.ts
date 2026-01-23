import api from "./api";
import type {
  AdminStatistics,
  EmailNotification,
  Reservation,
  UpdateReservationRequest,
} from "../types";

export const adminService = {
  // Get admin statistics
  getStatistics: async (): Promise<AdminStatistics> => {
    const response = await api.get<AdminStatistics>("/admin/statistics");
    return response.data;
  },

  // Get all reservations (all users)
  getAllReservations: async (params?: {
    userId?: string;
    resourceId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ reservations: Reservation[]; total: number }> => {
    const response = await api.get<{
      reservations: Reservation[];
      total: number;
    }>("/admin/reservations", { params });
    return response.data;
  },

  // Get reservation by ID (admin can see any reservation)
  getReservationById: async (id: string): Promise<Reservation> => {
    const response = await api.get<Reservation>(`/admin/reservations/${id}`);
    return response.data;
  },

  // Update any user's reservation (admin power)
  updateReservation: async (
    id: string,
    data: UpdateReservationRequest,
  ): Promise<Reservation> => {
    const response = await api.put<Reservation>(`/reservations/${id}`, data);
    return response.data;
  },

  // Cancel any user's reservation
  cancelReservation: async (id: string): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },

  // Delete reservation permanently (admin only)
  deleteReservation: async (id: string): Promise<void> => {
    await api.delete(`/admin/reservations/${id}`);
  },

  // Send test email
  sendTestEmail: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/admin/test-email", {
      email,
    });
    return response.data;
  },

  // Get email logs
  getEmailLogs: async (params?: {
    status?: "sent" | "failed";
    limit?: number;
  }): Promise<EmailNotification[]> => {
    const response = await api.get<EmailNotification[]>("/admin/email-logs", {
      params,
    });
    return response.data;
  },
};
