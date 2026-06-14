/**
 * @fileoverview Authentication and account-registration business workflows.
 */

import { env } from "../config/env.js";
import { Graduate } from "../models/Graduate.js";
import { Institution } from "../models/Institution.js";
import { User } from "../models/User.js";
import { serializeUser } from "../serializers/userSerializer.js";
import { ApiError } from "../utils/apiError.js";
import { secretsMatch } from "../utils/security.js";
import { signAccessToken } from "../utils/tokens.js";

async function assertRegistrationDependencies(payload) {
  if (payload.role === "graduate" && payload.institutionId) {
    const institutionExists = await Institution.exists({ _id: payload.institutionId });
    if (!institutionExists) {
      throw new ApiError(404, "Selected institution was not found.");
    }
  }

  if (payload.role === "institution") {
    const existingInstitution = await Institution.exists({
      code: payload.institutionCode.trim().toUpperCase()
    });
    if (existingInstitution) {
      throw new ApiError(409, "An institution with this code already exists.");
    }
  }

  if (payload.role === "admin") {
    if (!env.adminRegistrationCode) {
      throw new ApiError(403, "Admin registration is disabled.");
    }
    if (!secretsMatch(payload.adminSetupCode, env.adminRegistrationCode)) {
      throw new ApiError(403, "Invalid admin setup code.");
    }
  }
}

async function createRoleProfile(user, payload) {
  if (payload.role === "admin") return null;

  if (payload.role === "institution") {
    return Institution.create({
      name: payload.institutionName,
      code: payload.institutionCode,
      district: payload.district || "Kicukiro",
      contactEmail: payload.email,
      contactPhone: payload.phone,
      address: payload.address,
      accountUserId: user._id
    });
  }

  return Graduate.create({
    userId: user._id,
    institutionId: payload.institutionId || undefined,
    program: payload.program,
    graduationYear: payload.graduationYear,
    phone: payload.phone,
    district: payload.district || "Kicukiro",
    profileCompleted: Boolean(payload.program && payload.graduationYear)
  });
}

/**
 * Creates a user and its role-specific profile as one compensating workflow.
 * MongoDB standalone installations may not support transactions, so a failed
 * profile creation explicitly removes the user record.
 *
 * @param {Record<string, any>} payload - Validated registration payload.
 * @returns {Promise<{message: string, user: object, token: string}>}
 */
export async function registerAccount(payload) {
  const role = payload.role || "graduate";
  const registrationPayload = { ...payload, role };

  const existingUser = await User.exists({ email: registrationPayload.email });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  await assertRegistrationDependencies(registrationPayload);

  const user = await User.create({
    name: registrationPayload.name,
    email: registrationPayload.email,
    passwordHash: registrationPayload.password,
    role
  });

  try {
    await createRoleProfile(user, registrationPayload);
  } catch (error) {
    await User.deleteOne({ _id: user._id }).catch(() => null);
    throw error;
  }

  return {
    message: "Registration successful.",
    user: serializeUser(user),
    token: signAccessToken(user)
  };
}

/**
 * Authenticates credentials without revealing whether an email is registered.
 *
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<{message: string, user: object, token: string}>}
 */
export async function authenticateCredentials({ email, password }) {
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }
  if (user.status !== "active") {
    throw new ApiError(403, "This account is suspended.");
  }

  user.lastLoginAt = new Date();
  await user.save();

  return {
    message: "Login successful.",
    user: serializeUser(user),
    token: signAccessToken(user)
  };
}

/**
 * Loads the profile associated with the authenticated user's role.
 *
 * @param {import("../models/User.js").User} user
 * @returns {Promise<object|null>}
 */
export async function getAuthenticatedProfile(user) {
  if (user.role === "graduate") {
    return Graduate.findOne({ userId: user._id }).populate("institutionId");
  }
  if (user.role === "institution") {
    return Institution.findOne({ accountUserId: user._id });
  }
  return null;
}
