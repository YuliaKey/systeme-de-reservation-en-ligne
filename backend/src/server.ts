import app from "./app.js";
import { config } from "./config/index.js";
import { testConnection } from "./config/database.js";
import { verifyEmailConnection } from "./config/email.js";
import { ReminderService } from "./services/reminder.service.js";

async function startServer() {
  console.log("Démarrage du serveur...");
  console.log(`Environnement: ${config.env}`);

  const dbConnected = await testConnection();
  if (!dbConnected && config.env === "production") {
    console.error(
      "Impossible de se connecter à la base de données en production",
    );
    process.exit(1);
  }

  if (config.email.auth.user && config.email.auth.pass) {
    await verifyEmailConnection();

    // Démarrer le scheduler de rappels
    ReminderService.startScheduler();
  } else {
    console.warn(
      "Configuration email non définie - les emails ne seront pas envoyés",
    );
  }

  app.listen(config.port, () => {
    console.log(`Serveur démarré sur le port ${config.port}`);
    console.log(
      `API disponible sur: http://localhost:${config.port}${config.apiBasePath}`,
    );
    console.log(`Health check: http://localhost:${config.port}/health`);
  });
}

// Gestion des erreurs non capturées
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer();
