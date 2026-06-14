const TOKEN_KEY = "skills_gap_token";
const USER_KEY = "skills_gap_user";

export function clearStoredAuth(storage = window.localStorage) {
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
}

export function readStoredAuth(storage = window.localStorage) {
  const token = storage.getItem(TOKEN_KEY);
  const storedUser = storage.getItem(USER_KEY);

  if (!token || !storedUser) {
    if (token || storedUser) {
      clearStoredAuth(storage);
    }

    return { token: null, user: null };
  }

  try {
    const user = JSON.parse(storedUser);

    if (!user || typeof user !== "object" || Array.isArray(user)) {
      throw new TypeError("Stored user data is invalid.");
    }

    return { token, user };
  } catch {
    clearStoredAuth(storage);
    return { token: null, user: null };
  }
}

export function writeStoredAuth(token, user, storage = window.localStorage) {
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredToken(storage = window.localStorage) {
  return storage.getItem(TOKEN_KEY);
}
