import { ErrorEnvelope, UiError } from "../types/index";

const API_BASE = "/api";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private buildQueryString(params: Record<string, unknown>): string {
    const filtered = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&");
    return filtered ? `?${filtered}` : "";
  }

  private parseError(response: unknown): UiError {
    // Si c'est une erreur réseau
    if (response instanceof Error) {
      return {
        type: "technical",
        message: "Erreur de communication avec le serveur",
        retryable: true,
      };
    }

    // Si c'est un ErrorEnvelope du backend
    if (response && typeof response === "object" && "error" in response) {
      const envelope = response as ErrorEnvelope;
      const { code, message } = envelope.error;

      // Classer l'erreur en fonction du code
      if (code === "SLOT_NOT_AVAILABLE" || code === "CONFLICT") {
        return {
          type: "business",
          message,
          code,
          retryable: false,
        };
      }

      if (code === "INVALID_DURATION" || code === "MODIFICATION_TOO_LATE") {
        return {
          type: "business",
          message,
          code,
          retryable: false,
        };
      }

      // Autres erreurs
      return {
        type: "technical",
        message,
        code,
        retryable: true,
      };
    }

    return {
      type: "technical",
      message: "Une erreur inconnue est survenue",
      retryable: true,
    };
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const url = params
      ? `${this.baseUrl}${endpoint}${this.buildQueryString(params)}`
      : `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw this.parseError(new Error(`HTTP ${response.status}`));
        }
        throw this.parseError(errorData);
      }

      return (await response.json()) as T;
    } catch (err) {
      throw this.parseError(err);
    }
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw this.parseError(new Error(`HTTP ${response.status}`));
        }
        throw this.parseError(errorData);
      }

      return (await response.json()) as T;
    } catch (err) {
      throw this.parseError(err);
    }
  }

  async patch<T>(endpoint: string, body: unknown): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw this.parseError(new Error(`HTTP ${response.status}`));
        }
        throw this.parseError(errorData);
      }

      return (await response.json()) as T;
    } catch (err) {
      throw this.parseError(err);
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw this.parseError(new Error(`HTTP ${response.status}`));
        }
        throw this.parseError(errorData);
      }

      return (await response.json()) as T;
    } catch (err) {
      throw this.parseError(err);
    }
  }
}

export const apiClient = new ApiClient();
