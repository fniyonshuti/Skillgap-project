/**
 * Determines whether a browser origin may call the API.
 *
 * Requests without an Origin header are allowed because they typically come
 * from server-to-server clients, health checks, or command-line tools.
 *
 * @param {string | undefined} origin - Browser Origin header.
 * @param {readonly string[]} allowedOrigins - Explicitly configured origins.
 * @returns {boolean}
 */
export function isAllowedOrigin(origin, allowedOrigins) {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/+$/, "");
  return allowedOrigins.includes(normalizedOrigin);
}
