import { Router } from "express";
import {
  listNotifications,
  markNotificationRead
} from "../controllers/notificationController.js";
import { authenticate } from "../middlewares/auth.js";

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);
notificationRoutes.get("/", listNotifications);
notificationRoutes.patch("/:id/read", markNotificationRead);
