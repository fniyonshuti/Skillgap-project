import { Router } from "express";
import { listUsers, updateUser } from "./user.controller.js";
import { authenticate, authorize } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import { mongoIdParam } from "../../shared/validators/commonValidation.js";
import {
  listUsersValidation,
  updateUserValidation
} from "../../shared/validators/userValidation.js";

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
