import api from "./api";
import type { User } from "../types";

export const usersService = {
  // Get current user profile
  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/users/me");
    return response.data;
  },

  // Update current user profile
  updateMe: async (data: {
    username?: string;
    fullName?: string;
  }): Promise<User> => {
    const response = await api.put<User>("/users/me", data);
    return response.data;
  },

  // Delete current user account
  deleteMe: async (): Promise<void> => {
    await api.delete("/users/me");
  },
};
