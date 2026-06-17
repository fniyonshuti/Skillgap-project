/**
 * @fileoverview Shared role-to-resource access policies.
 *
 * Centralizing these checks prevents controllers from drifting into slightly
 * different interpretations of graduate and institution ownership.
 */

import { Graduate } from "../../modules/graduates/graduate.model.js";
import { Institution } from "../../modules/institutions/institution.model.js";
import { ApiError } from "../utils/apiError.js";

export function findInstitutionForUser(userId) {
  return Institution.findOne({ accountUserId: userId });
}

export function findGraduateForUser(userId) {
  return Graduate.findOne({ userId });
}

export async function getInstitutionGraduateIds(userId) {
  const institution = await findInstitutionForUser(userId);
  if (!institution) {
    throw new ApiError(404, "Institution profile was not found.");
  }

  const graduateIds = await Graduate.find({ institutionId: institution._id }).distinct("_id");
  return { institution, graduateIds };
}

/**
 * Verifies that a role may access a graduate-owned resource.
 *
 * @param {object} user - Authenticated user document.
 * @param {string|object} graduateId - Graduate identifier.
 * @param {string} denialMessage - Resource-specific denial message.
 * @returns {Promise<object>} Authorized graduate document.
 */
export async function assertGraduateAccess(
  user,
  graduateId,
  denialMessage = "You cannot access this graduate resource."
) {
  const graduate = await Graduate.findById(graduateId);
  if (!graduate) {
    throw new ApiError(404, "Graduate was not found.");
  }

  if (user.role === "admin") return graduate;
  if (user.role === "graduate" && graduate.userId.toString() === user._id.toString()) {
    return graduate;
  }

  if (user.role === "institution") {
    const institution = await findInstitutionForUser(user._id);
    if (institution && graduate.institutionId?.toString() === institution._id.toString()) {
      return graduate;
    }
  }

  throw new ApiError(403, denialMessage);
}
