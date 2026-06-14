/**
 * @fileoverview Public institution discovery and administrator CRUD endpoints.
 */

import { Graduate } from "../models/Graduate.js";
import { Institution } from "../models/Institution.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pickDefined } from "../utils/objects.js";

const EDITABLE_INSTITUTION_FIELDS = Object.freeze([
  "name",
  "code",
  "district",
  "contactEmail",
  "contactPhone",
  "address",
  "accountUserId"
]);

export const listInstitutions = asyncHandler(async (_req, res) => {
  // Registration only needs selection metadata. Internal account links and
  // contact details must not be exposed by this public endpoint.
  const institutions = await Institution.find({}).select("_id name code district").sort({ name: 1 });
  res.json(institutions);
});

export const createInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.create(
    pickDefined(req.body, EDITABLE_INSTITUTION_FIELDS)
  );
  res.status(201).json(institution);
});

export const updateInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findByIdAndUpdate(
    req.params.id,
    pickDefined(req.body, EDITABLE_INSTITUTION_FIELDS),
    {
      new: true,
      runValidators: true
    }
  ).select("-recommendationRules -recommendationRulesUpdatedAt");

  if (!institution) {
    throw new ApiError(404, "Institution was not found.");
  }

  res.json(institution);
});

export const deleteInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findById(req.params.id);
  if (!institution) {
    throw new ApiError(404, "Institution was not found.");
  }

  const linkedGraduateCount = await Graduate.countDocuments({
    institutionId: institution._id
  });
  if (linkedGraduateCount > 0 || institution.accountUserId) {
    throw new ApiError(
      409,
      "This institution is linked to an account or graduates and cannot be deleted."
    );
  }

  await Institution.deleteOne({ _id: institution._id });
  res.status(204).send();
});
