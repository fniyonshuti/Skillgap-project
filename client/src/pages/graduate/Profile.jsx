import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api, getErrorMessage } from "../../services/api.js";

export function ProfilePage() {
  const { setProfile } = useAuth();
  const [profile, setLocalProfile] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/graduates/me"), api.get("/institutions")])
      .then(([profileRes, institutionsRes]) => {
        setLocalProfile(profileRes.data);
        setInstitutions(institutionsRes.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        institutionId:
          profile.institutionId?._id || profile.institutionId || "",
        registrationNumber: profile.registrationNumber || "",
        program: profile.program || "",
        graduationYear: profile.graduationYear || "",
        phone: profile.phone || "",
        district: profile.district || "Kicukiro",
      };
      const { data } = await api.patch("/graduates/me", payload);
      setLocalProfile(data);
      setProfile(data);
      setMessage("Profile updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const institutionId =
    profile?.institutionId?._id || profile?.institutionId || "";
  const institutionName =
    institutions.find((institution) => institution._id === institutionId)
      ?.name || "Not selected";
  const profileComplete =
    profile?.profileCompleted ??
    Boolean(profile?.program && profile?.graduationYear);

  if (loading) {
    return <div className="panel profile-loading">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="alert error profile-state">
        {error || "Graduate profile could not be loaded."}
      </div>
    );
  }

  return (
    <div className="page-stack profile-page">
      <div className="section-heading profile-heading">
        <div>
          <span className="eyebrow">Graduate profile</span>
          <h2>Profile details</h2>
          <p>
            Keep your academic and contact record current so assessment reports
            and recommendations stay accurate.
          </p>
        </div>
        <div className={`score-pill ${profileComplete ? "ready" : "pending"}`}>
          {profileComplete ? "Profile complete" : "Profile incomplete"}
        </div>
      </div>
      <div className="profile-layout">
        <form className="panel form-panel profile-form" onSubmit={handleSubmit}>
          <div className="profile-form-head">
            <div>
              <h3>Update your information</h3>
              <p>
                These details appear in reports, recommendations, and graduate
                records.
              </p>
            </div>
          </div>

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <fieldset className="profile-fieldset">
            <legend>Academic information</legend>
            <div className="form-grid two">
              <label>
                Institution
                <select
                  value={institutionId}
                  onChange={(event) =>
                    setLocalProfile({
                      ...profile,
                      institutionId: event.target.value,
                    })
                  }
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
                  onChange={(event) =>
                    setLocalProfile({
                      ...profile,
                      registrationNumber: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Program
                <input
                  value={profile.program || ""}
                  onChange={(event) =>
                    setLocalProfile({ ...profile, program: event.target.value })
                  }
                />
              </label>
              <label>
                Graduation year
                <input
                  type="number"
                  value={profile.graduationYear || ""}
                  onChange={(event) =>
                    setLocalProfile({
                      ...profile,
                      graduationYear: Number(event.target.value),
                    })
                  }
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="profile-fieldset">
            <legend>Contact details</legend>
            <div className="form-grid two">
              <label>
                Phone
                <input
                  value={profile.phone || ""}
                  onChange={(event) =>
                    setLocalProfile({ ...profile, phone: event.target.value })
                  }
                />
              </label>
              <label>
                District
                <input
                  value={profile.district || ""}
                  onChange={(event) =>
                    setLocalProfile({
                      ...profile,
                      district: event.target.value,
                    })
                  }
                />
              </label>
            </div>
          </fieldset>

          <div className="profile-actions">
            <button className="primary-button fit" type="submit">
              Save profile
            </button>
          </div>
        </form>

        <aside className="panel profile-summary">
          <div className="profile-summary-head">
            <div>
              <span className="eyebrow">Summary</span>
              <h3>Current profile snapshot</h3>
            </div>
            <div
              className={`score-pill ${profileComplete ? "ready" : "pending"}`}
            >
              {profileComplete ? "Ready for reports" : "Needs attention"}
            </div>
          </div>

          <dl className="profile-summary-list">
            <div>
              <dt>Institution</dt>
              <dd>{institutionName}</dd>
            </div>
            <div>
              <dt>Registration number</dt>
              <dd>{profile.registrationNumber || "Not provided"}</dd>
            </div>
            <div>
              <dt>Program</dt>
              <dd>{profile.program || "Not provided"}</dd>
            </div>
            <div>
              <dt>Graduation year</dt>
              <dd>{profile.graduationYear || "Not provided"}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{profile.phone || "Not provided"}</dd>
            </div>
            <div>
              <dt>District</dt>
              <dd>{profile.district || "Kicukiro"}</dd>
            </div>
          </dl>

          <div className="profile-note">
            <strong>Why this matters</strong>
            <p>
              Assessment reports, recommendations, and graduate search results
              depend on these details being accurate.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
