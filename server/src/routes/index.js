import { analyticsRoutes } from "../modules/dashboards/dashboard.routes.js";
import { assessmentRoutes } from "../modules/assessments/assessment.routes.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { competencyRoutes } from "../modules/competencies/competency.routes.js";
import { domainRoutes } from "../modules/competencies/domain.routes.js";
import { evidenceRoutes } from "../modules/evidence/evidence.routes.js";
import { gapRoutes } from "../modules/gaps/gap.routes.js";
import { graduateRoutes } from "../modules/graduates/graduate.routes.js";
import { institutionRoutes } from "../modules/institutions/institution.routes.js";
import { notificationRoutes } from "../modules/notifications/notification.routes.js";
import { recommendationRoutes } from "../modules/recommendations/recommendation.routes.js";
import { recommendationRuleRoutes } from "../modules/recommendations/recommendationRule.routes.js";
import { reportRoutes } from "../modules/reports/report.routes.js";
import { userRoutes } from "../modules/users/user.routes.js";

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
