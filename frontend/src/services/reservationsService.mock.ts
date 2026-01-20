import {
  Reservation,
  PaginatedReservations,
  CreateReservationRequest,
  UpdateReservationRequest,
  ReservationUpdateResult,
  ReservationCancelResult,
  ReservationNotifications,
  ListMyReservationsParams,
} from "../types";

// Stockage en mémoire des réservations
let mockReservations: Reservation[] = [
  {
    id: "res-1",
    roomId: "1",
    userId: "user-123",
    start: "2026-01-25T09:00:00Z",
    end: "2026-01-25T11:00:00Z",
    status: "CONFIRMED",
    createdAt: "2026-01-19T10:00:00Z",
  },
  {
    id: "res-2",
    roomId: "3",
    userId: "user-123",
    start: "2026-01-26T14:00:00Z",
    end: "2026-01-26T16:00:00Z",
    status: "CONFIRMED",
    createdAt: "2026-01-18T15:30:00Z",
  },
  {
    id: "res-3",
    roomId: "2",
    userId: "user-123",
    start: "2026-01-22T10:00:00Z",
    end: "2026-01-22T12:00:00Z",
    status: "CANCELLED",
    createdAt: "2026-01-15T11:00:00Z",
  },
];

let nextId = 4;

const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const reservationsServiceMock = {
  async listMyReservations(
    params?: ListMyReservationsParams,
  ): Promise<PaginatedReservations> {
    await delay(400);

    let filtered = [...mockReservations];

    // Filtrer par dates
    if (params?.from) {
      const fromDate = new Date(params.from);
      filtered = filtered.filter((r) => new Date(r.start) >= fromDate);
    }
    if (params?.to) {
      const toDate = new Date(params.to);
      filtered = filtered.filter((r) => new Date(r.end) <= toDate);
    }

    // Filtrer par statut
    if (params?.status) {
      filtered = filtered.filter((r) => r.status === params.status);
    }

    // Trier par date de début (plus récent en premier)
    filtered.sort(
      (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
    );

    // Pagination
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      page,
      pageSize,
      total: filtered.length,
    };
  },

  async getReservation(reservationId: string): Promise<Reservation> {
    await delay(300);

    const reservation = mockReservations.find((r) => r.id === reservationId);
    if (!reservation) {
      throw {
        type: "business",
        message: "Réservation non trouvée",
        code: "RESERVATION_NOT_FOUND",
        retryable: false,
      };
    }

    return reservation;
  },

  async createReservation(
    data: CreateReservationRequest,
  ): Promise<Reservation> {
    await delay(600);

    // Simuler une vérification de disponibilité
    const conflicts = mockReservations.filter(
      (r) =>
        r.roomId === data.roomId &&
        r.status === "CONFIRMED" &&
        ((new Date(data.start) >= new Date(r.start) &&
          new Date(data.start) < new Date(r.end)) ||
          (new Date(data.end) > new Date(r.start) &&
            new Date(data.end) <= new Date(r.end))),
    );

    if (conflicts.length > 0) {
      throw {
        type: "business",
        message: "Salle non disponible pour ce créneau",
        code: "ROOM_NOT_AVAILABLE",
        retryable: false,
      };
    }

    const newReservation: Reservation = {
      id: `res-${nextId++}`,
      roomId: data.roomId,
      userId: "user-123",
      start: data.start,
      end: data.end,
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
    };

    mockReservations.push(newReservation);
    return newReservation;
  },

  async updateReservation(
    reservationId: string,
    data: UpdateReservationRequest,
  ): Promise<ReservationUpdateResult> {
    await delay(500);

    const index = mockReservations.findIndex((r) => r.id === reservationId);
    if (index === -1) {
      throw {
        type: "business",
        message: "Réservation non trouvée",
        code: "RESERVATION_NOT_FOUND",
        retryable: false,
      };
    }

    const updated = {
      ...mockReservations[index],
      ...(data.start && { start: data.start }),
      ...(data.end && { end: data.end }),
    };

    mockReservations[index] = updated;

    return {
      reservation: updated,
      notification: {
        type: "EMAIL",
        status: "SENT",
        sentAt: new Date().toISOString(),
      },
    };
  },

  async cancelReservation(
    reservationId: string,
  ): Promise<ReservationCancelResult> {
    await delay(400);

    const index = mockReservations.findIndex((r) => r.id === reservationId);
    if (index === -1) {
      throw {
        type: "business",
        message: "Réservation non trouvée",
        code: "RESERVATION_NOT_FOUND",
        retryable: false,
      };
    }

    mockReservations[index] = {
      ...mockReservations[index],
      status: "CANCELLED",
    };

    return {
      reservation: mockReservations[index],
      notification: {
        type: "EMAIL",
        status: "SENT",
        sentAt: new Date().toISOString(),
      },
    };
  },

  async getReservationNotifications(
    reservationId: string,
  ): Promise<ReservationNotifications> {
    await delay(300);

    return {
      reservationId,
      items: [
        {
          type: "EMAIL",
          status: "SENT",
          sentAt: new Date().toISOString(),
        },
      ],
    };
  },
};
