import { Router } from "express";
import {
  createDomain,
  listDomains,
  updateDomain
} from "../controllers/domainController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";
import { mongoIdParam } from "../validators/commonValidation.js";
import { domainValidation } from "../validators/domainValidation.js";

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
