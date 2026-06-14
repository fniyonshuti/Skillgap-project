import { Router } from "express";
import {
  createAssessment,
  getAssessment,
  listAssessments,
  reviewAssessment
} from "../controllers/assessmentController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";
import {
  assessmentValidation,
  listAssessmentsValidation
} from "../validators/assessmentValidation.js";
import { mongoIdParam } from "../validators/commonValidation.js";

export const assessmentRoutes = Router();

assessmentRoutes.use(authenticate);
assessmentRoutes.get("/", listAssessmentsValidation, validateRequest, listAssessments);
assessmentRoutes.post("/", authorize("graduate"), assessmentValidation, validateRequest, createAssessment);
assessmentRoutes.get("/:id", mongoIdParam("id", "Assessment"), validateRequest, getAssessment);
assessmentRoutes.patch(
  "/:id/review",
  authorize("institution", "admin"),
  mongoIdParam("id", "Assessment"),
  validateRequest,
  reviewAssessment
);
