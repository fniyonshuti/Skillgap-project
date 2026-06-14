import { ClipboardCheck, FileText, Target } from "lucide-react";

export function AssessmentOverview({
  domains,
  domainId,
  onDomainChange,
  selectedDomain,
  completionPercentage,
  completedCount,
  competencyCount,
  history
}) {
  return (
    <section className="assessment-overview-grid">
      <article className="panel assessment-domain-panel">
        <div className="assessment-panel-title">
          <Target size={22} />
          <div>
            <h3>Assessment setup</h3>
            <p>Choose the ICT occupational domain to evaluate.</p>
          </div>
        </div>
        <label>
          ICT domain
          <select value={domainId} onChange={(event) => onDomainChange(event.target.value)}>
            {domains.map((domain) => (
              <option key={domain._id} value={domain._id}>
                {domain.name}
              </option>
            ))}
          </select>
        </label>
        {selectedDomain && (
          <div className="domain-summary">
            <strong>{selectedDomain.name}</strong>
            <p>{selectedDomain.description}</p>
          </div>
        )}
      </article>

      <article className="panel assessment-progress-panel">
        <div className="assessment-panel-title">
          <ClipboardCheck size={22} />
          <div>
            <h3>Progress</h3>
            <p>Complete the questions and evidence for every RTB competency.</p>
          </div>
        </div>
        <div className="progress-ring-row">
          <div className="progress-ring" style={{ "--progress": `${completionPercentage}%` }}>
            <span>{completionPercentage}%</span>
          </div>
          <div>
            <strong>
              {completedCount} of {competencyCount}
            </strong>
            <p>competencies complete</p>
          </div>
        </div>
      </article>

      <article className="panel assessment-history-panel">
        <div className="assessment-panel-title">
          <FileText size={22} />
          <div>
            <h3>Assessment history</h3>
            <p>Your latest evidence-based assessments.</p>
          </div>
        </div>
        <div className="history-list">
          {history.slice(0, 5).map((item) => (
            <div key={item._id} className="history-row">
              <strong>{item.domainId?.name || "ICT domain"}</strong>
              <span>
                {item.overallCompetencyScore !== undefined
                  ? `${item.overallCompetencyScore}% - Level ${item.overallCompetencyLevel}`
                  : `Legacy score ${item.totalScore} / 5`}{" "}
                - {new Date(item.createdAt).toLocaleDateString()}
              </span>
              <small>
                {item.status} - evidence {item.evidenceVerificationStatus || "submitted"}
              </small>
            </div>
          ))}
          {!history.length && <p className="muted">No assessment submitted yet.</p>}
        </div>
      </article>
    </section>
  );
}
