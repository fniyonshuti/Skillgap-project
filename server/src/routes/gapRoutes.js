import { Router } from "express";
import { getGapAnalysisByAssessment, getLatestGapAnalysis } from "../controllers/gapController.js";
import { authenticate } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";
import { mongoIdParam } from "../validators/commonValidation.js";

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
