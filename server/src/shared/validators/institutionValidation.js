/**
 * @fileoverview Validation contracts for institution administration.
 */

import { body } from "express-validator";

const optionalText = (field, label, maxLength) =>
  body(field)
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${label} must not exceed ${maxLength} characters.`);

export const institutionValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Institution name is required.")
    .isLength({ max: 160 })
    .withMessage("Institution name must not exceed 160 characters."),
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Institution code is required.")
    .isLength({ max: 40 })
    .withMessage("Institution code must not exceed 40 characters.")
    .toUpperCase(),
  body("contactEmail")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Invalid contact email.")
    .normalizeEmail({ gmail_remove_dots: false })
    .isLength({ max: 254 })
    .withMessage("Contact email must not exceed 254 characters."),
  body("accountUserId")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("Institution account user is invalid."),
  optionalText("district", "District", 120),
  optionalText("contactPhone", "Contact phone", 40),
  optionalText("address", "Address", 300)
];
