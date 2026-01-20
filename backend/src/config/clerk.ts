import {
  createClerkClient,
  type ClerkClient,
  verifyToken,
} from "@clerk/clerk-sdk-node";
import { config } from "./index.js";

// Initialiser Clerk avec la clé secrète
export const clerk: ClerkClient = createClerkClient({
  secretKey: config.clerk.secretKey,
});

// Vérifier un token JWT Clerk
export const verifyClerkToken = async (token: string): Promise<any> => {
  try {
    // Utiliser verifyToken directement depuis le SDK
    const payload = await verifyToken(token, {
      secretKey: config.clerk.secretKey!,
    });
    return payload;
  } catch (error) {
    console.error(
      "Erreur de vérification du token Clerk:",
      (error as Error).message,
    );
    throw new Error("Token invalide ou expiré");
  }
};

// Récupérer un utilisateur Clerk par ID
export const getClerkUser = async (userId: string): Promise<any> => {
  try {
    const user = await clerk.users.getUser(userId);
    return user;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'utilisateur Clerk:",
      (error as Error).message,
    );
    throw error;
  }
};

// Vérifier si un utilisateur est admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const user = await getClerkUser(userId);
    // Vérifier le rôle dans les métadonnées publiques ou privées
    return (
      user.publicMetadata?.role === "admin" ||
      user.privateMetadata?.role === "admin"
    );
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du rôle admin:",
      (error as Error).message,
    );
    return false;
  }
};
