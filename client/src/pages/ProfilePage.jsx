import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api, getErrorMessage } from "../services/api.js";

export function ProfilePage() {
  const { setProfile } = useAuth();
  const [profile, setLocalProfile] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    Promise.all([api.get("/graduates/me"), api.get("/institutions")])
      .then(([profileRes, institutionsRes]) => {
        setLocalProfile(profileRes.data);
        setInstitutions(institutionsRes.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

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

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleRemovePhoto() {
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview("");
  }

  const institutionId =
    profile?.institutionId?._id || profile?.institutionId || "";
  const institutionName =
    institutions.find((institution) => institution._id === institutionId)
      ?.name || "Not selected";
  const profileComplete =
    profile?.profileCompleted ??
    Boolean(profile?.program && profile?.graduationYear);
  const profileBadge = useMemo(() => {
    const source = profile?.registrationNumber || profile?.program || "GS";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [profile]);

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
    <div className="profile-page profile-modal-shell">
      <div className="section-heading profile-heading profile-modal-heading">
        <div>
          <span className="eyebrow">Graduate profile</span>
          <h2>Edit your profile</h2>
          <p>
            Keep your academic and contact record current so reports and
            recommendations stay accurate.
          </p>
        </div>
      </div>
      <div className="profile-modal">
        <form className="profile-modal-form" onSubmit={handleSubmit}>
          <div className="profile-modal-body">
            <div className="profile-form-panel">
              <div className="profile-form-head">
                <div>
                  <h3>Graduate details</h3>
                  <p>
                    Update the information used in reports, recommendations, and
                    records.
                  </p>
                </div>
                <div
                  className={`score-pill ${profileComplete ? "ready" : "pending"}`}
                >
                  {profileComplete ? "Complete" : "Incomplete"}
                </div>
              </div>

              {message && <div className="alert success">{message}</div>}
              {error && <div className="alert error">{error}</div>}

              <div className="profile-grid">
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
                      setLocalProfile({
                        ...profile,
                        program: event.target.value,
                      })
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

              <div className="profile-actions">
                <button className="primary-button fit" type="submit">
                  Save Changes
                </button>
              </div>
            </div>

            <aside
              className="profile-photo-panel"
              aria-label="Profile photo controls"
            >
              <div className="profile-photo-title">
                <h3>Profile photo</h3>
              </div>
              <div className="profile-photo-frame">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile preview" />
                ) : (
                  <div className="profile-photo-fallback">
                    <span>{profileBadge || "GS"}</span>
                  </div>
                )}
              </div>
              <label
                className="secondary-button profile-upload-button"
                htmlFor="profile-photo-upload"
              >
                Upload Photo
              </label>
              <input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                className="profile-photo-input"
                onChange={handlePhotoChange}
              />
              <button
                className="text-button profile-remove-button"
                type="button"
                onClick={handleRemovePhoto}
              >
                Remove Photo
              </button>

              <div className="profile-photo-meta">
                <p>
                  Current institution: <strong>{institutionName}</strong>
                </p>
                <p>
                  Profile status:{" "}
                  <strong>
                    {profileComplete ? "Ready" : "Needs completion"}
                  </strong>
                </p>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}
