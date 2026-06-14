/**
 * @fileoverview Validation and normalization for authentication endpoints.
 */

import { body } from "express-validator";

const optionalShortText = (field, label, maxLength = 120) =>
  body(field)
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${label} must not exceed ${maxLength} characters.`);

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ max: 120 })
    .withMessage("Name must not exceed 120 characters."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required.")
    .normalizeEmail({ gmail_remove_dots: false })
    .isLength({ max: 254 })
    .withMessage("Email must not exceed 254 characters."),
  body("password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must contain between 8 and 128 characters.")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0
    })
    .withMessage("Password must include uppercase, lowercase, and numeric characters."),
  body("role")
    .optional()
    .isIn(["graduate", "institution", "admin"])
    .withMessage("Registration role must be graduate, institution, or admin."),
  body("institutionId")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("Selected institution is invalid."),
  body("institutionName")
    .if(body("role").equals("institution"))
    .trim()
    .notEmpty()
    .withMessage("Institution name is required.")
    .isLength({ max: 160 })
    .withMessage("Institution name must not exceed 160 characters."),
  body("institutionCode")
    .if(body("role").equals("institution"))
    .trim()
    .notEmpty()
    .withMessage("Institution code is required.")
    .isLength({ max: 40 })
    .withMessage("Institution code must not exceed 40 characters."),
  body("adminSetupCode")
    .if(body("role").equals("admin"))
    .isString()
    .notEmpty()
    .withMessage("Admin setup code is required.")
    .isLength({ max: 256 })
    .withMessage("Admin setup code is invalid."),
  body("graduationYear")
    .optional({ checkFalsy: true })
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Graduation year is invalid.")
    .toInt(),
  optionalShortText("program", "Program", 160),
  optionalShortText("phone", "Phone number", 40),
  optionalShortText("district", "District", 120),
  optionalShortText("address", "Address", 300)
];

export const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required.")
    .normalizeEmail({ gmail_remove_dots: false })
    .isLength({ max: 254 })
    .withMessage("Email must not exceed 254 characters."),
  body("password")
    .isString()
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ max: 128 })
    .withMessage("Password is invalid.")
];
