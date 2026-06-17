import { Router } from "express";
import {
  createDomain,
  listDomains,
  updateDomain
} from "./domain.controller.js";
import { authenticate, authorize } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import { mongoIdParam } from "../../shared/validators/commonValidation.js";
import { domainValidation } from "../../shared/validators/domainValidation.js";

export const domainRoutes = Router();

domainRoutes.get("/", listDomains);
domainRoutes.use(authenticate, authorize("admin"));
domainRoutes.post("/", domainValidation, validateRequest, createDomain);
domainRoutes.patch(
  "/:id",
  mongoIdParam("id", "ICT domain"),
  domainValidation,
  validateRequest,
  updateDomain
);
