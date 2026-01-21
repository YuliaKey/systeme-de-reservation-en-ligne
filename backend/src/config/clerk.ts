import { createClerkClient } from "@clerk/express";
import { config } from "./index.js";

// Initialiser le client Clerk avec la clé secrète
export const clerkClient = createClerkClient({
  secretKey: config.clerk.secretKey,
});

// Vérifier si un utilisateur est admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const user = await clerkClient.users.getUser(userId);
    // Vérifier le rôle dans les métadonnées publiques
    return user.publicMetadata?.role === "admin";
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du rôle admin:",
      (error as Error).message,
    );
    return false;
  }
};
