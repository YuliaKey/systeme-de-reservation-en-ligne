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

**Note:** Inscription/Connexion/Déconnexion gérées par Clerk côté frontend

- `GET /api/auth/session` - Récupérer les informations de session (requiert authentification)

### Utilisateurs

- `GET /api/users/me` - Récupérer son profil (requiert authentification)
- `PUT /api/users/me` - Mettre à jour son profil (requiert authentification)
- `DELETE /api/users/me` - Supprimer son compte (requiert authentification)

### Ressources (Salles/Espaces)

- `GET /api/resources` - Lister toutes les ressources disponibles
- `GET /api/resources/:id` - Récupérer les détails d'une ressource
- `GET /api/resources/:id/availability` - Vérifier les disponibilités d'une ressource
- `POST /api/resources` - Créer une ressource (admin uniquement)
- `PUT /api/resources/:id` - Modifier une ressource (admin uniquement)
- `DELETE /api/resources/:id` - Supprimer une ressource (admin uniquement)

### Réservations

- `GET /api/reservations` - Lister ses réservations (requiert authentification)
- `GET /api/reservations/history` - Récupérer son historique (requiert authentification)
- `GET /api/reservations/:id` - Récupérer les détails d'une réservation (requiert authentification)
- `POST /api/reservations` - Créer une réservation (requiert authentification)
- `PUT /api/reservations/:id` - Modifier une réservation (requiert authentification)
- `DELETE /api/reservations/:id` - Annuler une réservation (requiert authentification)

### Administration

- `GET /api/admin/reservations` - Lister toutes les réservations (admin uniquement)
- `GET /api/admin/reservations/:id` - Récupérer une réservation spécifique (admin uniquement)
- `DELETE /api/admin/reservations/:id` - Supprimer définitivement une réservation (admin uniquement)
- `GET /api/admin/statistics` - Récupérer les statistiques globales (admin uniquement)
- `POST /api/admin/test-email` - Tester l'envoi d'emails (admin uniquement)
- `GET /api/admin/email-logs` - Consulter les logs d'emails (admin uniquement)
- `POST /api/admin/maintenance/update-past-reservations` - Mise à jour des réservations passées (admin uniquement)

## Tester l'authentification sans frontend

### Option 1 : Page HTML de test (Recommandé)

1. Ouvrir `test-auth.html` dans un navigateur
2. Remplacer `pk_test_YOUR_KEY_HERE` par votre clé publique Clerk
3. Se connecter avec le composant Clerk
4. Copier le token JWT et tester les endpoints

### Option 2 : Via Clerk Dashboard

1. Aller dans Clerk Dashboard → Users → Votre utilisateur
2. Cliquer "Sign in as user"
3. Ouvrir DevTools Console
4. Taper : `await window.Clerk.session.getToken()`
5. Copier le token dans `tests/requests/api.http`

## Tests avec RestClient

Les fichiers `.http` dans le dossier `tests/requests/` permettent de tester les endpoints directement depuis VS Code avec l'extension REST Client.

## API Documentation

Voir le contrat OpenAPI : `/openapi-reservation-fullstack.yaml`
