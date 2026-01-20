// API Types basées sur le contrat OpenAPI

export type ReservationStatus = "CONFIRMED" | "CANCELLED";
export type NotificationType = "EMAIL";
export type NotificationStatus = "SENT" | "FAILED" | "SKIPPED";

// Room & Availability
export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  amenities: string[];
  pricePerHour: number;
  images?: string[];
  description?: string;
}

export interface AvailabilitySlot {
  start: string; // ISO 8601
  end: string; // ISO 8601
  available: boolean;
}

export interface AvailabilityResponse {
  roomId: string;
  slots: AvailabilitySlot[];
}

export interface PaginatedRooms {
  items: Room[];
  page: number;
  pageSize: number;
  total: number;
}

// Reservations
export interface BookerIdentity {
  email: string;
  fullName: string;
}

export interface Reservation {
  id: string;
  roomId: string;
  userId: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  status: ReservationStatus;
  createdAt: string; // ISO 8601
}

export interface PaginatedReservations {
  items: Reservation[];
  page: number;
  pageSize: number;
  total: number;
}

export interface CreateReservationRequest {
  roomId: string;
  start: string;
  end: string;
  user: BookerIdentity;
}

export interface UpdateReservationRequest {
  start?: string;
  end?: string;
}

// Notifications
export interface Notification {
  type: NotificationType;
  status: NotificationStatus;
  sentAt?: string;
  reason?: string;
}

export interface ReservationUpdateResult {
  reservation: Reservation;
  notification: Notification;
}

export interface ReservationCancelResult {
  reservation: Reservation;
  notification: Notification;
}

export interface ReservationNotifications {
  reservationId: string;
  items: Notification[];
}

// Errors
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ErrorEnvelope {
  error: ApiError;
}

// Request parameters
export interface ListRoomsParams {
  start: string;
  end: string;
  capacity?: number;
  location?: string;
  amenities?: string;
  page?: number;
  pageSize?: number;
  [key: string]: string | number | undefined;
}

export interface GetAvailabilityParams {
  roomId: string;
  start: string;
  end: string;
  stepMinutes?: number;
  [key: string]: string | number | undefined;
}

export interface ListMyReservationsParams {
  from?: string;
  to?: string;
  status?: ReservationStatus;
  page?: number;
  pageSize?: number;
  [key: string]: string | number | ReservationStatus | undefined;
}

// UI State Types
export type DataState = "idle" | "loading" | "success" | "empty" | "error";
export type FormState =
  | "pristine"
  | "invalid"
  | "submitting"
  | "submitted"
  | "failed-business"
  | "failed-tech";

export interface UiError {
  type: "technical" | "business";
  message: string;
  code?: string;
  retryable: boolean;
}
