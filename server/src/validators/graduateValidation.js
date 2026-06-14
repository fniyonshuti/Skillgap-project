/**
 * @fileoverview Validation contracts for graduate profile and listing APIs.
 */

import { body, query } from "express-validator";
import {
  optionalMongoIdQuery,
  paginationValidation
} from "./commonValidation.js";

const optionalText = (field, label, maxLength) =>
  body(field)
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${label} must not exceed ${maxLength} characters.`);

export const graduateProfileValidation = [
  body("institutionId")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid institution."),
  body("graduationYear")
    .optional({ checkFalsy: true })
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Graduation year is invalid.")
    .toInt(),
  optionalText("registrationNumber", "Registration number", 80),
  optionalText("program", "Program", 160),
  optionalText("phone", "Phone number", 40),
  optionalText("district", "District", 120)
];

export const listGraduatesValidation = [
  query("search")
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage("Search text must not exceed 120 characters."),
  optionalMongoIdQuery("institutionId", "Institution"),
  ...paginationValidation
];
