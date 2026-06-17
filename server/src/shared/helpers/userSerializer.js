/**
 * @fileoverview Public user response shapes.
 */

/**
 * Removes persistence and authentication internals from API responses.
 *
 * @param {import("../../modules/users/user.model.js").User | Record<string, unknown>} user
 * @returns {{id: unknown, name: unknown, email: unknown, role: unknown, status: unknown}}
 */
export function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  };
}
