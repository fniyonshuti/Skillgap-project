import { body } from "express-validator";
import { optionalMongoIdQuery } from "./commonValidation.js";

export const listAssessmentsValidation = [
  optionalMongoIdQuery("graduateId", "Graduate"),
  optionalMongoIdQuery("domainId", "ICT domain")
];

export const assessmentValidation = [
  body("domainId").isMongoId().withMessage("A valid ICT domain is required."),
  body("items")
    .isArray({ min: 1, max: 100 })
    .withMessage("An assessment requires between 1 and 100 items."),
  body("items.*.competencyId").isMongoId().withMessage("Each item must contain a valid competency."),
  body("items.*.evidenceScores")
    .not()
    .exists()
    .withMessage("Scores are calculated by the system and cannot be submitted by graduates."),
  body("items.*.responses")
    .isArray({ min: 1 })
    .withMessage("Answer every assessment question before submitting."),
  body("items.*.responses.*.questionId")
    .isMongoId()
    .withMessage("Each response must contain a valid question."),
  body("items.*.responses.*.optionId")
    .isMongoId()
    .withMessage("Each response must contain a valid answer option."),
  body("items.*.evidenceLink")
    .optional({ checkFalsy: true })
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Evidence links must be complete URLs beginning with http:// or https://.")
    .isLength({ max: 2_048 })
    .withMessage("Evidence links must not exceed 2048 characters."),
  body("items.*.evidence")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2_000 })
    .withMessage("Evidence descriptions must not exceed 2000 characters."),
  body("items.*.evidenceIds")
    .optional()
    .isArray({ max: 5 })
    .withMessage("A maximum of five evidence files is allowed per competency."),
  body("items.*.evidenceIds.*")
    .optional()
    .isMongoId()
    .withMessage("Each uploaded evidence reference must be valid."),
  body("items.*").custom((item) => {
    if (!item.evidence?.trim() && !item.evidenceLink?.trim() && !item.evidenceIds?.length) {
      throw new Error(
        "Each competency requires an evidence description, evidence link, or uploaded file."
      );
    }
    return true;
  })
];
