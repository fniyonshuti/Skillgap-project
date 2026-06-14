import { Archive, Pencil } from "lucide-react";
import {
  COMPETENCY_LEVEL_LABELS,
  isQuestionBankReady
} from "../competencyForm.js";

export function StandardsRegistry({ competencies, onEdit, onArchive }) {
  return (
    <section className="panel standards-registry">
      <div className="section-heading compact-heading">
        <div>
          <h3>Active Standards Registry</h3>
          <p>Review the references currently available to the assessment engine.</p>
        </div>
      </div>
      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>RTB reference</th>
              <th>Competency</th>
              <th>Domain</th>
              <th>Requirement</th>
              <th>Version</th>
              <th>Status</th>
              <th>Question bank</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {competencies.map((competency) => (
              <tr key={competency._id}>
                <td>
                  <strong>{competency.rtbReference}</strong>
                </td>
                <td>
                  <strong>{competency.title}</strong>
                  <small className="table-subtext">{competency.category}</small>
                </td>
                <td>{competency.domainId?.name}</td>
                <td>
                  Level {competency.requiredLevel}
                  <small className="table-subtext">
                    {COMPETENCY_LEVEL_LABELS[competency.requiredLevel]}
                  </small>
                </td>
                <td>{competency.version || "1.0"}</td>
                <td>
                  <span className="tag tag-none">{competency.standardStatus || "active"}</span>
                </td>
                <td>
                  <strong>{competency.assessmentQuestions?.length || 0} questions</strong>
                  <small className="table-subtext">
                    {isQuestionBankReady(competency.assessmentQuestions)
                      ? "Ready for assessment"
                      : "Needs configuration"}
                  </small>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="text-button button-with-icon"
                      type="button"
                      onClick={() => onEdit(competency)}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>
                    <button
                      className="text-button danger button-with-icon"
                      type="button"
                      onClick={() => onArchive(competency)}
                    >
                      <Archive size={15} />
                      Archive
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!competencies.length && (
              <tr>
                <td colSpan="8">No competency standards have been registered.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
