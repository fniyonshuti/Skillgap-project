import { Router } from "express";
import {
  createInstitution,
  deleteInstitution,
  institutionValidation,
  listInstitutions,
  updateInstitution
} from "../controllers/institutionController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";

export const institutionRoutes = Router();

institutionRoutes.get("/", listInstitutions);
institutionRoutes.use(authenticate, authorize("admin"));
institutionRoutes.post("/", institutionValidation, validateRequest, createInstitution);
institutionRoutes.patch("/:id", institutionValidation, validateRequest, updateInstitution);
institutionRoutes.delete("/:id", deleteInstitution);
