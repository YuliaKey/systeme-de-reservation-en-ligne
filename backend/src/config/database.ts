import pg from "pg";
import { config } from "./index.js";

const { Pool } = pg;

export const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err: Error) => {
  console.error("Erreur inattendue du pool PostgreSQL:", err);
});

export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("Connexion à PostgreSQL réussie:", result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error(
      "Erreur de connexion à PostgreSQL:",
      (error as Error).message,
    );
    return false;
  }
};

export const query = async (
  text: string,
  params?: any[],
): Promise<pg.QueryResult> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Requête exécutée", { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error("Erreur de requête SQL:", {
      text,
      error: (error as Error).message,
    });
    throw error;
  }
};

export const transaction = async <T>(
  callback: (client: pg.PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
