import { Router } from "express";
import {
  createAssessment,
  getAssessment,
  listAssessments,
  reviewAssessment
} from "./assessment.controller.js";
import { authenticate, authorize } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import {
  assessmentValidation,
  listAssessmentsValidation
} from "../../shared/validators/assessmentValidation.js";
import { mongoIdParam } from "../../shared/validators/commonValidation.js";

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
