import { body } from "express-validator";
import { env } from "../config/env.js";
import { Graduate } from "../models/Graduate.js";
import { Institution } from "../models/Institution.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAccessToken } from "../utils/tokens.js";

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("A valid email is required."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
  body("role")
    .optional()
    .isIn(["graduate", "institution", "admin"])
    .withMessage("Registration role must be graduate, institution, or admin."),
  body("institutionName")
    .if(body("role").equals("institution"))
    .trim()
    .notEmpty()
    .withMessage("Institution name is required."),
  body("institutionCode")
    .if(body("role").equals("institution"))
    .trim()
    .notEmpty()
    .withMessage("Institution code is required."),
  body("adminSetupCode")
    .if(body("role").equals("admin"))
    .trim()
    .notEmpty()
    .withMessage("Admin setup code is required."),
  body("graduationYear")
    .optional({ checkFalsy: true })
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Graduation year is invalid.")
];

export const loginValidation = [
  body("email").isEmail().withMessage("A valid email is required."),
  body("password").notEmpty().withMessage("Password is required.")
];

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  };
}

export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role = "graduate",
    institutionId,
    institutionName,
    institutionCode,
    adminSetupCode,
    program,
    graduationYear,
    phone,
    district,
    address
  } = req.body;
  const selectedInstitutionId = institutionId || undefined;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  if (role === "graduate" && selectedInstitutionId) {
    const institution = await Institution.findById(selectedInstitutionId);
    if (!institution) {
      throw new ApiError(404, "Selected institution was not found.");
    }
  }

  if (role === "institution") {
    const existingInstitution = await Institution.findOne({
      code: institutionCode.trim().toUpperCase()
    });

    if (existingInstitution) {
      throw new ApiError(409, "An institution with this code already exists.");
    }
  }

  if (role === "admin") {
    if (!env.adminRegistrationCode) {
      throw new ApiError(403, "Admin registration is disabled. Set ADMIN_REGISTRATION_CODE in server/.env.");
    }

    if (adminSetupCode !== env.adminRegistrationCode) {
      throw new ApiError(403, "Invalid admin setup code.");
    }
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role
  });

  try {
    if (role === "admin") {
      // Admin accounts do not need a separate profile document.
    } else if (role === "institution") {
      await Institution.create({
        name: institutionName,
        code: institutionCode,
        district: district || "Kicukiro",
        contactEmail: email,
        contactPhone: phone,
        address,
        accountUserId: user._id
      });
    } else {
      await Graduate.create({
        userId: user._id,
        institutionId: selectedInstitutionId,
        program,
        graduationYear,
        phone,
        district: district || "Kicukiro",
        profileCompleted: Boolean(program && graduationYear)
      });
    }
  } catch (error) {
    await User.deleteOne({ _id: user._id }).catch(() => null);
    throw error;
  }

  res.status(201).json({
    message: "Registration successful.",
    user: sanitizeUser(user),
    token: signAccessToken(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "This account is suspended.");
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    message: "Login successful.",
    user: sanitizeUser(user),
    token: signAccessToken(user)
  });
});

export const getMe = asyncHandler(async (req, res) => {
  let profile = null;

  if (req.user.role === "graduate") {
    profile = await Graduate.findOne({ userId: req.user._id }).populate("institutionId");
  }

  if (req.user.role === "institution") {
    profile = await Institution.findOne({ accountUserId: req.user._id });
  }

  res.json({
    user: sanitizeUser(req.user),
    profile
  });
});
