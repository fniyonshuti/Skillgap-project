import { Router } from "express";
import { generateGraduateReport } from "../controllers/reportController.js";
import { authenticate } from "../middlewares/auth.js";

export const reportRoutes = Router();

reportRoutes.use(authenticate);
reportRoutes.get("/graduate/:graduateId", generateGraduateReport);
