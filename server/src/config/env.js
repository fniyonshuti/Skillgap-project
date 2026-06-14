/**
 * @fileoverview Loads and validates the server's single runtime environment.
 */

import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const serverRoot = resolve(currentDir, "../..");

dotenv.config({ path: resolve(serverRoot, ".env") });

function parseClientUrls(value) {
  return value
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

function parsePort(value) {
  const port = Number.parseInt(value, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  return port;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parsePort(process.env.PORT || "5000"),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skills_gap_analysis",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  clientUrls: parseClientUrls(
    process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173"
  ),
  adminRegistrationCode: process.env.ADMIN_REGISTRATION_CODE
};

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET must be configured.");
}

if (env.nodeEnv === "production" && env.jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters in production.");
}

if (env.clientUrls.length === 0) {
  throw new Error("At least one CLIENT_URL or CLIENT_URLS origin must be configured.");
}
