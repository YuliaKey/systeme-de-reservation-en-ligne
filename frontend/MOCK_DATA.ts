// Mock data pour tester le frontend sans backend

export const mockRooms = [
  {
    id: "room_001",
    name: "La Réunion Skyline",
    capacity: 12,
    location: "Paris 10 - Métro Belleville",
    amenities: ["wifi", "vidéoprojecteur", "tableau blanc", "climatisation"],
    pricePerHour: 85.0,
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    ],
    description:
      "Salle de réunion modernes avec vue sur la ville. Équipée des technologies les plus récentes.",
  },
  {
    id: "room_002",
    name: "L'Atelier Créatif",
    capacity: 8,
    location: "Paris 11 - République",
    amenities: ["wifi", "tableau blanc", "caméra 4K"],
    pricePerHour: 65.0,
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    ],
    description:
      "Espace de collaboration créative avec ambiance moderne et agréable.",
  },
  {
    id: "room_003",
    name: "L'Executive Suite",
    capacity: 20,
    location: "Paris 8 - Champs-Élysées",
    amenities: ["wifi", "vidéoprojecteur", "écran tactile", "café gratuit"],
    pricePerHour: 150.0,
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    ],
    description:
      "Salle presqu'exclusive pour les grands séminaires et présentations.",
  },
  {
    id: "room_004",
    name: "Le Coworking Space",
    capacity: 4,
    location: "Paris 13 - Gobelins",
    amenities: ["wifi", "climatisation"],
    pricePerHour: 35.0,
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    ],
    description:
      "Petit espace idéal pour une team réduite ou des réunions privées.",
  },
  {
    id: "room_005",
    name: "La Salle Auditorium",
    capacity: 50,
    location: "Paris 15 - Montparnasse",
    amenities: ["wifi", "vidéoprojecteur", "système son", "scène"],
    pricePerHour: 250.0,
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    ],
    description:
      "Grand auditorium avec scène et système son professionnel pour conférences.",
  },
];

export const mockAvailabilitySlots = [
  {
    start: "2026-01-19T09:00:00Z",
    end: "2026-01-19T09:30:00Z",
    available: true,
  },
  {
    start: "2026-01-19T09:30:00Z",
    end: "2026-01-19T10:00:00Z",
    available: true,
  },
  {
    start: "2026-01-19T10:00:00Z",
    end: "2026-01-19T10:30:00Z",
    available: false,
  },
  {
    start: "2026-01-19T10:30:00Z",
    end: "2026-01-19T11:00:00Z",
    available: true,
  },
  {
    start: "2026-01-19T11:00:00Z",
    end: "2026-01-19T11:30:00Z",
    available: true,
  },
  {
    start: "2026-01-19T11:30:00Z",
    end: "2026-01-19T12:00:00Z",
    available: true,
  },
  {
    start: "2026-01-19T12:00:00Z",
    end: "2026-01-19T12:30:00Z",
    available: false,
  },
  {
    start: "2026-01-19T12:30:00Z",
    end: "2026-01-19T13:00:00Z",
    available: false,
  },
  {
    start: "2026-01-19T13:00:00Z",
    end: "2026-01-19T13:30:00Z",
    available: true,
  },
  {
    start: "2026-01-19T13:30:00Z",
    end: "2026-01-19T14:00:00Z",
    available: true,
  },
  {
    start: "2026-01-19T14:00:00Z",
    end: "2026-01-19T14:30:00Z",
    available: true,
  },
  {
    start: "2026-01-19T14:30:00Z",
    end: "2026-01-19T15:00:00Z",
    available: false,
  },
  {
    start: "2026-01-19T15:00:00Z",
    end: "2026-01-19T15:30:00Z",
    available: true,
  },
  {
    start: "2026-01-19T15:30:00Z",
    end: "2026-01-19T16:00:00Z",
    available: true,
  },
];

export const mockReservations = [
  {
    id: "res_001",
    roomId: "room_001",
    userId: "user_123",
    start: "2026-01-22T09:00:00Z",
    end: "2026-01-22T10:30:00Z",
    status: "CONFIRMED",
    createdAt: "2026-01-19T14:30:00Z",
  },
  {
    id: "res_002",
    roomId: "room_003",
    userId: "user_123",
    start: "2026-01-25T14:00:00Z",
    end: "2026-01-25T16:00:00Z",
    status: "CONFIRMED",
    createdAt: "2026-01-19T10:00:00Z",
  },
  {
    id: "res_003",
    roomId: "room_002",
    userId: "user_123",
    start: "2026-01-20T11:00:00Z",
    end: "2026-01-20T12:00:00Z",
    status: "CANCELLED",
    createdAt: "2026-01-18T09:00:00Z",
  },
];
