import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, CircleDashed, ListChecks, PlayCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api, getErrorMessage } from "../services/api.js";

const statusLabels = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed"
};

const statusIcons = {
  pending: CircleDashed,
  in_progress: PlayCircle,
  completed: CheckCircle2
};

export function RecommendationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/recommendations");
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const progress = useMemo(() => {
    if (!items.length) return 0;
    return Math.round((items.filter((item) => item.status === "completed").length / items.length) * 100);
  }, [items]);

  async function updateStatus(id, status) {
    try {
      await api.patch(`/recommendations/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="page-stack recommendations-workspace">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Personalized improvement plan</span>
          <h2>Recommendations</h2>
          <p>
            Work through the learning actions generated from your latest RTB competency gaps and
            track progress as evidence improves.
          </p>
        </div>
        <div className="recommendation-progress">
          <strong>{progress}%</strong>
          <span>actions completed</span>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="recommendation-board">
        {items.map((item) => {
          const StatusIcon = statusIcons[item.status] || CircleDashed;
          return (
            <article key={item._id} className={`recommendation-plan-card priority-${item.priority}`}>
              <header>
                <div className="recommendation-plan-title">
                  <BookOpenCheck size={20} />
                  <div>
                    <strong>{item.competencyId?.title || "Competency"}</strong>
                    <span>
                      {item.competencyId?.rtbReference || "RTB competency"}
                      {user.role !== "graduate" && item.graduateId?.userId?.name
                        ? ` - ${item.graduateId.userId.name}`
                        : ""}
                    </span>
                  </div>
                </div>
                <span className={`tag tag-${item.priority}`}>{item.priority} priority</span>
              </header>

              <p>{item.recommendationText}</p>
              {item.rationale && <small className="recommendation-rationale">{item.rationale}</small>}

              {item.actionItems?.length > 0 && (
                <div className="recommendation-actions">
                  <strong>
                    <ListChecks size={17} />
                    Action checklist
                  </strong>
                  <ul>
                    {item.actionItems.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              <footer>
                <span>
                  Target: Level {item.targetLevel || item.competencyId?.requiredLevel} - {item.resourceType}
                </span>
                <label className="status-select">
                  <StatusIcon size={17} />
                  <select value={item.status} onChange={(event) => updateStatus(item._id, event.target.value)}>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </footer>
            </article>
          );
        })}

        {!items.length && (
          <section className="panel recommendation-empty">
            <CheckCircle2 size={34} />
            <h3>No improvement actions yet</h3>
            <p>Complete a skills assessment to generate personalized recommendations.</p>
          </section>
        )}
      </div>
    </div>
  );
}
