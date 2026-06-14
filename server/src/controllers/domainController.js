/**
 * @fileoverview ICT domain catalogue endpoints.
 */

import { ICTDomain } from "../models/ICTDomain.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pickDefined } from "../utils/objects.js";

const EDITABLE_DOMAIN_FIELDS = Object.freeze(["name", "description"]);

export const listDomains = asyncHandler(async (_req, res) => {
  const domains = await ICTDomain.find({ isActive: true }).sort({ name: 1 });
  res.json(domains);
});

export const createDomain = asyncHandler(async (req, res) => {
  const domain = await ICTDomain.create(pickDefined(req.body, EDITABLE_DOMAIN_FIELDS));
  res.status(201).json(domain);
});

export const updateDomain = asyncHandler(async (req, res) => {
  const domain = await ICTDomain.findByIdAndUpdate(
    req.params.id,
    pickDefined(req.body, EDITABLE_DOMAIN_FIELDS),
    {
      new: true,
      runValidators: true
    }
  );

  if (!domain) {
    throw new ApiError(404, "ICT domain was not found.");
  }

  res.json(domain);
});
