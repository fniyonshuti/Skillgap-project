import { Router } from "express";
import {
  getGraduate,
  getMyGraduateProfile,
  listGraduates,
  updateMyGraduateProfile
} from "./graduate.controller.js";
import { authenticate, authorize } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import { mongoIdParam } from "../../shared/validators/commonValidation.js";
import {
  graduateProfileValidation,
  listGraduatesValidation
} from "../../shared/validators/graduateValidation.js";

export const graduateRoutes = Router();

graduateRoutes.use(authenticate);
graduateRoutes.get("/me", authorize("graduate"), getMyGraduateProfile);
graduateRoutes.patch(
  "/me",
  authorize("graduate"),
  graduateProfileValidation,
  validateRequest,
  updateMyGraduateProfile
);
graduateRoutes.get(
  "/",
  authorize("institution", "admin"),
  listGraduatesValidation,
  validateRequest,
  listGraduates
);
graduateRoutes.get(
  "/:id",
  authorize("institution", "admin"),
  mongoIdParam("id", "Graduate"),
  validateRequest,
  getGraduate
);
