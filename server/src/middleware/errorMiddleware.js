/**
 * @fileoverview Request validation and centralized API error normalization.
 */

import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../shared/utils/apiError.js";

/**
 * Converts express-validator failures into one consistent API error contract.
 */
export function validateRequest(req, _res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const details = result.array({ onlyFirstError: true }).map((error) => ({
      field: error.path,
      message: error.msg
    }));
    const message = details.map((error) => error.message).join(" ");
    return next(
      new ApiError(400, message, {
        code: "VALIDATION_ERROR",
        details
      })
    );
  }

  return next();
}

/**
 * Produces a predictable 404 for unregistered endpoints.
 */
export function notFound(req, _res, next) {
  next(
    new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, {
      code: "ROUTE_NOT_FOUND"
    })
  );
}

function normalizeError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
    return new ApiError(401, "Authentication token is invalid or expired.", {
      code: "INVALID_AUTH_TOKEN"
    });
  }

  if (error?.type === "entity.parse.failed") {
    return new ApiError(400, "Request body contains invalid JSON.", {
      code: "INVALID_JSON"
    });
  }

  if (error?.name === "CastError") {
    return new ApiError(400, "The supplied identifier is invalid.", {
      code: "INVALID_IDENTIFIER"
    });
  }

  if (error?.name === "ValidationError") {
    return new ApiError(400, "Submitted data failed validation.", {
      code: "MODEL_VALIDATION_ERROR",
      details: Object.values(error.errors || {}).map((item) => ({
        field: item.path,
        message: item.message
      }))
    });
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
    return new ApiError(
      409,
      field ? `A record with this ${field} already exists.` : "This record already exists.",
      { code: "DUPLICATE_RECORD" }
    );
  }

  return new ApiError(500, "Internal server error.", {
    code: "INTERNAL_SERVER_ERROR",
    cause: error
  });
}

/**
 * Returns safe production errors while retaining diagnostic context in logs.
 */
export function errorHandler(error, req, res, _next) {
  const normalizedError = normalizeError(error);

  if (normalizedError.statusCode >= 500) {
    console.error(`[${req.requestId || "no-request-id"}]`, error);
  }

  const payload = {
    message: normalizedError.message,
    code: normalizedError.code,
    requestId: req.requestId
  };

  if (normalizedError.details) payload.details = normalizedError.details;
  if (env.nodeEnv !== "production") {
    payload.stack = normalizedError.cause?.stack || error.stack;
  }

  res.status(normalizedError.statusCode).json(payload);
}
