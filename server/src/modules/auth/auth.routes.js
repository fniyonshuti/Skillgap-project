import { Router } from "express";
import {
  getMe,
  login,
  register
} from "./auth.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import {
  loginValidation,
  registerValidation
} from "../../shared/validators/authValidation.js";

export const authRoutes = Router();

authRoutes.post("/register", registerValidation, validateRequest, register);
authRoutes.post("/login", loginValidation, validateRequest, login);
authRoutes.get("/me", authenticate, getMe);
