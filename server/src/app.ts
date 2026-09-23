import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import scenarioRoutes from "./modules/scenarios/scenario.routes.js";


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

app.use(cookieParser());

/*
 * Routes
 */
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use(
  "/api/scenarios",
  scenarioRoutes
);
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