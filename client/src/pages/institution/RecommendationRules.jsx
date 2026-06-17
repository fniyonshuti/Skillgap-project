import { useEffect, useState } from "react";
import { BookOpenCheck, Save, ShieldCheck } from "lucide-react";
import { api, getErrorMessage } from "../../services/api.js";

const ruleMetadata = {
  low: {
    label: "Low gap",
    description: "Applied when the graduate is one competency level below the RTB requirement."
  },
  medium: {
    label: "Moderate gap",
    description: "Applied when the graduate is two competency levels below the RTB requirement."
  },
  high: {
    label: "High gap",
    description: "Applied when the graduate is three competency levels below the RTB requirement."
  }
};

const emptyRules = ["low", "medium", "high"].map((priority) => ({
  priority,
  recommendationText: "",
  actionItemsText: "",
  resourceType: "practice"
}));

function toEditableRules(rules = []) {
  return emptyRules.map((emptyRule) => {
    const storedRule = rules.find((rule) => rule.priority === emptyRule.priority);
    return storedRule
      ? {
          priority: storedRule.priority,
          recommendationText: storedRule.recommendationText,
          actionItemsText: storedRule.actionItems.join("\n"),
          resourceType: storedRule.resourceType
        }
      : emptyRule;
  });
}

export function RecommendationRulesPage() {
  const [institutionName, setInstitutionName] = useState("");
  const [rules, setRules] = useState(emptyRules);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get("/recommendation-rules")
      .then(({ data }) => {
        setInstitutionName(data.institution.name);
        setRules(toEditableRules(data.rules));
        setUpdatedAt(data.updatedAt);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function updateRule(priority, field, value) {
    setRules((current) =>
      current.map((rule) => (rule.priority === priority ? { ...rule, [field]: value } : rule))
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      rules: rules.map((rule) => ({
        priority: rule.priority,
        recommendationText: rule.recommendationText.trim(),
        actionItems: rule.actionItemsText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        resourceType: rule.resourceType
      }))
    };

    try {
      const { data } = await api.put("/recommendation-rules", payload);
      setRules(toEditableRules(data.rules));
      setUpdatedAt(data.updatedAt);
      setMessage(data.message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="panel">Loading recommendation rules...</div>;
  }

  return (
    <form className="page-stack" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Institution-owned recommendation policy</span>
          <h2>Recommendation Rules</h2>
          <p>
            Define the recommendation and actions your graduates receive for each calculated gap
            priority. Administrators and graduates cannot edit these rules.
          </p>
        </div>
        <div className="standards-status">
          <ShieldCheck size={18} />
          {institutionName || "Institution"}
        </div>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <section className="panel">
        <div className="assessment-panel-title">
          <BookOpenCheck size={22} />
          <div>
            <h3>Gap-to-action rules</h3>
            <p>
              The system classifies the gap, then uses only the matching rule defined here.
              Enter one action per line.
            </p>
          </div>
        </div>

        <div className="recommendation-board">
          {rules.map((rule) => {
            const metadata = ruleMetadata[rule.priority];
            return (
              <article
                key={rule.priority}
                className={`recommendation-plan-card priority-${rule.priority}`}
              >
                <header>
                  <div>
                    <strong>{metadata.label}</strong>
                    <p>{metadata.description}</p>
                  </div>
                  <span className={`tag tag-${rule.priority}`}>{rule.priority} priority</span>
                </header>

                <div className="form-grid two">
                  <label>
                    Recommendation text
                    <textarea
                      value={rule.recommendationText}
                      onChange={(event) =>
                        updateRule(rule.priority, "recommendationText", event.target.value)
                      }
                      placeholder="Describe the improvement support the graduate should receive."
                      required
                    />
                  </label>
                  <label>
                    Action checklist
                    <textarea
                      value={rule.actionItemsText}
                      onChange={(event) =>
                        updateRule(rule.priority, "actionItemsText", event.target.value)
                      }
                      placeholder={"One action per line\nExample: Attend a supervised lab"}
                      required
                    />
                  </label>
                  <label>
                    Resource type
                    <select
                      value={rule.resourceType}
                      onChange={(event) =>
                        updateRule(rule.priority, "resourceType", event.target.value)
                      }
                    >
                      <option value="practice">Practice</option>
                      <option value="course">Course</option>
                      <option value="certification">Certification</option>
                      <option value="mentorship">Mentorship</option>
                    </select>
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="standard-editor-actions">
        <span>
          {updatedAt
            ? `Last updated ${new Date(updatedAt).toLocaleString()}`
            : "Complete all three rules before graduates submit assessments."}
        </span>
        <button className="primary-button fit button-with-icon" type="submit" disabled={saving}>
          <Save size={17} />
          {saving ? "Saving rules..." : "Save recommendation rules"}
        </button>
      </div>
    </form>
  );
}
