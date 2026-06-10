import { Router } from "express";
import { listUsers, updateUser, updateUserValidation } from "../controllers/userController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";

export const userRoutes = Router();

userRoutes.use(authenticate, authorize("admin"));
userRoutes.get("/", listUsers);
userRoutes.patch("/:id", updateUserValidation, validateRequest, updateUser);
