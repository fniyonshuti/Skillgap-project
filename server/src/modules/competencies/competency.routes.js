import { Router } from "express";
import {
  archiveCompetency,
  createCompetency,
  listAssessmentCompetencies,
  listCompetencies,
  listManagedCompetencies,
  updateCompetency
} from "./competency.controller.js";
import { authenticate, authorize } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import { mongoIdParam } from "../../shared/validators/commonValidation.js";
import {
  competencyFilterValidation,
  competencyValidation
} from "../../shared/validators/competencyValidation.js";

export const competencyRoutes = Router();

competencyRoutes.get(
  "/",
  competencyFilterValidation,
  validateRequest,
  listCompetencies
);
competencyRoutes.get(
  "/assessment",
  authenticate,
  authorize("graduate"),
  competencyFilterValidation,
  validateRequest,
  listAssessmentCompetencies
);
competencyRoutes.get("/manage", authenticate, authorize("admin"), listManagedCompetencies);
competencyRoutes.use(authenticate, authorize("admin"));
competencyRoutes.post("/", competencyValidation, validateRequest, createCompetency);
competencyRoutes.patch(
  "/:id",
  mongoIdParam("id", "Competency"),
  competencyValidation,
  validateRequest,
  updateCompetency
);
competencyRoutes.delete(
  "/:id",
  mongoIdParam("id", "Competency"),
  validateRequest,
  archiveCompetency
);
