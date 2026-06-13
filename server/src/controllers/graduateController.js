import { body } from "express-validator";
import { Graduate } from "../models/Graduate.js";
import { Institution } from "../models/Institution.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const graduateProfileValidation = [
  body("institutionId").optional({ checkFalsy: true }).isMongoId().withMessage("Invalid institution."),
  body("graduationYear")
    .optional({ checkFalsy: true })
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Graduation year is invalid.")
];

async function currentInstitution(userId) {
  return Institution.findOne({ accountUserId: userId });
}

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

  const allowed = [
    "institutionId",
    "registrationNumber",
    "program",
    "graduationYear",
    "phone",
    "district"
  ];

  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key))
  );

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
  const { search = "", institutionId, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (req.user.role === "institution") {
    const institution = await currentInstitution(req.user._id);
    if (!institution) {
      throw new ApiError(404, "Institution profile was not found.");
    }
    filter.institutionId = institution._id;
  } else if (institutionId) {
    filter.institutionId = institutionId;
  }

  if (search) {
    filter.$or = [
      { program: { $regex: search, $options: "i" } },
      { registrationNumber: { $regex: search, $options: "i" } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Graduate.find(filter)
      .populate("userId", "name email")
      .populate("institutionId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Graduate.countDocuments(filter)
  ]);

  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

export const getGraduate = asyncHandler(async (req, res) => {
  const graduate = await Graduate.findById(req.params.id)
    .populate("userId", "name email")
    .populate("institutionId");

  if (!graduate) {
    throw new ApiError(404, "Graduate was not found.");
  }

  if (req.user.role === "institution") {
    const institution = await currentInstitution(req.user._id);
    if (!institution || graduate.institutionId?._id.toString() !== institution._id.toString()) {
      throw new ApiError(403, "You cannot access this graduate profile.");
    }
  }

  res.json(graduate);
});
