import { validationResult } from "express-validator";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export function validateRequest(req, _res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const message = result
      .array()
      .map((error) => error.msg)
      .join(" ");
    return next(new ApiError(400, message));
  }

  return next();
}

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || "Internal server error.",
    stack: env.nodeEnv === "production" ? undefined : error.stack
  });
}
