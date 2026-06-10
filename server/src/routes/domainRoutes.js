import { Router } from "express";
import {
  createDomain,
  domainValidation,
  listDomains,
  updateDomain
} from "../controllers/domainController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";

export const domainRoutes = Router();

domainRoutes.get("/", listDomains);
domainRoutes.use(authenticate, authorize("admin"));
domainRoutes.post("/", domainValidation, validateRequest, createDomain);
domainRoutes.patch("/:id", domainValidation, validateRequest, updateDomain);
