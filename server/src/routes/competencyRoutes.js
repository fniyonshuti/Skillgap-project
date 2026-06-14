import { Router } from "express";
import {
  archiveCompetency,
  createCompetency,
  listAssessmentCompetencies,
  listCompetencies,
  listManagedCompetencies,
  updateCompetency
} from "../controllers/competencyController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";
import { mongoIdParam } from "../validators/commonValidation.js";
import {
  competencyFilterValidation,
  competencyValidation
} from "../validators/competencyValidation.js";

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
