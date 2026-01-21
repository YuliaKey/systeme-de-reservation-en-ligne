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
  attempts?: number;
}

/**
 * Envoyer un email avec système de retry
 * @param options Options de l'email
 * @param maxRetries Nombre maximum de tentatives (défaut: 3)
 * @param retryDelay Délai entre les tentatives en ms (défaut: 2000)
 */
export const sendEmail = async (
  { to, subject, html, text }: SendEmailOptions,
  maxRetries: number = 3,
  retryDelay: number = 2000,
): Promise<SendEmailResult> => {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Email] Tentative ${attempt}/${maxRetries} - Envoi à ${to}`);

      const info = await transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        text,
        html,
      });

      console.log(
        `[Email] ✓ Envoyé avec succès (${info.messageId}) après ${attempt} tentative(s)`,
      );
      return {
        success: true,
        messageId: info.messageId,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error as Error;
      console.error(
        `[Email] ✗ Échec tentative ${attempt}/${maxRetries}:`,
        lastError.message,
      );

      // Si ce n'est pas la dernière tentative, attendre avant de réessayer
      if (attempt < maxRetries) {
        console.log(`[Email] ⏱ Nouvelle tentative dans ${retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  // Toutes les tentatives ont échoué
  console.error(
    `[Email] ✗ ÉCHEC DÉFINITIF après ${maxRetries} tentatives:`,
    lastError?.message,
  );
  return {
    success: false,
    error: lastError?.message || "Erreur inconnue",
    attempts: maxRetries,
  };
};

/**
 * Fonction de test pour l'envoi d'email en développement
 * Permet de vérifier la configuration SMTP sans créer de réservation
 */
export const sendTestEmail = async (to: string): Promise<SendEmailResult> => {
  console.log("[Email Test] Envoi d'un email de test...");

  const result = await sendEmail({
    to,
    subject: "Test - Configuration Email",
    html: `
      <h2>Test de Configuration Email</h2>
      <p>Ceci est un email de test pour vérifier la configuration SMTP.</p>
      <p><strong>Environnement:</strong> ${config.env}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString("fr-FR")}</p>
      <p>Si vous recevez cet email, la configuration fonctionne correctement ✓</p>
    `,
    text: "Email de test - Configuration SMTP OK",
  });

  if (result.success) {
    console.log(`[Email Test] ✓ Email de test envoyé avec succès à ${to}`);
  } else {
    console.error(
      `[Email Test] ✗ Échec de l'envoi de l'email de test: ${result.error}`,
    );
  }

  return result;
};
