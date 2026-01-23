# Frontend - Application de Réservation de salles de réunions

Application React avec TypeScript, Tailwind CSS et Clerk pour l'authentification.

## Technologies

- **React 18.2** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Framework CSS utility-first
- **Clerk** - Authentification et gestion d'utilisateurs
- **React Query** - Gestion de l'état serveur et cache
- **React Router** - Routing
- **React Hook Form + Zod** - Validation de formulaires
- **Axios** - Client HTTP
- **Lucide React** - Icônes
- **React Hot Toast** - Notifications

## Structure du projet

```
src/
├── components/
│   ├── ui/              # Composants UI réutilisables
│   │   ├── Loading.tsx
│   │   ├── ErrorState.tsx
│   │   └── EmptyState.tsx
│   └── features/        # Composants métier
├── hooks/
│   └── useCurrentUser.ts
├── layouts/
│   └── MainLayout.tsx   # Layout principal avec header/footer
├── pages/               # Pages de l'application
│   ├── HomePage.tsx
│   ├── SignInPage.tsx
│   ├── ResourcesListPage.tsx
│   ├── ResourceDetailPage.tsx
│   ├── ReservationsPage.tsx
│   ├── ReservationDetailPage.tsx
│   ├── HistoryPage.tsx
│   ├── ProfilePage.tsx
│   ├── AdminDashboardPage.tsx
│   ├── AdminResourcesPage.tsx
│   ├── AdminReservationsPage.tsx
│   └── NotFoundPage.tsx
├── services/            # Services API
│   ├── api.ts
│   ├── resources.service.ts
│   ├── reservations.service.ts
│   ├── users.service.ts
│   └── admin.service.ts
├── types/
│   └── index.ts         # Types TypeScript
├── utils/               # Utilitaires
│   ├── date.ts
│   └── format.ts
├── App.tsx              # Configuration des routes
├── main.tsx             # Point d'entrée avec providers
└── index.css            # Styles globaux et Tailwind

```

## Installation

1. **Installer les dépendances**

```bash
cd frontend
npm install
```

2. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du dossier frontend :

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
VITE_API_URL=http://localhost:3000/api
```

Pour obtenir votre clé Clerk :

- Créez un compte sur [clerk.com](https://clerk.com)
- Créez une nouvelle application
- Copiez la "Publishable Key" depuis le dashboard
- Configurez les méthodes d'authentification (Email, Magic Link, etc.)

3. **Lancer le serveur de développement**

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Pages disponibles

### Pages publiques

- `/` - Page d'accueil
- `/sign-in` - Page de connexion (Clerk)

### Pages utilisateur (authentification requise)

- `/resources` - Liste des ressources
- `/resources/:id` - Détail d'une ressource
- `/reservations` - Mes réservations actives
- `/reservations/:id` - Détail d'une réservation
- `/history` - Historique de toutes mes réservations
- `/profile` - Mon profil utilisateur

### Pages administrateur (authentification + rôle admin requis)

- `/admin` - Dashboard administrateur avec statistiques
- `/admin/resources` - Gestion des ressources
- `/admin/reservations` - Gestion des réservations

### Pages système

- `*` (404) - Page introuvable

## Authentification

L'authentification est gérée par **Clerk** avec :

- Magic Link (lien email)
- 2FA (authentification à deux facteurs)
- Gestion de session automatique
- Protection des routes

## Services API

Tous les services utilisent **Axios** avec:

- Intercepteur pour ajouter le token Clerk automatiquement
- Gestion d'erreurs centralisée
- Base URL configurable via `.env`

## États de l'UI

Chaque requête réseau gère 4 états :

1. **Loading** - Affichage d'un spinner ou skeleton
2. **Success** - Affichage des données + toast de succès
3. **Error** - Affichage d'un message d'erreur + toast d'erreur
4. **Empty** - Affichage d'un état vide si aucune donnée

## Tailwind CSS

Classes utilitaires personnalisées disponibles dans `index.css` :

### Boutons

- `.btn` - Style de base
- `.btn-primary` - Bouton principal (bleu)
- `.btn-secondary` - Bouton secondaire (gris)
- `.btn-danger` - Bouton de danger (rouge)
- `.btn-sm` / `.btn-lg` - Tailles

### Cartes

- `.card` - Carte avec ombre et padding

### Badges

- `.badge-green` - Badge vert (actif, disponible, envoyé)
- `.badge-yellow` - Badge jaune (modifié, maintenance)
- `.badge-red` - Badge rouge (annulé, indisponible, échoué)
- `.badge-gray` - Badge gris (passé, autre)
- `.badge-blue` - Badge bleu (info)

### Formulaires

- `.input` - Style d'input de base

## Scripts disponibles

```bash
npm run dev        # Lancer le serveur de développement
npm run build      # Build de production
npm run preview    # Prévisualiser le build
npm run lint       # Linter le code
```
