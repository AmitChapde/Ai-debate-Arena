// Pin every test process to a dedicated local database, overriding any URI
// inherited from the shell or loaded later from server/.env.
process.env.NODE_ENV = "test";
process.env.MONGODB_URI =
  "mongodb://127.0.0.1:27017/ai_debate_arena_integration_test";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.JWT_SECRET = "unit-test-secret-that-is-long-enough-123";
