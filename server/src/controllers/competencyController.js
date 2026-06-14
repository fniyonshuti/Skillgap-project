/**
 * @fileoverview RTB competency catalogue and private question-bank endpoints.
 */

import { Competency } from "../models/Competency.js";
import { ICTDomain } from "../models/ICTDomain.js";
import { sanitizeQuestionBank } from "../services/assessmentQuestionScoringService.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { trustedExists, trustedNotEqual } from "../utils/mongoQuery.js";
import { pickDefined } from "../utils/objects.js";

const EDITABLE_COMPETENCY_FIELDS = Object.freeze([
  "domainId",
  "title",
  "description",
  "category",
  "requiredLevel",
  "rtbReference",
  "evidenceExamples",
  "version",
  "effectiveDate",
  "standardStatus",
  "assessmentQuestions"
]);

async function assertDomainExists(domainId) {
  const domainExists = await ICTDomain.exists({ _id: domainId, isActive: true });
  if (!domainExists) {
    throw new ApiError(404, "Selected ICT domain was not found.");
  }
}

export const listCompetencies = asyncHandler(async (req, res) => {
  const filter = {
    isActive: true,
    $or: [{ standardStatus: "active" }, { standardStatus: trustedExists(false) }]
  };
  if (req.query.domainId) filter.domainId = req.query.domainId;

  const competencies = await Competency.find(filter)
    .select("-assessmentQuestions")
    .populate("domainId")
    .sort({ category: 1, title: 1 });
  res.json(competencies);
});

export const listAssessmentCompetencies = asyncHandler(async (req, res) => {
  const filter = {
    isActive: true,
    $or: [{ standardStatus: "active" }, { standardStatus: trustedExists(false) }]
  };
  if (req.query.domainId) filter.domainId = req.query.domainId;

  const competencies = await Competency.find(filter)
    .populate("domainId")
    .sort({ category: 1, title: 1 });

  res.json(competencies.map(sanitizeQuestionBank));
});

export const listManagedCompetencies = asyncHandler(async (_req, res) => {
  const competencies = await Competency.find({ isActive: true })
    .populate("domainId")
    .sort({ category: 1, title: 1 });
  res.json(competencies);
});

export const createCompetency = asyncHandler(async (req, res) => {
  await assertDomainExists(req.body.domainId);

  const duplicate = await Competency.findOne({
    rtbReference: req.body.rtbReference,
    version: req.body.version || "1.0",
    isActive: true
  });
  if (duplicate) {
    throw new ApiError(409, "This RTB reference and version already exist.");
  }

  const competency = await Competency.create(
    pickDefined(req.body, EDITABLE_COMPETENCY_FIELDS)
  );
  res.status(201).json({
    message: "RTB competency standard added successfully.",
    competency
  });
});

export const updateCompetency = asyncHandler(async (req, res) => {
  await assertDomainExists(req.body.domainId);

  const duplicate = await Competency.findOne({
    _id: trustedNotEqual(req.params.id),
    rtbReference: req.body.rtbReference,
    version: req.body.version || "1.0",
    isActive: true
  });
  if (duplicate) {
    throw new ApiError(409, "This RTB reference and version already exist.");
  }

  const competency = await Competency.findByIdAndUpdate(
    req.params.id,
    pickDefined(req.body, EDITABLE_COMPETENCY_FIELDS),
    {
      new: true,
      runValidators: true
    }
  );

  if (!competency) {
    throw new ApiError(404, "Competency was not found.");
  }

  res.json({
    message: "RTB competency standard updated successfully.",
    competency
  });
});

export const archiveCompetency = asyncHandler(async (req, res) => {
  const competency = await Competency.findByIdAndUpdate(
    req.params.id,
    { isActive: false, standardStatus: "archived" },
    { new: true }
  );

  if (!competency) {
    throw new ApiError(404, "Competency was not found.");
  }

  res.json({
    message: "RTB competency standard archived successfully.",
    competency
  });
});
