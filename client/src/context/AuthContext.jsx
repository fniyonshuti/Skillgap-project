import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("skills_gap_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("skills_gap_user");
    return stored ? JSON.parse(stored) : null;
  });
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
        localStorage.setItem("skills_gap_user", JSON.stringify(data.user));
      } catch (_error) {
        localStorage.removeItem("skills_gap_token");
        localStorage.removeItem("skills_gap_user");
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
    localStorage.setItem("skills_gap_token", data.token);
    localStorage.setItem("skills_gap_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("skills_gap_token", data.token);
    localStorage.setItem("skills_gap_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("skills_gap_token");
    localStorage.removeItem("skills_gap_user");
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
