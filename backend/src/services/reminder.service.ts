import cron from "node-cron";
import { pool } from "../config/database.js";
import { EmailService } from "./email.service.js";
import { ResourceService } from "./resource.service.js";
import { Reservation, User } from "../types/index.js";

/**
 * Service pour gérer les rappels automatiques de réservations
 */
export class ReminderService {
  private static isRunning = false;

  /**
   * Démarrer le scheduler de rappels
   * Vérifie toutes les heures s'il y a des réservations nécessitant un rappel
   */
  static startScheduler(): void {
    if (this.isRunning) {
      console.log("[ReminderService] Scheduler already running");
      return;
    }

    // Exécuter toutes les heures à la minute 0
    cron.schedule("0 * * * *", async () => {
      console.log(
        `[ReminderService] Vérification des rappels à ${new Date().toLocaleString("fr-FR")}`,
      );
      await this.checkAndSendReminders();
    });

    // Exécution immédiate au démarrage (pour le développement)
    this.checkAndSendReminders().catch((error) =>
      console.error("[ReminderService] Erreur lors du premier check:", error),
    );

    this.isRunning = true;
    console.log(
      "[ReminderService] ✓ Scheduler démarré - vérification toutes les heures",
    );
  }

  /**
   * Arrêter le scheduler
   */
  static stopScheduler(): void {
    cron.getTasks().forEach((task) => task.stop());
    this.isRunning = false;
    console.log("[ReminderService] Scheduler arrêté");
  }

  /**
   * Vérifier et envoyer les rappels pour les réservations à venir
   */
  static async checkAndSendReminders(): Promise<void> {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

      // Récupérer les réservations actives dans les prochaines 24 heures
      const result = await pool.query<Reservation>(
        `SELECT r.* 
         FROM reservations r
         WHERE r.status = 'active'
           AND r.start_time > $1
           AND r.start_time <= $2
         ORDER BY r.start_time ASC`,
        [now, in24Hours],
      );

      console.log(
        `[ReminderService] ${result.rows.length} réservation(s) dans les prochaines 24h`,
      );

      for (const reservation of result.rows) {
        await this.sendReminderIfNeeded(reservation, now, in1Hour, in24Hours);
      }
    } catch (error) {
      console.error(
        "[ReminderService] Erreur lors de la vérification des rappels:",
        error,
      );
    }
  }

  /**
   * Envoyer un rappel si nécessaire (et si pas déjà envoyé)
   */
  private static async sendReminderIfNeeded(
    reservation: Reservation,
    now: Date,
    in1Hour: Date,
    in24Hours: Date,
  ): Promise<void> {
    try {
      const startTime = new Date(reservation.startTime);
      const hoursUntil =
        (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Déterminer le type de rappel (H-1 ou J-1)
      let reminderType: "1hour" | "24hours" | null = null;

      if (hoursUntil <= 1.5 && hoursUntil >= 0.5) {
        // Rappel H-1 (entre 30min et 1h30 avant)
        reminderType = "1hour";
      } else if (hoursUntil <= 25 && hoursUntil >= 23) {
        // Rappel J-1 (entre 23h et 25h avant)
        reminderType = "24hours";
      }

      if (!reminderType) {
        return; // Pas dans la fenêtre de rappel
      }

      // Vérifier si un rappel a déjà été envoyé
      const existingReminder = await pool.query(
        `SELECT id FROM email_notifications
         WHERE reservation_id = $1
           AND type = 'reservation_reminder'
           AND status = 'sent'
           AND created_at > $2`,
        [reservation.id, new Date(now.getTime() - 2 * 60 * 60 * 1000)], // Dans les 2 dernières heures
      );

      if (existingReminder.rows.length > 0) {
        console.log(
          `[ReminderService] Rappel déjà envoyé pour réservation ${reservation.id}`,
        );
        return;
      }

      // Récupérer l'utilisateur
      const userResult = await pool.query<User>(
        "SELECT * FROM users WHERE id = $1",
        [reservation.userId],
      );

      if (userResult.rows.length === 0) {
        console.error(
          `[ReminderService] Utilisateur introuvable pour réservation ${reservation.id}`,
        );
        return;
      }

      const user = userResult.rows[0];

      // Récupérer la ressource
      const resource = await ResourceService.getResourceById(
        reservation.resourceId,
      );

      // Envoyer le rappel
      const hoursUntilRounded = Math.round(hoursUntil);
      await EmailService.sendReservationReminderEmail(
        user,
        reservation,
        resource,
        hoursUntilRounded,
      );

      console.log(
        `[ReminderService] ✓ Rappel envoyé pour réservation ${reservation.id} (${reminderType})`,
      );
    } catch (error) {
      console.error(
        `[ReminderService] Erreur lors de l'envoi du rappel pour ${reservation.id}:`,
        error,
      );
    }
  }

  /**
   * Test manuel - envoyer des rappels immédiatement (pour développement)
   */
  static async sendTestReminder(reservationId: string): Promise<void> {
    try {
      const result = await pool.query<Reservation>(
        "SELECT * FROM reservations WHERE id = $1",
        [reservationId],
      );

      if (result.rows.length === 0) {
        throw new Error("Réservation introuvable");
      }

      const reservation = result.rows[0];

      const userResult = await pool.query<User>(
        "SELECT * FROM users WHERE id = $1",
        [reservation.userId],
      );

      if (userResult.rows.length === 0) {
        throw new Error("Utilisateur introuvable");
      }

      const user = userResult.rows[0];
      const resource = await ResourceService.getResourceById(
        reservation.resourceId,
      );

      const now = new Date();
      const startTime = new Date(reservation.startTime);
      const hoursUntil = Math.round(
        (startTime.getTime() - now.getTime()) / (1000 * 60 * 60),
      );

      await EmailService.sendReservationReminderEmail(
        user,
        reservation,
        resource,
        hoursUntil,
      );

      console.log(
        `[ReminderService] ✓ Test reminder sent for ${reservationId}`,
      );
    } catch (error) {
      console.error("[ReminderService] Erreur test reminder:", error);
      throw error;
    }
  }
}
