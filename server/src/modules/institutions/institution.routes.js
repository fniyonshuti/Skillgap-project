import { Router } from "express";
import {
  createInstitution,
  deleteInstitution,
  listInstitutions,
  updateInstitution
} from "./institution.controller.js";
import { authenticate, authorize } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import { mongoIdParam } from "../../shared/validators/commonValidation.js";
import { institutionValidation } from "../../shared/validators/institutionValidation.js";

export const institutionRoutes = Router();

institutionRoutes.get("/", listInstitutions);
institutionRoutes.use(authenticate, authorize("admin"));
institutionRoutes.post("/", institutionValidation, validateRequest, createInstitution);
institutionRoutes.patch(
  "/:id",
  mongoIdParam("id", "Institution"),
  institutionValidation,
  validateRequest,
  updateInstitution
);
institutionRoutes.delete(
  "/:id",
  mongoIdParam("id", "Institution"),
  validateRequest,
  deleteInstitution
);
