import { Router } from "express";
import { getGapAnalysisByAssessment, getLatestGapAnalysis } from "./gap.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import { mongoIdParam } from "../../shared/validators/commonValidation.js";

export const gapRoutes = Router();

gapRoutes.use(authenticate);
gapRoutes.get(
  "/graduate/:graduateId/latest",
  mongoIdParam("graduateId", "Graduate"),
  validateRequest,
  getLatestGapAnalysis
);
gapRoutes.get(
  "/assessment/:assessmentId",
  mongoIdParam("assessmentId", "Assessment"),
  validateRequest,
  getGapAnalysisByAssessment
);
