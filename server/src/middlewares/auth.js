/**
 * @fileoverview JWT authentication and role-based authorization middleware.
 */

import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Authentication token is required.");
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"]
    });
  } catch (error) {
    throw new ApiError(401, "Authentication token is invalid or expired.", {
      code: "INVALID_AUTH_TOKEN",
      cause: error
    });
  }

  if (!payload.sub) {
    throw new ApiError(401, "Authentication token is invalid.", {
      code: "INVALID_AUTH_TOKEN"
    });
  }

  const user = await User.findById(payload.sub);

  if (!user || user.status !== "active") {
    throw new ApiError(401, "Invalid or inactive user account.");
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to one or more authenticated roles.
 *
 * @param {...string} roles - Allowed user roles.
 * @returns {import("express").RequestHandler}
 */
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action."));
    }

    return next();
  };
}
