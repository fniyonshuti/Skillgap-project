/**
 * @fileoverview Public sign-in page for all application roles.
 */

import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { AuthLayout } from "../../layouts/AuthLayout.jsx";
import { getErrorMessage } from "../../services/api.js";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthLayout
      title="Skills Gap Analysis Tool"
      description="Assess ICT graduate competencies against RTB-aligned standards for Kicukiro District."
    >
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Sign in</h2>
        {error && <div className="alert error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            maxLength={254}
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            maxLength={128}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? "Signing in..." : "Sign in"}
        </button>
        <p className="muted">
          No account yet? <Link to="/register">Create graduate account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
