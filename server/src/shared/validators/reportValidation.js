/**
 * @fileoverview Validation contracts for generated graduate reports.
 */

import { query } from "express-validator";

export const reportFormatValidation = [
  query("format")
    .optional({ checkFalsy: true })
    .isIn(["json", "csv", "pdf"])
    .withMessage("Report format must be json, csv, or pdf.")
];
