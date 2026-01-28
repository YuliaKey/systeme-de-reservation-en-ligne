export interface User {
  id: string;
  clerkId?: string;
  email: string;
  username?: string;
  fullName?: string;
  phone?: string | null;
  role: "admin" | "user";
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  city: string;
  amenities?: string[]; // Équipements disponibles (wifi, écran, visio, etc.)
  pricePerHour?: number; // Prix par heure en euros
  images?: string[]; // URLs des photos de la ressource
  active: boolean;
  availability?: AvailabilityRules; // Règles de disponibilité
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
  start: string; // Format HH:MM (ex: "09:30")
  end: string; // Format HH:MM (ex: "18:00")
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
  city: string;
  pricePerHour?: number;
  amenities?: string[];
  images?: string[];
  active?: boolean;
  availability?: AvailabilityRules;
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
  resources: {
    total: number;
    active: number;
    inactive: number;
  };
  reservations: {
    total: number;
    active: number;
    modified: number;
    cancelled: number;
    passed: number;
  };
  users: {
    total: number;
  };
  emails: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
  topResourcesByReservations: Array<{
    resourceId: string;
    resourceName: string;
    reservationCount: number;
  }>;
  topUsersByReservations: Array<{
    userId: string;
    userName: string;
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
