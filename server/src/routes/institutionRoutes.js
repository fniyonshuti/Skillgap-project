import { Router } from "express";
import {
  createInstitution,
  deleteInstitution,
  listInstitutions,
  updateInstitution
} from "../controllers/institutionController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";
import { mongoIdParam } from "../validators/commonValidation.js";
import { institutionValidation } from "../validators/institutionValidation.js";

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
