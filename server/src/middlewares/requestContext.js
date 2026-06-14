/**
 * @fileoverview Adds a correlation identifier to every request and response.
 */

import { randomUUID } from "node:crypto";

/**
 * Assigns a request ID for support diagnostics without exposing stack traces.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function requestContext(req, res, next) {
  const incomingRequestId = req.get("x-request-id");
  req.requestId =
    incomingRequestId &&
    incomingRequestId.length <= 100 &&
    /^[A-Za-z0-9._:-]+$/.test(incomingRequestId)
      ? incomingRequestId
      : randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
}
