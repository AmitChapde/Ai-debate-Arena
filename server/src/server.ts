import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function startServer(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(
      `🚀 Server running on http://localhost:${env.PORT}`
    );
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Shutting down...`);

    server.close(async () => {
      await import("mongoose").then(({ default: mongoose }) =>
        mongoose.connection.close()
      );

      console.log("✅ Server shut down gracefully");

      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

startServer().catch((error) => {
  console.error("❌ Failed to start server");
  console.error(error);

  process.exit(1);
});