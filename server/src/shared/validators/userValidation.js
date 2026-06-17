/**
 * @fileoverview Validation contracts for administrator user management.
 */

import { body, query } from "express-validator";
import { paginationValidation } from "./commonValidation.js";

export const listUsersValidation = [
  query("role")
    .optional({ checkFalsy: true })
    .isIn(["graduate", "institution", "admin"])
    .withMessage("Invalid role filter."),
  query("status")
    .optional({ checkFalsy: true })
    .isIn(["active", "suspended"])
    .withMessage("Invalid status filter."),
  query("search")
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage("Search text must not exceed 120 characters."),
  ...paginationValidation
];

export const updateUserValidation = [
  body("role")
    .optional()
    .isIn(["graduate", "institution", "admin"])
    .withMessage("Invalid role."),
  body("status")
    .optional()
    .isIn(["active", "suspended"])
    .withMessage("Invalid status.")
];
