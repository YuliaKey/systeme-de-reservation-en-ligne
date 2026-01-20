import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middlewares de sécurité
app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);

if (config.env === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route non trouvée",
    },
  });
});

app.use(errorHandler);

export default app;
