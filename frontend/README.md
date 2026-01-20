# Frontend - Réservation de Salles

## Résumé du projet

Frontend TypeScript + React pour une application de réservation de salles de réunion.
Respecte le contrat OpenAPI défini en Phase 1 du TP.

## Structure du projet

```
src/
├── types/              # Types TypeScript (API contract)
├── services/           # Services API (roomsService, reservationsService, apiClient)
├── hooks/              # Custom hooks (useAsync)
├── components/
│   ├── transverse/     # Composants réutilisables (Layout, Banners, States)
│   └── metier/         # Composants métier (RoomCard, BookingForm, etc.)
├── pages/              # Pages de l'application
├── App.tsx             # Routing principal
├── main.tsx            # Point d'entrée
└── index.css           # Styles globaux
```

## Architecture

### Pages

- `/` - Listing des salles avec recherche
- `/rooms/:id` - Détail salle et sélection de créneau
- `/rooms/:id/book` - Formulaire de réservation
- `/reservations/:id` - Confirmation de réservation
- `/my-reservations` - Mes réservations

### États d'interface

Chaque page gère les états suivants:

- `idle` - État initial
- `loading` - Chargement en cours
- `success` - Données chargées
- `empty` - Aucune donnée
- `error` - Erreur (technique ou métier)

### Communication API

Le `apiClient` centralise les requêtes HTTP et mappe les erreurs en `UiError`.
Les services `roomsService` et `reservationsService` consomment l'API selon le contrat.

## Installation et démarrage

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Preview du build
npm run preview
```

## Mode Mock (Sans Backend)

L'application peut fonctionner **sans backend** grâce au système de mock intégré.

### Activer/Désactiver le mode Mock

Éditez `.env.development` :

```env
# Mode MOCK (données simulées - par défaut)
VITE_USE_MOCK=true

# Mode REAL (nécessite le backend sur http://localhost:3000)
VITE_USE_MOCK=false
```

### Données Mock disponibles

- **5 salles** de réunion avec différentes capacités (6 à 100 personnes)
- **3 réservations** pré-créées (2 confirmées, 1 annulée)
- Créneaux de disponibilité générés aléatoirement
- Validation des conflits de réservation
- Délais réseau simulés (300-600ms)

### Exemples de recherche

**Recherche simple :**

- Dates : 2026-01-25 09:00 → 2026-01-25 17:00
- Capacité : 10 personnes

**Recherche avec filtres :**

- Dates : 2026-01-26 10:00 → 2026-01-26 12:00
- Capacité : 10 personnes
- Localisation : 2ème
- Équipements : Wifi,Projecteur

## Fonctionnalités implémentées

✅ Consultation de la liste des salles avec filtres
✅ Consultation du détail d'une salle
✅ Sélection de créneau de disponibilité
✅ Création d'une réservation
✅ Confirmation de réservation avec numéro
✅ Consultation de mes réservations
✅ Annulation de réservation
✅ Feedback utilisateur clair (succès/erreur)
✅ Distinction erreurs techniques vs métier
✅ Gestion d'état cohérente
