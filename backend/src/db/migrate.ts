import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pool } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate(): Promise<void> {
  console.log("Démarrage de la migration de la base de données...");

  try {
    // Lire le fichier schema.sql
    const schemaPath = join(__dirname, "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    // Exécuter le schéma
    await pool.query(schema);

    console.log("Migration terminée avec succès!");
    console.log(
      "   - Tables créées: users, resources, reservations, email_notifications",
    );
    console.log("   - Index créés pour optimisation des performances");
    console.log("   - Triggers créés pour updated_at");
    console.log("   - Vue créée: reservations_with_details");
  } catch (error) {
    console.error("Erreur lors de la migration:", (error as Error).message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
