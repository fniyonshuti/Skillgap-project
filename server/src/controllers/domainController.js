import { body } from "express-validator";
import { ICTDomain } from "../models/ICTDomain.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const domainValidation = [
  body("name").trim().notEmpty().withMessage("Domain name is required.")
];

export const listDomains = asyncHandler(async (_req, res) => {
  const domains = await ICTDomain.find({ isActive: true }).sort({ name: 1 });
  res.json(domains);
});

export const createDomain = asyncHandler(async (req, res) => {
  const domain = await ICTDomain.create(req.body);
  res.status(201).json(domain);
});

export const updateDomain = asyncHandler(async (req, res) => {
  const domain = await ICTDomain.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!domain) {
    throw new ApiError(404, "ICT domain was not found.");
  }

  res.json(domain);
});
