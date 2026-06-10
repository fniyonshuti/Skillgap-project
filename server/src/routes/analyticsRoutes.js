import { Router } from "express";
import { getDashboardAnalytics } from "../controllers/analyticsController.js";
import { authenticate } from "../middlewares/auth.js";

export const analyticsRoutes = Router();

analyticsRoutes.use(authenticate);
analyticsRoutes.get("/dashboard", getDashboardAnalytics);
