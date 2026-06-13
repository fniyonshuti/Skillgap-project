import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { env } from "./config/env.js";
import { analyticsRoutes } from "./routes/analyticsRoutes.js";
import { assessmentRoutes } from "./routes/assessmentRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { competencyRoutes } from "./routes/competencyRoutes.js";
import { domainRoutes } from "./routes/domainRoutes.js";
import { evidenceRoutes } from "./routes/evidenceRoutes.js";
import { gapRoutes } from "./routes/gapRoutes.js";
import { graduateRoutes } from "./routes/graduateRoutes.js";
import { institutionRoutes } from "./routes/institutionRoutes.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";
import { recommendationRoutes } from "./routes/recommendationRoutes.js";
import { recommendationRuleRoutes } from "./routes/recommendationRuleRoutes.js";
import { reportRoutes } from "./routes/reportRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "skills-gap-analysis-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/competencies", competencyRoutes);
app.use("/api/graduates", graduateRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/gaps", gapRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/recommendation-rules", recommendationRuleRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);
