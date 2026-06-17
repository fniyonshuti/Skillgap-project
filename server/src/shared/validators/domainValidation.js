/**
 * @fileoverview Validation contract for ICT domain administration.
 */

import { body } from "express-validator";

export const domainValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Domain name is required.")
    .isLength({ max: 160 })
    .withMessage("Domain name must not exceed 160 characters."),
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1_500 })
    .withMessage("Domain description must not exceed 1500 characters.")
];
