import { Router } from "express";
import {
  getGraduate,
  getMyGraduateProfile,
  listGraduates,
  updateMyGraduateProfile
} from "../controllers/graduateController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";
import { mongoIdParam } from "../validators/commonValidation.js";
import {
  graduateProfileValidation,
  listGraduatesValidation
} from "../validators/graduateValidation.js";

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
