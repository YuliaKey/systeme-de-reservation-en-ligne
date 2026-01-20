import {
  Room,
  PaginatedRooms,
  AvailabilityResponse,
  ListRoomsParams,
  GetAvailabilityParams,
} from "../types";

// Données mock
const mockRooms: Room[] = [
  {
    id: "1",
    name: "Salle de conférence A",
    capacity: 20,
    location: "3ème étage - Aile Est",
    amenities: ["Projecteur", "Wifi", "Tableau blanc", "Visioconférence"],
    pricePerHour: 75,
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    ],
    description:
      "Grande salle de conférence avec vue panoramique, idéale pour les réunions importantes.",
  },
  {
    id: "2",
    name: "Salle créative",
    capacity: 8,
    location: "2ème étage - Zone Innovation",
    amenities: ["Tableau blanc", "Wifi", "Écran tactile"],
    pricePerHour: 45,
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
    ],
    description: "Espace moderne et coloré pour vos sessions de brainstorming.",
  },
  {
    id: "3",
    name: "Salle de réunion B",
    capacity: 6,
    location: "1er étage - Aile Ouest",
    amenities: ["Wifi", "Écran TV"],
    pricePerHour: 30,
    images: [
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800",
    ],
    description: "Salle intime pour les petites réunions d'équipe.",
  },
  {
    id: "4",
    name: "Auditorium",
    capacity: 100,
    location: "Rez-de-chaussée",
    amenities: ["Projecteur", "Sonorisation", "Scène", "Visioconférence"],
    pricePerHour: 200,
    images: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
    ],
    description:
      "Grand auditorium pour vos événements et présentations importantes.",
  },
  {
    id: "5",
    name: "Salle exécutive",
    capacity: 12,
    location: "4ème étage - Direction",
    amenities: ["Wifi", "Tableau blanc", "Visioconférence", "Catering"],
    pricePerHour: 90,
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800",
    ],
    description: "Salle haut de gamme pour les réunions de direction.",
  },
];

// Simuler un délai réseau
const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const roomsServiceMock = {
  async listRooms(params: ListRoomsParams): Promise<PaginatedRooms> {
    await delay(400);

    let filtered = [...mockRooms];

    // Filtrer par capacité
    if (params.capacity) {
      filtered = filtered.filter((room) => room.capacity >= params.capacity!);
    }

    // Filtrer par localisation
    if (params.location) {
      filtered = filtered.filter((room) =>
        room.location.toLowerCase().includes(params.location!.toLowerCase()),
      );
    }

    // Filtrer par équipements
    if (params.amenities) {
      const requestedAmenities = params.amenities.split(",");
      filtered = filtered.filter((room) =>
        requestedAmenities.every((amenity) =>
          room.amenities.some((a) =>
            a.toLowerCase().includes(amenity.toLowerCase()),
          ),
        ),
      );
    }

    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
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

  async getRoom(roomId: string): Promise<Room> {
    await delay(300);

    const room = mockRooms.find((r) => r.id === roomId);
    if (!room) {
      throw {
        type: "business",
        message: "Salle non trouvée",
        code: "ROOM_NOT_FOUND",
        retryable: false,
      };
    }

    return room;
  },

  async getAvailability(
    params: GetAvailabilityParams,
  ): Promise<AvailabilityResponse> {
    await delay(350);

    const startDate = new Date(params.start);
    const endDate = new Date(params.end);
    const stepMinutes = params.stepMinutes || 30;

    const slots = [];
    let current = new Date(startDate);

    while (current < endDate) {
      const slotEnd = new Date(current.getTime() + stepMinutes * 60000);
      if (slotEnd > endDate) break;

      // Simuler des disponibilités aléatoires (70% disponibles)
      const available = Math.random() > 0.3;

      slots.push({
        start: current.toISOString(),
        end: slotEnd.toISOString(),
        available,
      });

      current = slotEnd;
    }

    return {
      roomId: params.roomId,
      slots,
    };
  },
};
