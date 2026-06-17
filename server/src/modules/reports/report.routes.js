import { Router } from "express";
import { generateGraduateReport } from "./report.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import { mongoIdParam } from "../../shared/validators/commonValidation.js";
import { reportFormatValidation } from "../../shared/validators/reportValidation.js";

export const reportRoutes = Router();

reportRoutes.use(authenticate);
reportRoutes.get(
  "/graduate/:graduateId",
  mongoIdParam("graduateId", "Graduate"),
  reportFormatValidation,
  validateRequest,
  generateGraduateReport
);
