/**
 * @fileoverview Graduate self-service and institution-scoped directory endpoints.
 */

import { Graduate } from "./graduate.model.js";
import { Institution } from "../institutions/institution.model.js";
import { findInstitutionForUser } from "../../shared/helpers/accessControl.service.js";
import { ApiError } from "../../shared/utils/apiError.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { pickDefined } from "../../shared/utils/objects.js";
import { escapeRegex, parsePagination } from "../../shared/utils/query.js";

const EDITABLE_GRADUATE_FIELDS = Object.freeze([
  "institutionId",
  "registrationNumber",
  "program",
  "graduationYear",
  "phone",
  "district"
]);

export const getMyGraduateProfile = asyncHandler(async (req, res) => {
  const profile = await Graduate.findOne({ userId: req.user._id })
    .populate("userId", "name email")
    .populate("institutionId");

  if (!profile) {
    throw new ApiError(404, "Graduate profile was not found.");
  }

  res.json(profile);
});

export const updateMyGraduateProfile = asyncHandler(async (req, res) => {
  const existing = await Graduate.findOne({ userId: req.user._id });
  if (!existing) {
    throw new ApiError(404, "Graduate profile was not found.");
  }

  const updates = pickDefined(req.body, EDITABLE_GRADUATE_FIELDS);

  if (Object.hasOwn(updates, "institutionId")) {
    if (updates.institutionId) {
      const institutionExists = await Institution.exists({ _id: updates.institutionId });
      if (!institutionExists) {
        throw new ApiError(404, "Selected institution was not found.");
      }
    } else {
      updates.institutionId = null;
    }
  }
  if (!updates.registrationNumber) delete updates.registrationNumber;

  const nextProgram = updates.program ?? existing.program;
  const nextGraduationYear = updates.graduationYear ?? existing.graduationYear;
  updates.profileCompleted = Boolean(nextProgram) && Boolean(nextGraduationYear);

  const profile = await Graduate.findOneAndUpdate({ userId: req.user._id }, updates, {
    new: true,
    runValidators: true
  }).populate("institutionId");

  if (!profile) {
    throw new ApiError(404, "Graduate profile was not found.");
  }

  res.json(profile);
});

export const listGraduates = asyncHandler(async (req, res) => {
  const { search = "", institutionId } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};

  if (req.user.role === "institution") {
    const institution = await findInstitutionForUser(req.user._id);
    if (!institution) {
      throw new ApiError(404, "Institution profile was not found.");
    }
    filter.institutionId = institution._id;
  } else if (institutionId) {
    filter.institutionId = institutionId;
  }

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { program: { $regex: safeSearch, $options: "i" } },
      { registrationNumber: { $regex: safeSearch, $options: "i" } }
    ];
  }

  const [items, total] = await Promise.all([
    Graduate.find(filter)
      .populate("userId", "name email")
      .populate("institutionId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Graduate.countDocuments(filter)
  ]);

  res.json({ items, total, page, limit });
});

export const getGraduate = asyncHandler(async (req, res) => {
  const graduate = await Graduate.findById(req.params.id)
    .populate("userId", "name email")
    .populate("institutionId");

  if (!graduate) {
    throw new ApiError(404, "Graduate was not found.");
  }

  if (req.user.role === "institution") {
    const institution = await findInstitutionForUser(req.user._id);
    if (!institution || graduate.institutionId?._id.toString() !== institution._id.toString()) {
      throw new ApiError(403, "You cannot access this graduate profile.");
    }
  }

  res.json(graduate);
});
