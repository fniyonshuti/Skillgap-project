/**
 * @fileoverview Operational API error type used across controllers and services.
 */

export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP response status.
   * @param {string} message - Safe, user-facing error message.
   * @param {{code?: string, details?: unknown, cause?: Error}} [options]
   */
  constructor(statusCode, message, options = {}) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = options.code;
    this.details = options.details;
    this.isOperational = true;
  }
}
