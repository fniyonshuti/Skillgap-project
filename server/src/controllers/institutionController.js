import { body } from "express-validator";
import { Institution } from "../models/Institution.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const institutionValidation = [
  body("name").trim().notEmpty().withMessage("Institution name is required."),
  body("code").trim().notEmpty().withMessage("Institution code is required."),
  body("contactEmail").optional({ checkFalsy: true }).isEmail().withMessage("Invalid contact email.")
];

export const listInstitutions = asyncHandler(async (_req, res) => {
  const items = await Institution.find().sort({ name: 1 });
  res.json(items);
});

export const createInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.create(req.body);
  res.status(201).json(institution);
});

export const updateInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!institution) {
    throw new ApiError(404, "Institution was not found.");
  }

  res.json(institution);
});

export const deleteInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findByIdAndDelete(req.params.id);
  if (!institution) {
    throw new ApiError(404, "Institution was not found.");
  }

  res.status(204).send();
});
