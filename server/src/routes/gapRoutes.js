import { Router } from "express";
import { getGapAnalysisByAssessment, getLatestGapAnalysis } from "../controllers/gapController.js";
import { authenticate } from "../middlewares/auth.js";

export const gapRoutes = Router();

gapRoutes.use(authenticate);
gapRoutes.get("/graduate/:graduateId/latest", getLatestGapAnalysis);
gapRoutes.get("/assessment/:assessmentId", getGapAnalysisByAssessment);
