// Types de base pour l'API de réservation

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  user: User;
  sessionId: string;
  expiresAt: Date;
}

export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
  twoFactorEnabled?: boolean;
  preferences?: Record<string, unknown>;
}

// Types pour les ressources
export type ResourceStatus = "available" | "maintenance" | "unavailable";

export interface AvailabilityRule {
  daysOfWeek?: number[]; // 0=dimanche, 6=samedi
  timeRanges?: Array<{
    start: number; // Heure en décimal (ex: 9.5 = 9h30)
    end: number;
  }>;
  minDuration?: number; // en minutes
  maxDuration?: number; // en minutes
}

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  location: string | null;
  imageUrl: string | null;
  availabilityRules: AvailabilityRule;
  status: ResourceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResourceRequest {
  name: string;
  description?: string;
  capacity: number;
  location?: string;
  imageUrl?: string;
  availabilityRules: AvailabilityRule;
  status?: ResourceStatus;
}

export interface UpdateResourceRequest {
  name?: string;
  description?: string;
  capacity?: number;
  location?: string;
  imageUrl?: string;
  availabilityRules?: AvailabilityRule;
  status?: ResourceStatus;
}

export interface PaginatedResources {
  items: Resource[];
  page: number;
  pageSize: number;
  total: number;
}

// Types pour les disponibilités
export interface AvailabilitySlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface AvailabilityResponse {
  resourceId: string;
  slots: AvailabilitySlot[];
}

// Types pour les réservations
export type ReservationStatus = "active" | "modified" | "cancelled" | "passed";

export interface Reservation {
  id: string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: ReservationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  resource?: Resource;
}

export interface CreateReservationRequest {
  resourceId: string;
  startTime: string; // ISO 8601
  endTime: string;
  notes?: string;
}

export interface UpdateReservationRequest {
  resourceId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface PaginatedReservations {
  items: Reservation[];
  page: number;
  pageSize: number;
  total: number;
}

// Types pour les notifications email
export type EmailNotificationType =
  | "reservation_created"
  | "reservation_updated"
  | "reservation_cancelled"
  | "reservation_reminder"
  | "account_deleted"
  | "admin_notification";

export type EmailNotificationStatus = "sent" | "failed" | "pending";

export interface EmailNotification {
  type: EmailNotificationType;
  status: EmailNotificationStatus;
  recipient: string;
  sentAt?: Date;
  errorMessage?: string;
}

export interface ReservationCreatedResult {
  reservation: Reservation;
  emailNotifications: EmailNotification[];
}

export interface ReservationUpdateResult {
  reservation: Reservation;
  emailNotifications: EmailNotification[];
}

export interface ReservationCancelResult {
  reservation: Reservation;
  emailNotifications: EmailNotification[];
}

// Types pour les statistiques admin
export interface Statistics {
  resources: {
    total: number;
    available: number;
    maintenance: number;
    unavailable: number;
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

// Types pour les erreurs API
export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Types pour les paramètres de requête
export interface ResourceQueryParams {
  status?: ResourceStatus;
  limit?: string | number;
  offset?: string | number;
}

export interface ReservationQueryParams {
  userId?: string;
  resourceId?: string;
  status?: ReservationStatus;
  startDate?: string;
  endDate?: string;
  limit?: string | number;
  offset?: string | number;
  includeActive?: string | boolean;
}

// Type pour Express Request avec user authentifié
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}
