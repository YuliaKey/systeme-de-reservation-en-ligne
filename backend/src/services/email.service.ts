import { sendEmail } from "../config/email.js";
import { config } from "../config/index.js";
import {
  EmailNotificationType,
  EmailNotification,
  Reservation,
  Resource,
  User,
} from "../types/index.js";
import { pool } from "../config/database.js";

/**
 * Service pour gérer l'envoi d'emails et leur traçabilité
 */
export class EmailService {
  /**
   * Enregistrer une notification email dans la DB
   */
  private static async logEmailNotification(
    reservationId: string | null,
    type: EmailNotificationType,
    recipient: string,
    status: "sent" | "failed" | "pending",
    errorMessage?: string,
    attempts?: number,
  ): Promise<void> {
    try {
      const errorDetails = errorMessage
        ? `${errorMessage} (après ${attempts || 1} tentative(s))`
        : null;

      await pool.query(
        `INSERT INTO email_notifications (reservation_id, type, recipient, status, error_message, sent_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          reservationId,
          type,
          recipient,
          status,
          errorDetails,
          status === "sent" ? new Date() : null,
        ],
      );

      console.log(
        `[EmailService] Notification enregistrée: ${type} → ${recipient} (${status})`,
      );
    } catch (error) {
      console.error(
        "[EmailService] Erreur lors de l'enregistrement de la notification:",
        error,
      );
    }
  }

  /**
   * Envoyer un email de confirmation de réservation
   */
  static async sendReservationCreatedEmail(
    user: User,
    reservation: Reservation,
    resource: Resource,
  ): Promise<EmailNotification> {
    const subject = `Confirmation de réservation - ${resource.name}`;
    const html = `
      <h2>Réservation confirmée</h2>
      <p>Bonjour ${user.fullName},</p>
      <p>Votre réservation a été confirmée avec succès.</p>
      
      <h3>Détails de la réservation</h3>
      <ul>
        <li><strong>Ressource:</strong> ${resource.name}</li>
        <li><strong>Lieu:</strong> ${resource.location || "N/A"}</li>
        <li><strong>Date et heure:</strong> ${new Date(reservation.startTime).toLocaleString("fr-FR")} - ${new Date(reservation.endTime).toLocaleString("fr-FR")}</li>
        <li><strong>Numéro de réservation:</strong> ${reservation.id}</li>
      </ul>
      
      ${reservation.notes ? `<p><strong>Notes:</strong> ${reservation.notes}</p>` : ""}
      
      <p><a href="${config.frontendUrl}/reservations/${reservation.id}">Voir ma réservation</a></p>
      
      <p>Cordialement,<br>L'équipe ${config.email.from}</p>
    `;

    const result = await sendEmail({
      to: user.email,
      subject,
      html,
      text: `Réservation confirmée pour ${resource.name}`,
    });

    await this.logEmailNotification(
      reservation.id,
      "reservation_created",
      user.email,
      result.success ? "sent" : "failed",
      result.error,
      result.attempts,
    );

    return {
      type: "reservation_created",
      status: result.success ? "sent" : "failed",
      recipient: user.email,
      sentAt: result.success ? new Date() : undefined,
      errorMessage: result.error,
    };
  }

  /**
   * Envoyer un email de modification de réservation
   */
  static async sendReservationUpdatedEmail(
    user: User,
    reservation: Reservation,
    resource: Resource,
  ): Promise<EmailNotification> {
    const subject = `Modification de réservation - ${resource.name}`;
    const html = `
      <h2>Réservation modifiée</h2>
      <p>Bonjour ${user.fullName},</p>
      <p>Votre réservation a été modifiée.</p>
      
      <h3>Nouveaux détails</h3>
      <ul>
        <li><strong>Ressource:</strong> ${resource.name}</li>
        <li><strong>Nouvelle date:</strong> ${new Date(reservation.startTime).toLocaleString("fr-FR")} - ${new Date(reservation.endTime).toLocaleString("fr-FR")}</li>
        <li><strong>Numéro de réservation:</strong> ${reservation.id}</li>
      </ul>
      
      <p><a href="${config.frontendUrl}/reservations/${reservation.id}">Voir ma réservation</a></p>
      
      <p>Cordialement,<br>L'équipe ${config.email.from}</p>
    `;

    const result = await sendEmail({
      to: user.email,
      subject,
      html,
      text: `Réservation modifiée pour ${resource.name}`,
    });

    await this.logEmailNotification(
      reservation.id,
      "reservation_updated",
      user.email,
      result.success ? "sent" : "failed",
      result.error,
      result.attempts,
    );

    return {
      type: "reservation_updated",
      status: result.success ? "sent" : "failed",
      recipient: user.email,
      sentAt: result.success ? new Date() : undefined,
      errorMessage: result.error,
    };
  }

  /**
   * Envoyer un email d'annulation de réservation
   */
  static async sendReservationCancelledEmail(
    user: User,
    reservation: Reservation,
    resource: Resource,
  ): Promise<EmailNotification> {
    const subject = `Annulation de réservation - ${resource.name}`;
    const html = `
      <h2>Réservation annulée</h2>
      <p>Bonjour ${user.fullName},</p>
      <p>Votre réservation a été annulée.</p>
      
      <h3>Détails de la réservation annulée</h3>
      <ul>
        <li><strong>Ressource:</strong> ${resource.name}</li>
        <li><strong>Date:</strong> ${new Date(reservation.startTime).toLocaleString("fr-FR")} - ${new Date(reservation.endTime).toLocaleString("fr-FR")}</li>
        <li><strong>Numéro de réservation:</strong> ${reservation.id}</li>
      </ul>
      
      <p><a href="${config.frontendUrl}/resources">Faire une nouvelle réservation</a></p>
      
      <p>Cordialement,<br>L'équipe ${config.email.from}</p>
    `;

    const result = await sendEmail({
      to: user.email,
      subject,
      html,
      text: `Réservation annulée pour ${resource.name}`,
    });

    await this.logEmailNotification(
      reservation.id,
      "reservation_cancelled",
      user.email,
      result.success ? "sent" : "failed",
      result.error,
      result.attempts,
    );

    return {
      type: "reservation_cancelled",
      status: result.success ? "sent" : "failed",
      recipient: user.email,
      sentAt: result.success ? new Date() : undefined,
      errorMessage: result.error,
    };
  }

  /**
   * Envoyer une notification à l'admin
   */
  static async sendAdminNotification(
    action: string,
    reservation: Reservation,
    resource: Resource,
    user: User,
  ): Promise<EmailNotification> {
    const subject = `[Admin] ${action} - ${resource.name}`;
    const html = `
      <h2>Notification administrateur</h2>
      <p><strong>Action:</strong> ${action}</p>
      
      <h3>Détails</h3>
      <ul>
        <li><strong>Utilisateur:</strong> ${user.fullName} (${user.email})</li>
        <li><strong>Ressource:</strong> ${resource.name}</li>
        <li><strong>Date:</strong> ${new Date(reservation.startTime).toLocaleString("fr-FR")} - ${new Date(reservation.endTime).toLocaleString("fr-FR")}</li>
        <li><strong>ID réservation:</strong> ${reservation.id}</li>
      </ul>
      
      <p><a href="${config.frontendUrl}/admin/reservations/${reservation.id}">Voir dans le dashboard admin</a></p>
    `;

    const result = await sendEmail({
      to: config.admin.email,
      subject,
      html,
      text: `${action} - ${resource.name}`,
    });

    await this.logEmailNotification(
      reservation.id,
      "admin_notification",
      config.admin.email,
      result.success ? "sent" : "failed",
      result.error,
      result.attempts,
    );

    return {
      type: "admin_notification",
      status: result.success ? "sent" : "failed",
      recipient: config.admin.email,
      sentAt: result.success ? new Date() : undefined,
      errorMessage: result.error,
    };
  }

  /**
   * Envoyer un email de suppression de compte
   */
  static async sendAccountDeletedEmail(user: User): Promise<EmailNotification> {
    const subject = "Confirmation de suppression de compte";
    const html = `
      <h2>Compte supprimé</h2>
      <p>Bonjour ${user.fullName},</p>
      <p>Votre compte a été supprimé avec succès comme demandé.</p>
      <p>Toutes vos données personnelles et réservations ont été supprimées de notre système.</p>
      <p>Nous espérons vous revoir bientôt!</p>
      
      <p>Cordialement,<br>L'équipe ${config.email.from}</p>
    `;

    const result = await sendEmail({
      to: user.email,
      subject,
      html,
      text: "Votre compte a été supprimé avec succès",
    });

    await this.logEmailNotification(
      null,
      "account_deleted",
      user.email,
      result.success ? "sent" : "failed",
      result.error,
      result.attempts,
    );

    return {
      type: "account_deleted",
      status: result.success ? "sent" : "failed",
      recipient: user.email,
      sentAt: result.success ? new Date() : undefined,
      errorMessage: result.error,
    };
  }
}
