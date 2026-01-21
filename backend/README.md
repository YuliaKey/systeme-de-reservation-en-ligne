# Backend API - Système de Réservation

API REST pour la plateforme de réservation en ligne.

## Technologies

- **Node.js** + **Express** + **TypeScript** - Framework backend
- **PostgreSQL** - Base de données
- **Clerk** - Authentification et gestion des utilisateurs
- **Nodemailer** - Envoi d'emails

## Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Créer la base de données PostgreSQL
# Se connecter à PostgreSQL et exécuter :
# CREATE DATABASE reservation_db;

# Exécuter les migrations
npm run db:migrate

# (Optionnel) Insérer des données de test
npm run db:seed
```

## Démarrage

```bash
# Mode développement (avec hot-reload)
npm run dev

# Build TypeScript
npm run build

# Mode production (après build)
npm start

# Vérification des types sans compilation
npm run type-check
```

L'API sera accessible sur `http://localhost:3001/api`

## Structure du projet

```
backend/
├── src/
│   ├── server.ts              # Point d'entrée
│   ├── app.ts                 # Configuration Express
│   ├── config/
│   │   ├── index.ts           # Configuration générale
│   │   ├── database.ts        # Configuration PostgreSQL
│   │   ├── clerk.ts           # Configuration Clerk
│   │   └── email.ts           # Configuration Nodemailer
│   ├── db/
│   │   ├── migrate.ts         # Script de migration
│   │   ├── seed.ts            # Données de test
│   │   └── schema.sql         # Schéma de la base de données
│   ├── middleware/
│   │   ├── auth.ts            # Middleware d'authentification
│   │   ├── errorHandler.ts   # Gestion des erreurs
│   │   └── validateRequest.ts # Validation des requêtes
│   ├── routes/
│   │   ├── auth.routes.ts     # Routes d'authentification
│   │   ├── users.routes.ts    # Routes utilisateurs
│   │   ├── resources.routes.ts # Routes ressources
│   │   ├── reservations.routes.ts # Routes réservations
│   │   └── admin.routes.ts    # Routes admin
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── resources.controller.ts
│   │   ├── reservations.controller.ts
│   │   └── admin.controller.ts
│   ├── services/
│   │   ├── email.service.ts   # Service d'envoi d'emails
│   │   ├── auth.service.ts    # Logique métier auth
│   │   └── ...
│   ├── types/
│   │   └── index.ts           # Types TypeScript personnalisés
│   └── utils/
│       ├── errorResponse.ts   # Utilitaires pour les erreurs
│       └── validators.ts      # Validateurs personnalisés
├── dist/                      # Fichiers compilés (généré)
├── tests/requests/            # Fichiers .http pour RestClient
├── tsconfig.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Scripts disponibles

- `npm run dev` - Démarre le serveur en mode développement avec hot-reload
- `npm run build` - Compile TypeScript vers JavaScript dans dist/
- `npm start` - Démarre le serveur en mode production
- `npm run db:migrate` - Exécute les migrations de base de données
- `npm run db:seed` - Insère les données de test
- `npm run type-check` - Vérifie les types TypeScript sans compiler

## Endpoints disponibles

### Authentification

- `POST /api/auth/register` - Créer un nouveau compte utilisateur
- `POST /api/auth/login` - Se connecter (magic link via Clerk)
- `POST /api/auth/logout` - Se déconnecter
- `GET /api/auth/me` - Récupérer les informations de l'utilisateur connecté

### Utilisateurs

- `GET /api/users/:id` - Récupérer un profil utilisateur
- `PUT /api/users/:id` - Mettre à jour son profil
- `DELETE /api/users/:id` - Supprimer son compte

### Ressources (Salles/Espaces)

- `GET /api/resources` - Lister toutes les ressources disponibles
- `GET /api/resources/:id` - Récupérer les détails d'une ressource
- `POST /api/resources` - Créer une ressource (admin uniquement)
- `PUT /api/resources/:id` - Modifier une ressource (admin uniquement)
- `DELETE /api/resources/:id` - Supprimer une ressource (admin uniquement)
- `GET /api/resources/:id/availability` - Vérifier les disponibilités d'une ressource

### Réservations

- `GET /api/reservations` - Lister ses réservations
- `GET /api/reservations/:id` - Récupérer les détails d'une réservation
- `POST /api/reservations` - Créer une réservation
- `PUT /api/reservations/:id` - Modifier une réservation
- `DELETE /api/reservations/:id` - Annuler une réservation

### Administration

- `GET /api/admin/reservations` - Lister toutes les réservations (admin)
- `PUT /api/admin/reservations/:id/status` - Modifier le statut d'une réservation (admin)
- `POST /api/admin/test-email` - Tester l'envoi d'emails (admin)
- `GET /api/admin/email-logs` - Consulter les logs d'emails (admin)
- `POST /api/admin/maintenance/update-past-reservations` - Mise à jour des réservations passées (admin)

## Tests avec RestClient

Les fichiers `.http` dans le dossier `tests/requests/` permettent de tester les endpoints directement depuis VS Code avec l'extension REST Client.

## API Documentation

Voir le contrat OpenAPI : `/openapi-reservation-fullstack.yaml`
