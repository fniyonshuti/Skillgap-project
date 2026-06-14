/**
 * @fileoverview Shared query helpers for safe search and bounded pagination.
 */

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Escapes user-provided text before it is embedded in a MongoDB regular
 * expression. This prevents regex metacharacters from changing query meaning
 * or triggering expensive expressions.
 *
 * @param {string} value - Raw search text.
 * @returns {string} Regex-safe search text.
 */
export function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Converts pagination query values into positive, bounded integers.
 *
 * @param {{page?: unknown, limit?: unknown}} query - Request query values.
 * @returns {{page: number, limit: number, skip: number}}
 */
export function parsePagination(query = {}) {
  const parsedPage = Number(query.page ?? 1);
  const parsedLimit = Number(query.limit ?? DEFAULT_PAGE_SIZE);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit =
    Number.isSafeInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}
