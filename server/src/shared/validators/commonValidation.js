/**
 * @fileoverview Reusable Express validation chains for common request shapes.
 */

import { param, query } from "express-validator";

export const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1, max: 1_000_000 })
    .withMessage("Page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100.")
];

/**
 * Validates a MongoDB ObjectId route parameter.
 *
 * @param {string} name - Parameter name.
 * @param {string} label - Human-readable field label.
 * @returns {import("express-validator").ValidationChain}
 */
export function mongoIdParam(name, label = name) {
  return param(name).isMongoId().withMessage(`${label} must be a valid identifier.`);
}

/**
 * Validates an optional MongoDB ObjectId query parameter.
 *
 * @param {string} name - Query parameter name.
 * @param {string} label - Human-readable field label.
 * @returns {import("express-validator").ValidationChain}
 */
export function optionalMongoIdQuery(name, label = name) {
  return query(name)
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage(`${label} must be a valid identifier.`);
}
