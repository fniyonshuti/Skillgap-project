import { Fragment } from "react";
import { BookOpenCheck, ChevronRight } from "lucide-react";
import {
  COMPETENCY_LEVEL_GUIDE,
  EVIDENCE_SOURCES
} from "../assessmentConfig.js";

const ALGORITHM_STEPS = Object.freeze([
  ["Collect evidence", "Answers and supporting files"],
  ["Apply weights", "Server derives four source scores"],
  ["Map RTB level", "Score becomes Level 1-4"],
  ["Calculate gap", "Required level - achieved level"],
  ["Recommend action", "No, low, moderate, or high gap"]
]);

export function AssessmentScoringGuide() {
  return (
    <section className="panel scoring-guide-panel">
      <div className="assessment-panel-title">
        <BookOpenCheck size={22} />
        <div>
          <h3>How your result is calculated</h3>
          <p>Your answers are scored privately by the server using administrator-defined rules.</p>
        </div>
      </div>

      <div className="methodology-grid">
        {EVIDENCE_SOURCES.map((source) => {
          const Icon = source.icon;
          return (
            <article key={source.key} className="methodology-card">
              <Icon size={20} />
              <div>
                <strong>{source.label}</strong>
                <span>{source.weight}% weight</span>
                <p>{source.help}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="level-guide-row">
        {COMPETENCY_LEVEL_GUIDE.map((item) => (
          <div key={item.level}>
            <strong>Level {item.level}</strong>
            <span>{item.range}%</span>
            <small>{item.label}</small>
          </div>
        ))}
      </div>

      <div className="algorithm-flow" aria-label="Skills gap analysis algorithm">
        {ALGORITHM_STEPS.map(([title, description], index) => (
          <Fragment key={title}>
            <div className="algorithm-step">
              <span>{index + 1}</span>
              <strong>{title}</strong>
              <small>{description}</small>
            </div>
            {index < ALGORITHM_STEPS.length - 1 && <ChevronRight size={18} />}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
