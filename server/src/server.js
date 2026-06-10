import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function bootstrap() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`API server running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error(`Unable to start server:\n${error.message}`);
  process.exit(1);
});
