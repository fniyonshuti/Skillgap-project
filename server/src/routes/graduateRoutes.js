import { Router } from "express";
import {
  getGraduate,
  getMyGraduateProfile,
  graduateProfileValidation,
  listGraduates,
  updateMyGraduateProfile
} from "../controllers/graduateController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";

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
graduateRoutes.get("/", authorize("institution", "admin"), listGraduates);
graduateRoutes.get("/:id", authorize("institution", "admin"), getGraduate);
