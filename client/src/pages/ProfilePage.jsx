import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api, getErrorMessage } from "../services/api.js";

export function ProfilePage() {
  const { setProfile } = useAuth();
  const [profile, setLocalProfile] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/graduates/me"), api.get("/institutions")]).then(([profileRes, institutionsRes]) => {
      setLocalProfile(profileRes.data);
      setInstitutions(institutionsRes.data);
    });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        institutionId: profile.institutionId?._id || profile.institutionId || "",
        registrationNumber: profile.registrationNumber || "",
        program: profile.program || "",
        graduationYear: profile.graduationYear || "",
        phone: profile.phone || "",
        district: profile.district || "Kicukiro"
      };
      const { data } = await api.patch("/graduates/me", payload);
      setLocalProfile(data);
      setProfile(data);
      setMessage("Profile updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!profile) {
    return <div className="panel">Loading profile...</div>;
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <h2>Graduate Profile</h2>
          <p>Training and contact information used in assessment reports.</p>
        </div>
      </div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <div className="form-grid two">
        <label>
          Institution
          <select
            value={profile.institutionId?._id || profile.institutionId || ""}
            onChange={(event) => setLocalProfile({ ...profile, institutionId: event.target.value })}
          >
            <option value="">Select institution</option>
            {institutions.map((institution) => (
              <option key={institution._id} value={institution._id}>
                {institution.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Registration number
          <input
            value={profile.registrationNumber || ""}
            onChange={(event) => setLocalProfile({ ...profile, registrationNumber: event.target.value })}
          />
        </label>
        <label>
          Program
          <input value={profile.program || ""} onChange={(event) => setLocalProfile({ ...profile, program: event.target.value })} />
        </label>
        <label>
          Graduation year
          <input
            type="number"
            value={profile.graduationYear || ""}
            onChange={(event) => setLocalProfile({ ...profile, graduationYear: Number(event.target.value) })}
          />
        </label>
        <label>
          Phone
          <input value={profile.phone || ""} onChange={(event) => setLocalProfile({ ...profile, phone: event.target.value })} />
        </label>
        <label>
          District
          <input value={profile.district || ""} onChange={(event) => setLocalProfile({ ...profile, district: event.target.value })} />
        </label>
      </div>
      <button className="primary-button fit" type="submit">
        Save profile
      </button>
    </form>
  );
}
