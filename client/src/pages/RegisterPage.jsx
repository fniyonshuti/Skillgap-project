import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api, getErrorMessage } from "../services/api.js";

const accountLabels = {
  graduate: "Graduate",
  institution: "Institutional",
  admin: "Admin"
};

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [form, setForm] = useState({
    role: "graduate",
    name: "",
    email: "",
    password: "",
    institutionId: "",
    institutionName: "",
    institutionCode: "",
    adminSetupCode: "",
    program: "",
    graduationYear: new Date().getFullYear(),
    phone: "",
    district: "Kicukiro",
    address: ""
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/institutions").then(({ data }) => setInstitutions(data)).catch(() => setInstitutions([]));
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload =
        form.role === "admin"
          ? {
              role: "admin",
              name: form.name,
              email: form.email,
              password: form.password,
              adminSetupCode: form.adminSetupCode
            }
          : form.role === "institution"
          ? {
              role: "institution",
              name: form.name,
              email: form.email,
              password: form.password,
              institutionName: form.institutionName,
              institutionCode: form.institutionCode,
              phone: form.phone,
              district: form.district,
              address: form.address
            }
          : {
              role: "graduate",
              name: form.name,
              email: form.email,
              password: form.password,
              institutionId: form.institutionId,
              program: form.program,
              graduationYear: form.graduationYear,
              phone: form.phone,
              district: form.district
            };

      await register(payload);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <span className="logo-mark">SG</span>
          <h1>Create Account</h1>
          <p>
            Register as a graduate, institutional user, or administrator to access the right
            workspace for your role.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>{accountLabels[form.role]} registration</h2>
          {error && <div className="alert error">{error}</div>}

          <div className="role-toggle" aria-label="Account type">
            {Object.entries(accountLabels).map(([role, label]) => (
              <button
                key={role}
                type="button"
                className={form.role === role ? "active" : ""}
                onClick={() => setForm({ ...form, role })}
              >
                {label}
              </button>
            ))}
          </div>

          <label>
            {form.role === "institution" ? "Contact person" : "Full name"}
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              minLength={8}
              required
            />
          </label>

          {form.role === "graduate" ? (
            <>
              <label>
                Institution
                <select
                  value={form.institutionId}
                  onChange={(event) => setForm({ ...form, institutionId: event.target.value })}
                >
                  <option value="">Select institution</option>
                  {institutions.map((institution) => (
                    <option key={institution._id} value={institution._id}>
                      {institution.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid two">
                <label>
                  Program
                  <input
                    value={form.program}
                    onChange={(event) => setForm({ ...form, program: event.target.value })}
                  />
                </label>
                <label>
                  Graduation year
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={form.graduationYear}
                    onChange={(event) => setForm({ ...form, graduationYear: Number(event.target.value) })}
                  />
                </label>
              </div>
            </>
          ) : form.role === "institution" ? (
            <>
              <label>
                Institution name
                <input
                  value={form.institutionName}
                  onChange={(event) => setForm({ ...form, institutionName: event.target.value })}
                  required={form.role === "institution"}
                />
              </label>
              <div className="form-grid two">
                <label>
                  Institution code
                  <input
                    value={form.institutionCode}
                    onChange={(event) => setForm({ ...form, institutionCode: event.target.value })}
                    required={form.role === "institution"}
                  />
                </label>
                <label>
                  District
                  <input
                    value={form.district}
                    onChange={(event) => setForm({ ...form, district: event.target.value })}
                  />
                </label>
              </div>
              <label>
                Address
                <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
              </label>
            </>
          ) : (
            <label>
              Admin setup code
              <input
                type="password"
                value={form.adminSetupCode}
                onChange={(event) => setForm({ ...form, adminSetupCode: event.target.value })}
                required={form.role === "admin"}
              />
            </label>
          )}

          {form.role !== "admin" && (
            <label>
              Phone
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>
          )}

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Creating..." : `Create ${accountLabels[form.role].toLowerCase()} account`}
          </button>
          <p className="muted">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
