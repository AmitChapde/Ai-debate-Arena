import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

/*
 * Security headers
 */
app.use(helmet());

/*
 * CORS
 */
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);

/*
 * Request body parsing
 */
app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb"
  })
);

/*
 * Routes
 */
app.use("/api/health", healthRoutes);

/*
 * 404 handler
 */
app.use((_request, response) => {
  response.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/*
 * Global error handler
 */
app.use(errorMiddleware);

export default app;