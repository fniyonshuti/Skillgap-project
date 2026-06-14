/**
 * @fileoverview Security-sensitive comparison helpers.
 */

import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Compares secret strings without leaking an early-exit timing signal.
 *
 * @param {unknown} providedValue - User-provided secret.
 * @param {unknown} expectedValue - Configured secret.
 * @returns {boolean}
 */
export function secretsMatch(providedValue, expectedValue) {
  if (typeof providedValue !== "string" || typeof expectedValue !== "string") {
    return false;
  }

  // Hashing first produces fixed-size inputs, avoiding an early return that
  // would otherwise reveal whether the supplied secret has the expected length.
  const providedBuffer = createHash("sha256").update(providedValue).digest();
  const expectedBuffer = createHash("sha256").update(expectedValue).digest();

  return timingSafeEqual(providedBuffer, expectedBuffer);
}
