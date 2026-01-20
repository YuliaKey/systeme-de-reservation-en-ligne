import nodemailer from "nodemailer";
import { config } from "./index.js";

// Créer le transporteur Nodemailer
export const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: config.email.auth,
});

// Vérifier la connexion au serveur SMTP
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log("Serveur SMTP prêt à envoyer des emails");
    return true;
  } catch (error) {
    console.error(
      "Erreur de connexion au serveur SMTP:",
      (error as Error).message,
    );
    return false;
  }
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<SendEmailResult> => {
  try {
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
      html,
    });

    console.log("Email envoyé:", info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Erreur d'envoi d'email:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};
