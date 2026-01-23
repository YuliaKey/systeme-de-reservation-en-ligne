import axios, { AxiosError, AxiosInstance } from "axios";

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  async (config) => {
    // Get Clerk session token
    if (window.Clerk) {
      try {
        const token = await window.Clerk.session?.getToken();
        console.log(
          "[API] Token retrieved:",
          token ? "✓ Token exists" : "✗ No token",
        );
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn(
            "[API] No Clerk token available - user may not be signed in",
          );
        }
      } catch (error) {
        console.error("[API] Error getting Clerk token:", error);
      }
    } else {
      console.warn("[API] Clerk not loaded yet");
    }
    console.log("[API] Making request to:", config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const statusCode = error.response.status;
      const errorMessage =
        (error.response.data as { error?: string })?.error || error.message;

      switch (statusCode) {
        case 401:
          console.error("Unauthorized - Please login");
          break;
        case 403:
          console.error("Forbidden - You do not have permission");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 409:
          console.error("Conflict - Resource unavailable");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error(`Error ${statusCode}: ${errorMessage}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network error - No response from server");
    } else {
      // Something happened in setting up the request
      console.error("Request error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default api;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const data = error.response.data as { error?: string; message?: string };
      return data.error || data.message || error.message;
    }
    if (error.request) {
      return "Impossible de contacter le serveur. Vérifiez votre connexion.";
    }
  }
  return error instanceof Error
    ? error.message
    : "Une erreur inconnue est survenue";
};

// Extend Window interface for Clerk
declare global {
  interface Window {
    Clerk?: {
      session: {
        getToken(): Promise<string>;
      } | null;
    };
  }
}
