import { Router } from "express";
import {
  archiveCompetency,
  competencyValidation,
  createCompetency,
  listAssessmentCompetencies,
  listCompetencies,
  listManagedCompetencies,
  updateCompetency
} from "../controllers/competencyController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";

export const competencyRoutes = Router();

competencyRoutes.get("/", listCompetencies);
competencyRoutes.get(
  "/assessment",
  authenticate,
  authorize("graduate"),
  listAssessmentCompetencies
);
competencyRoutes.get("/manage", authenticate, authorize("admin"), listManagedCompetencies);
competencyRoutes.use(authenticate, authorize("admin"));
competencyRoutes.post("/", competencyValidation, validateRequest, createCompetency);
competencyRoutes.patch("/:id", competencyValidation, validateRequest, updateCompetency);
competencyRoutes.delete("/:id", archiveCompetency);
