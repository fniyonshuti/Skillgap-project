import { Router } from "express";
import { listUsers, updateUser } from "../controllers/userController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";
import { mongoIdParam } from "../validators/commonValidation.js";
import {
  listUsersValidation,
  updateUserValidation
} from "../validators/userValidation.js";

export const userRoutes = Router();

userRoutes.use(authenticate, authorize("admin"));
userRoutes.get("/", listUsersValidation, validateRequest, listUsers);
userRoutes.patch(
  "/:id",
  mongoIdParam("id", "User"),
  updateUserValidation,
  validateRequest,
  updateUser
);
