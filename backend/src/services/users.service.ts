import { pool } from "../config/database.js";

export interface User {
  id: string; // Clerk user ID
  email: string;
  fullName: string;
  phone?: string;
  role: "user" | "admin";
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UsersService {
  /**
   * Créer ou mettre à jour un utilisateur depuis Clerk
   */
  static async syncUserFromClerk(
    clerkUserId: string,
    email: string,
    fullName: string,
    phone?: string,
  ): Promise<User> {
    const result = await pool.query<User>(
      `INSERT INTO users (id, email, full_name, phone, role, two_factor_enabled, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'user', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) 
       DO UPDATE SET 
         email = EXCLUDED.email,
         full_name = EXCLUDED.full_name,
         phone = EXCLUDED.phone,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [clerkUserId, email, fullName, phone || null],
    );

    return result.rows[0];
  }

  /**
   * Récupérer un utilisateur par son ID Clerk
   */
  static async getUserById(clerkUserId: string): Promise<User | null> {
    const result = await pool.query<User>(`SELECT * FROM users WHERE id = $1`, [
      clerkUserId,
    ]);

    return result.rows[0] || null;
  }

  /**
   * Récupérer un utilisateur par email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );

    return result.rows[0] || null;
  }

  /**
   * Supprimer un utilisateur
   */
  static async deleteUser(clerkUserId: string): Promise<void> {
    await pool.query(`DELETE FROM users WHERE id = $1`, [clerkUserId]);
  }

  /**
   * Mettre à jour le rôle d'un utilisateur
   */
  static async updateUserRole(
    clerkUserId: string,
    role: "user" | "admin",
  ): Promise<User> {
    const result = await pool.query<User>(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [role, clerkUserId],
    );

    return result.rows[0];
  }
}
