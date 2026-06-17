import { Router } from "express";
import {
  listNotifications,
  markNotificationRead
} from "./notification.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import { mongoIdParam } from "../../shared/validators/commonValidation.js";

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);
notificationRoutes.get("/", listNotifications);
notificationRoutes.patch(
  "/:id/read",
  mongoIdParam("id", "Notification"),
  validateRequest,
  markNotificationRead
);
