import { Router } from "express";
import {
  assessmentValidation,
  createAssessment,
  getAssessment,
  listAssessments,
  reviewAssessment
} from "../controllers/assessmentController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";

export const assessmentRoutes = Router();

assessmentRoutes.use(authenticate);
assessmentRoutes.get("/", listAssessments);
assessmentRoutes.post("/", authorize("graduate"), assessmentValidation, validateRequest, createAssessment);
assessmentRoutes.get("/:id", getAssessment);
assessmentRoutes.patch("/:id/review", authorize("institution", "admin"), reviewAssessment);
