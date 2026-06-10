import { body } from "express-validator";
import { Competency } from "../models/Competency.js";
import {
  ASSESSMENT_SOURCES,
  sanitizeQuestionBank
} from "../services/assessmentQuestionScoringService.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const competencyValidation = [
  body("domainId").isMongoId().withMessage("A valid domain is required."),
  body("title").trim().notEmpty().withMessage("Competency title is required."),
  body("rtbReference").trim().notEmpty().withMessage("RTB reference is required."),
  body("requiredLevel")
    .isInt({ min: 1, max: 4 })
    .withMessage("Required level must be between 1 and 4."),
  body("standardStatus")
    .optional()
    .isIn(["draft", "active", "archived"])
    .withMessage("Standard status must be draft, active, or archived."),
  body("assessmentQuestions")
    .isArray({ min: 4 })
    .withMessage("Add assessment questions for all four evidence sources."),
  body("assessmentQuestions.*.source")
    .isIn(ASSESSMENT_SOURCES)
    .withMessage("Each question must use a valid evidence source."),
  body("assessmentQuestions.*.prompt")
    .trim()
    .notEmpty()
    .withMessage("Each assessment question requires a prompt."),
  body("assessmentQuestions.*.options")
    .isArray({ min: 2 })
    .withMessage("Each assessment question requires at least two answer options."),
  body("assessmentQuestions.*.options.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each answer option requires a label."),
  body("assessmentQuestions.*.options.*.score")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Administrator scoring points must be between 0 and 100."),
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

export const listCompetencies = asyncHandler(async (req, res) => {
  const filter = {
    isActive: true,
    $or: [{ standardStatus: "active" }, { standardStatus: { $exists: false } }]
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
    $or: [{ standardStatus: "active" }, { standardStatus: { $exists: false } }]
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
  const duplicate = await Competency.findOne({
    rtbReference: req.body.rtbReference,
    version: req.body.version || "1.0",
    isActive: true
  });
  if (duplicate) {
    throw new ApiError(409, "This RTB reference and version already exist.");
  }

  const competency = await Competency.create(req.body);
  res.status(201).json({
    message: "RTB competency standard added successfully.",
    competency
  });
});

export const updateCompetency = asyncHandler(async (req, res) => {
  const duplicate = await Competency.findOne({
    _id: { $ne: req.params.id },
    rtbReference: req.body.rtbReference,
    version: req.body.version || "1.0",
    isActive: true
  });
  if (duplicate) {
    throw new ApiError(409, "This RTB reference and version already exist.");
  }

  const competency = await Competency.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

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
