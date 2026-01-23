export interface User {
  id: string;
  clerkId: string;
  email: string;
  username?: string;
  fullName?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  amenities?: string[]; // Équipements disponibles (wifi, écran, visio, etc.)
  pricePerHour?: number; // Prix par heure en euros
  images?: string[]; // URLs des photos de la ressource
  active: boolean;
  availability?: {
    daysOfWeek?: number[]; // Jours disponibles (1-7)
    timeRanges?: Array<DbTimeRange | TimeRange>; // Plages horaires (formats mixtes DB/frontend)
  };
  rules?: {
    minDurationMinutes?: number; // Durée minimale en minutes
    maxDurationMinutes?: number; // Durée maximale en minutes
  };
  availabilityRules?: AvailabilityRules; // DEPRECATED - pour compatibilité
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityRules {
  minDuration?: number; // en minutes
  maxDuration?: number; // en minutes
  daysOfWeek?: number[]; // 0-6 (dimanche à samedi)
  timeRanges?: TimeRange[];
}

export interface TimeRange {
  startTime: string; // format HH:MM
  endTime: string; // format HH:MM
}

// Types pour la base de données (format différent)
export interface DbTimeRange {
  start: string | number; // Peut être "08:00" ou 8.0 (heures décimales)
  end: string | number; // Peut être "20:00" ou 20.0
}

export type ReservationStatus = "active" | "cancelled" | "modified" | "passed";

export interface Reservation {
  id: string;
  userId: string;
  resourceId: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  resource?: Resource;
  user?: User;
}

export interface EmailNotification {
  id: number;
  recipient: string;
  emailType:
    | "reservation_created"
    | "reservation_updated"
    | "reservation_cancelled"
    | "admin_notification"
    | "account_deleted";
  status: "sent" | "failed";
  errorMessage?: string;
  sentAt: string;
  reservationId?: number;
}

// API Request/Response Types
export interface CreateResourceRequest {
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  active?: boolean;
  availabilityRules?: AvailabilityRules;
}

export interface UpdateResourceRequest extends Partial<CreateResourceRequest> {}

export interface CreateReservationRequest {
  resourceId: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  numberOfPeople: number;
  notes?: string;
}

export interface UpdateReservationRequest {
  startTime?: string;
  endTime?: string;
  numberOfPeople?: number;
  notes?: string;
}

export interface CheckAvailabilityRequest {
  startTime: string;
  endTime: string;
}

export interface CheckAvailabilityResponse {
  available: boolean;
  message?: string;
}

export interface AdminStatistics {
  totalResources: number;
  totalReservations: number;
  totalUsers: number;
  totalEmailsSent: number;
  topResources: Array<{
    resourceId: number;
    resourceName: string;
    reservationCount: number;
  }>;
  topUsers: Array<{
    userId: string;
    email: string;
    reservationCount: number;
  }>;
}

// UI States
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: string;
}
