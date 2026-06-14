/**
 * @fileoverview Authentication state and session lifecycle provider.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { api } from "../services/api.js";
import {
  AUTH_EXPIRED_EVENT,
  clearStoredAuth,
  readStoredAuth,
  writeStoredAuth
} from "../utils/authStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [initialAuth] = useState(() => readStoredAuth());
  const [token, setToken] = useState(initialAuth.token);
  const [user, setUser] = useState(initialAuth.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const clearSession = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, clearSession);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, clearSession);
  }, [clearSession]);

  useEffect(() => {
    let isCurrent = true;

    async function loadMe() {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.get("/auth/me");
        if (!isCurrent) return;
        setUser(data.user);
        setProfile(data.profile);
        writeStoredAuth(token, data.user);
      } catch {
        if (isCurrent) clearSession();
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    loadMe();
    return () => {
      isCurrent = false;
    };
  }, [token, clearSession]);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    writeStoredAuth(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    writeStoredAuth(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      profile,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout: clearSession,
      setProfile
    }),
    [token, user, profile, loading, login, register, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
