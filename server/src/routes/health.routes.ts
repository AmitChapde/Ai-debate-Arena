
import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (_request, response) => {
  const databaseState =
    mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected";

  response.status(200).json({
    success: true,
    service: "ai-debate-arena-api",
    status: "healthy",
    database: databaseState,
    timestamp: new Date().toISOString()
  });
});

export default router;