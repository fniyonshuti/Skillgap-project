import { Router } from "express";
import {
  listNotifications,
  markNotificationRead
} from "../controllers/notificationController.js";
import { authenticate } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";
import { mongoIdParam } from "../validators/commonValidation.js";

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);
notificationRoutes.get("/", listNotifications);
notificationRoutes.patch(
  "/:id/read",
  mongoIdParam("id", "Notification"),
  validateRequest,
  markNotificationRead
);
