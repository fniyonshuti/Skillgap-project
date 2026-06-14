import { analyticsRoutes } from "./analyticsRoutes.js";
import { assessmentRoutes } from "./assessmentRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { competencyRoutes } from "./competencyRoutes.js";
import { domainRoutes } from "./domainRoutes.js";
import { evidenceRoutes } from "./evidenceRoutes.js";
import { gapRoutes } from "./gapRoutes.js";
import { graduateRoutes } from "./graduateRoutes.js";
import { institutionRoutes } from "./institutionRoutes.js";
import { notificationRoutes } from "./notificationRoutes.js";
import { recommendationRoutes } from "./recommendationRoutes.js";
import { recommendationRuleRoutes } from "./recommendationRuleRoutes.js";
import { reportRoutes } from "./reportRoutes.js";
import { userRoutes } from "./userRoutes.js";

const API_ROUTES = Object.freeze([
  ["/api/auth", authRoutes],
  ["/api/users", userRoutes],
  ["/api/institutions", institutionRoutes],
  ["/api/domains", domainRoutes],
  ["/api/evidence", evidenceRoutes],
  ["/api/competencies", competencyRoutes],
  ["/api/graduates", graduateRoutes],
  ["/api/assessments", assessmentRoutes],
  ["/api/gaps", gapRoutes],
  ["/api/recommendations", recommendationRoutes],
  ["/api/recommendation-rules", recommendationRuleRoutes],
  ["/api/reports", reportRoutes],
  ["/api/notifications", notificationRoutes],
  ["/api/analytics", analyticsRoutes]
]);

/**
 * Registers every API module on the Express application.
 *
 * Add new top-level resources here so the complete public API surface remains
 * discoverable in one file.
 */
export function registerApiRoutes(app) {
  API_ROUTES.forEach(([path, router]) => app.use(path, router));
}
