/**
 * @fileoverview Small object helpers used to enforce explicit update contracts.
 */

/**
 * Copies only explicitly allowed own-properties from a source object.
 * Undefined values are omitted so partial updates do not erase stored data.
 *
 * @param {Record<string, unknown>} source - Untrusted request payload.
 * @param {readonly string[]} allowedFields - Fields accepted by the operation.
 * @returns {Record<string, unknown>} Sanitized payload.
 */
export function pickDefined(source, allowedFields) {
  return Object.fromEntries(
    allowedFields
      .filter((field) => Object.hasOwn(source, field) && source[field] !== undefined)
      .map((field) => [field, source[field]])
  );
}
