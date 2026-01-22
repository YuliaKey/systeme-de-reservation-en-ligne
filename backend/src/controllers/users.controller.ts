import { Response } from "express";
import { getAuth } from "@clerk/express";
import { pool } from "../config/database.js";
import { clerkClient } from "../config/clerk.js";
import { EmailService } from "../services/email.service.js";
import { toCamelCase } from "../utils/caseConverter.js";
import {
  AuthenticatedRequest,
  User,
  UpdateUserRequest,
} from "../types/index.js";
import { NotFoundError, BusinessError } from "../middleware/errorHandler.js";

/**
 * Contrôleur pour les endpoints utilisateurs
 */
export class UsersController {
  /**
   * GET /api/users/me
   * Récupérer le profil de l'utilisateur connecté
   */
  static async getMyProfile(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { userId } = getAuth(req);
      if (!userId) throw new Error("Non authentifié");

      // Vérifier si l'utilisateur existe en DB, sinon le créer
      let userResult = await pool.query<User>(
        "SELECT * FROM users WHERE id = $1",
        [userId],
      );

      if (userResult.rows.length === 0) {
        // Créer l'utilisateur à partir des infos Clerk
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || "";
        const fullName =
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

        await pool.query(
          `INSERT INTO users (id, email, full_name) 
           VALUES ($1, $2, $3)`,
          [userId, email, fullName],
        );

        userResult = await pool.query<User>(
          "SELECT * FROM users WHERE id = $1",
          [userId],
        );
      }

      const user = userResult.rows[0];
      res.json(toCamelCase(user));
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la récupération du profil",
      });
    }
  }

  /**
   * PUT /api/users/me
   * Mettre à jour le profil de l'utilisateur connecté
   */
  static async updateMyProfile(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const data: UpdateUserRequest = req.body;

      // Mettre à jour en DB
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.fullName !== undefined) {
        updates.push(`full_name = $${paramIndex}`);
        values.push(data.fullName);
        paramIndex++;
      }

      if (data.preferences !== undefined) {
        updates.push(`preferences = $${paramIndex}`);
        values.push(JSON.stringify(data.preferences));
        paramIndex++;
      }

      if (updates.length === 0) {
        // Aucune mise à jour
        return await UsersController.getMyProfile(req, res);
      }

      const { userId } = getAuth(req);
      if (!userId) throw new Error("Non authentifié");

      values.push(userId);
      const result = await pool.query<User>(
        `UPDATE users 
         SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramIndex}
         RETURNING *`,
        values,
      );

      if (result.rows.length === 0) {
        throw new NotFoundError("Utilisateur non trouvé");
      }

      // Mettre à jour également dans Clerk si le nom a changé
      if (data.fullName) {
        const nameParts = data.fullName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        await clerkClient.users.updateUser(userId, {
          firstName,
          lastName,
        });
      }

      res.json(toCamelCase(result.rows[0]));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la mise à jour du profil",
      });
    }
  }

  /**
   * DELETE /api/users/me
   * Supprimer le compte de l'utilisateur connecté
   */
  static async deleteMyAccount(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { userId } = getAuth(req);
      if (!userId) throw new Error("Non authentifié");

      // Vérifier qu'il n'y a pas de réservations actives
      const activeReservations = await pool.query(
        `SELECT COUNT(*) as count FROM reservations 
         WHERE user_id = $1 AND status = 'active' AND end_time > NOW()`,
        [userId],
      );

      if (parseInt(activeReservations.rows[0].count) > 0) {
        throw new BusinessError(
          "Impossible de supprimer un compte avec des réservations actives. Veuillez d'abord les annuler.",
        );
      }

      // Récupérer l'utilisateur avant suppression (pour l'email)
      const userResult = await pool.query<User>(
        "SELECT * FROM users WHERE id = $1",
        [userId],
      );

      if (userResult.rows.length === 0) {
        throw new NotFoundError("Utilisateur non trouvé");
      }

      const user = userResult.rows[0];

      // Supprimer d'abord dans la DB (cascade sur réservations et notifications)
      await pool.query("DELETE FROM users WHERE id = $1", [userId]);

      // Ensuite supprimer de Clerk
      await clerkClient.users.deleteUser(userId);

      // Envoyer l'email de confirmation (sans await)
      EmailService.sendAccountDeletedEmail(user).catch((error) =>
        console.error("Erreur lors de l'envoi de l'email:", error),
      );

      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la suppression du compte",
      });
    }
  }
}
