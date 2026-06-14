import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";
import {
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

  useEffect(() => {
    async function loadMe() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        setProfile(data.profile);
        writeStoredAuth(token, data.user);
      } catch (_error) {
        clearStoredAuth();
        setToken(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    loadMe();
  }, [token]);

  async function login(credentials) {
    const { data } = await api.post("/auth/login", credentials);
    writeStoredAuth(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    writeStoredAuth(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    setProfile(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      profile,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      setProfile
    }),
    [token, user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
