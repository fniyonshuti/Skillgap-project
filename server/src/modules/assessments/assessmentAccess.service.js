import { assertGraduateAccess } from "../../shared/helpers/accessControl.service.js";

/**
 * Enforces assessment ownership across graduate, institution, and admin roles.
 */
export async function assertAssessmentAccess(user, assessment) {
  await assertGraduateAccess(
    user,
    assessment.graduateId,
    "You cannot access this assessment."
  );
}
