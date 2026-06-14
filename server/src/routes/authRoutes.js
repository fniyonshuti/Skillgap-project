import { Router } from "express";
import {
  getMe,
  login,
  register
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";
import {
  loginValidation,
  registerValidation
} from "../validators/authValidation.js";

export const authRoutes = Router();

authRoutes.post("/register", registerValidation, validateRequest, register);
authRoutes.post("/login", loginValidation, validateRequest, login);
authRoutes.get("/me", authenticate, getMe);
