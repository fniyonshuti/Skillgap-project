import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const serverRoot = resolve(currentDir, "../..");

dotenv.config({ path: resolve(serverRoot, ".env") });

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skills_gap_analysis",
  jwtSecret: process.env.JWT_SECRET || "development-only-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  adminRegistrationCode: process.env.ADMIN_REGISTRATION_CODE
};

if (env.nodeEnv === "production" && env.jwtSecret === "development-only-secret") {
  throw new Error("JWT_SECRET must be configured in production.");
}
