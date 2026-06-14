import { Router } from "express";
import { generateGraduateReport } from "../controllers/reportController.js";
import { authenticate } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";
import { mongoIdParam } from "../validators/commonValidation.js";
import { reportFormatValidation } from "../validators/reportValidation.js";

export const reportRoutes = Router();

reportRoutes.use(authenticate);
reportRoutes.get(
  "/graduate/:graduateId",
  mongoIdParam("graduateId", "Graduate"),
  reportFormatValidation,
  validateRequest,
  generateGraduateReport
);
