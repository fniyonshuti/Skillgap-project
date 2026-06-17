import { Router } from "express";
import { getDashboardAnalytics } from "./dashboard.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";

export const analyticsRoutes = Router();

analyticsRoutes.use(authenticate);
analyticsRoutes.get("/dashboard", getDashboardAnalytics);
