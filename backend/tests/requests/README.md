# Guide d'utilisation des fichiers REST Client

## Installation

Installer l'extension VS Code **REST Client** :

- ID: `humao.rest-client`
- [Lien marketplace](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

## Configuration

1. Ouvrir le fichier `tests/requests/api.http`
2. Remplacer `@token` par votre JWT token Clerk réel
3. Remplacer les IDs (`resource_id_here`, `reservation_id_here`) par les vrais IDs de votre base

## Utilisation

1. Cliquer sur **"Send Request"** au-dessus de chaque requête HTTP
2. La réponse s'affichera dans un panneau à droite
3. Les variables `{{baseUrl}}` et `{{token}}` sont automatiquement remplacées

## Obtenir un token JWT Clerk

### Option 1 : Depuis le frontend (recommandé)

```javascript
// Dans votre frontend React avec Clerk
import { useAuth } from '@clerk/clerk-react';

function MyComponent() {
  const { getToken } = useAuth();

  const token = await getToken();
  console.log('JWT Token:', token);
}
```

### Option 2 : Depuis le dashboard Clerk

1. Aller sur [dashboard.clerk.com](https://dashboard.clerk.com)
2. Sélectionner votre application
3. Aller dans "Sessions" > "Session tokens"
4. Copier un token de test

### Option 3 : Pour les tests (développement uniquement)

Créer un endpoint de test temporaire dans le backend :

```javascript
// À SUPPRIMER EN PRODUCTION
app.get("/test/generate-token", async (req, res) => {
  const testToken = "test_token_for_development";
  res.json({ token: testToken });
});
```

## Workflow de test recommandé

1. **Health Check** - Vérifier que le serveur fonctionne
2. **Auth Session** - Tester l'authentification
3. **Users** - Tester le profil utilisateur
4. **Resources** - Tester les ressources
5. **Reservations** - Tester les réservations
6. **Admin** - Tester les fonctions admin (avec un compte admin)

## Tips

- Utilisez `###` pour séparer les requêtes
- Variables disponibles : `@baseUrl`, `@token`
- Raccourci : `Ctrl+Alt+R` (Windows/Linux) ou `Cmd+Alt+R` (Mac) pour envoyer une requête
- Vous pouvez enregistrer les réponses avec le bouton "Save Response"

## Structure des requêtes

```http
### Nom de la requête
METHOD {{baseUrl}}/endpoint
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "data": "value"
}
```

## Exemples de réponses attendues

### Succès (200/201)

```json
{
  "id": "res_123",
  "status": "active",
  ...
}
```

### Erreur (400/404/500)

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Description de l'erreur",
    "details": {}
  }
}
```
