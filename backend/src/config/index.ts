import dotenv from "dotenv";

dotenv.config();

interface Config {
  env: string;
  port: number;
  apiBasePath: string;
  frontendUrl: string;
  database: {
    host: string;
    port: number;
    database: string;
    user: string | undefined;
    password: string | undefined;
    connectionString: string | undefined;
  };
  clerk: {
    publishableKey: string | undefined;
    secretKey: string | undefined;
    jwtVerificationKey: string | undefined;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string | undefined;
      pass: string | undefined;
    };
    from: string;
  };
  admin: {
    email: string;
  };
}

export const config: Config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3001", 10),
  apiBasePath: process.env.API_BASE_PATH || "/api",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "reservation_db",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionString: process.env.DATABASE_URL,
  },

  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
    jwtVerificationKey: process.env.CLERK_JWT_VERIFICATION_KEY,
  },

  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    from:
      process.env.EMAIL_FROM ||
      "Système de Réservation <noreply@reservation.com>",
  },

  admin: {
    email: process.env.ADMIN_EMAIL || "admin@reservation.com",
  },
};

// Validation des variables d'environnement critiques
const requiredEnvVars: string[] = [
  "DB_USER",
  "DB_PASSWORD",
  "CLERK_SECRET_KEY",
];

if (config.env === "production") {
  requiredEnvVars.push("EMAIL_USER", "EMAIL_PASSWORD");
}

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `Variables d'environnement manquantes : ${missingVars.join(", ")}`,
  );
  if (config.env === "production") {
    process.exit(1);
  }
}
