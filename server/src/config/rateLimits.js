/**
 * @fileoverview Central rate-limit policies for public and authenticated APIs.
 */

import rateLimit from "express-rate-limit";

function rateLimitResponse(message) {
  return (_req, res) => {
    res.status(429).json({
      message,
      code: "RATE_LIMIT_EXCEEDED"
    });
  };
}

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse("Too many requests. Please try again later.")
});

/**
 * Authentication receives a stricter policy because login and setup-code
 * endpoints are attractive brute-force targets.
 */
export const authenticationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: rateLimitResponse("Too many authentication attempts. Please try again later.")
});
