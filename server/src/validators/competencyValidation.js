/**
 * @fileoverview Validation contract for RTB competency standards.
 */

import { body, query } from "express-validator";
import { ASSESSMENT_SOURCES } from "../services/assessmentQuestionScoringService.js";

export const competencyFilterValidation = [
  query("domainId")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("Domain filter is invalid.")
];

export const competencyValidation = [
  body("domainId").isMongoId().withMessage("A valid domain is required."),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Competency title is required.")
    .isLength({ max: 200 })
    .withMessage("Competency title must not exceed 200 characters."),
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2_000 })
    .withMessage("Competency description must not exceed 2000 characters."),
  body("category")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage("Category must not exceed 80 characters."),
  body("rtbReference")
    .trim()
    .notEmpty()
    .withMessage("RTB reference is required.")
    .isLength({ max: 80 })
    .withMessage("RTB reference must not exceed 80 characters.")
    .toUpperCase(),
  body("version")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 30 })
    .withMessage("Version must not exceed 30 characters."),
  body("effectiveDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Effective date is invalid.")
    .toDate(),
  body("requiredLevel")
    .isInt({ min: 1, max: 4 })
    .withMessage("Required level must be between 1 and 4.")
    .toInt(),
  body("standardStatus")
    .optional()
    .isIn(["draft", "active", "archived"])
    .withMessage("Standard status must be draft, active, or archived."),
  body("evidenceExamples")
    .optional()
    .isArray({ max: 20 })
    .withMessage("A maximum of 20 evidence examples is allowed."),
  body("evidenceExamples.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage("Evidence examples must contain between 1 and 300 characters."),
  body("assessmentQuestions")
    .isArray({ min: 4, max: 100 })
    .withMessage("Add assessment questions for all four evidence sources."),
  body("assessmentQuestions.*.source")
    .isIn(ASSESSMENT_SOURCES)
    .withMessage("Each question must use a valid evidence source."),
  body("assessmentQuestions.*.prompt")
    .trim()
    .notEmpty()
    .withMessage("Each assessment question requires a prompt.")
    .isLength({ max: 1_000 })
    .withMessage("Assessment question prompts must not exceed 1000 characters."),
  body("assessmentQuestions.*.order")
    .optional()
    .isInt({ min: 0, max: 10_000 })
    .withMessage("Question order is invalid.")
    .toInt(),
  body("assessmentQuestions.*.isActive")
    .optional()
    .isBoolean()
    .withMessage("Question active status must be boolean.")
    .toBoolean(),
  body("assessmentQuestions.*.options")
    .isArray({ min: 2, max: 20 })
    .withMessage("Each assessment question requires between 2 and 20 answer options."),
  body("assessmentQuestions.*.options.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each answer option requires a label.")
    .isLength({ max: 500 })
    .withMessage("Answer option labels must not exceed 500 characters."),
  body("assessmentQuestions.*.options.*.score")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Administrator scoring points must be between 0 and 100.")
    .toFloat(),
  body("assessmentQuestions").custom((questions) => {
    const activeQuestions = questions.filter((question) => question.isActive !== false);
    const missingSources = ASSESSMENT_SOURCES.filter(
      (source) => !activeQuestions.some((question) => question.source === source)
    );
    if (missingSources.length) {
      throw new Error(`Add at least one active question for: ${missingSources.join(", ")}.`);
    }
    return true;
  })
];
