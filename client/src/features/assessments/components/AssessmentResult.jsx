import { BadgeCheck, ChevronRight, FileCheck2 } from "lucide-react";
import { Link } from "react-router-dom";

export function AssessmentResult({ result, sortedGapItems, competencyMap }) {
  if (!result) return null;

  return (
    <section className="panel assessment-result-panel">
      <div className="assessment-result-head">
        <div>
          <span className="eyebrow">{result.message}</span>
          <h3>Your competency gap analysis</h3>
          <p>{result.gapAnalysis.summary}</p>
        </div>
        <BadgeCheck size={34} />
      </div>

      <div className="workflow-confirmations" aria-label="Analysis workflow status">
        {Object.values(result.workflow || {}).map((message) => (
          <span key={message}>
            <FileCheck2 size={16} />
            {message}
          </span>
        ))}
      </div>

      <div className="metrics-grid">
        <div className="metric-card metric-success">
          <span>Weighted score</span>
          <strong>{result.gapAnalysis.readinessScore}%</strong>
        </div>
        <div className="metric-card metric-warning">
          <span>Average gap</span>
          <strong>{result.gapAnalysis.overallGapScore}</strong>
        </div>
        <div className="metric-card">
          <span>Learning actions</span>
          <strong>{result.recommendations.length}</strong>
        </div>
      </div>

      <div className="result-grid">
        <div>
          <h4>Competency mapping</h4>
          <div className="gap-list">
            {sortedGapItems.map((item) => {
              const competency = competencyMap.get(String(item.competencyId));
              return (
                <article key={`${item.competencyId}-${item.priority}`} className="gap-card">
                  <div>
                    <strong>{competency?.title || "Competency"}</strong>
                    <span>
                      {item.competencyScore}% - Level {item.achievedLevel} achieved / Level{" "}
                      {item.requiredLevel} required
                    </span>
                    <small>{item.classification}</small>
                  </div>
                  <span className={`tag tag-${item.priority}`}>{item.priority}</span>
                </article>
              );
            })}
          </div>
        </div>

        <div>
          <h4>Personalized next steps</h4>
          <div className="gap-list">
            {result.recommendations.map((item) => {
              const competency = competencyMap.get(String(item.competencyId));
              return (
                <article
                  key={item._id || item.competencyId}
                  className="gap-card recommendation-mini"
                >
                  <div>
                    <strong>{competency?.title || "Competency"}</strong>
                    <span>{item.recommendationText}</span>
                    {item.actionItems?.slice(0, 2).map((action) => (
                      <small key={action}>- {action}</small>
                    ))}
                  </div>
                </article>
              );
            })}
            {!result.recommendations.length && (
              <p className="muted">You currently meet every selected RTB requirement.</p>
            )}
          </div>
        </div>
      </div>

      <div className="result-next-actions">
        <div>
          <FileCheck2 size={20} />
          <span>
            <strong>Your report has been generated and saved.</strong>
            <small>Continue with the final graduate workflow steps.</small>
          </span>
        </div>
        <div>
          <Link className="secondary-button button-with-icon" to="/recommendations">
            View recommendations
          </Link>
          <Link className="primary-button fit button-with-icon" to="/reports">
            View competency report
            <ChevronRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
