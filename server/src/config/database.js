import mongoose from "mongoose";
import { env } from "./env.js";

function getDatabaseHelpMessage(error) {
  const isLocalConnectionRefused =
    error?.name === "MongooseServerSelectionError" &&
    env.mongoUri.includes("127.0.0.1") &&
    error.message.includes("ECONNREFUSED");

  if (!isLocalConnectionRefused) {
    return error.message;
  }

  return [
    "MongoDB is not running at 127.0.0.1:27017.",
    "",
    "Fix options:",
    "1. Start MongoDB locally, then rerun the server.",
    "2. Or create server/.env and set MONGO_URI to your MongoDB Atlas connection string.",
    "",
    "Example local URI:",
    "MONGO_URI=mongodb://127.0.0.1:27017/skills_gap_analysis"
  ].join("\n");
}

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  // Prevent query-selector objects from being interpreted when scalar values
  // are expected. This adds defense in depth against NoSQL injection.
  mongoose.set("sanitizeFilter", true);

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    throw new Error(getDatabaseHelpMessage(error));
  }
}
