import { useEffect, useState } from "react";
import { FileBarChart, UserRound, X } from "lucide-react";
import { api, getErrorMessage } from "../../services/api.js";

export function GraduatesPage() {
  const [graduates, setGraduates] = useState([]);
  const [report, setReport] = useState(null);
  const [selectedGraduate, setSelectedGraduate] = useState(null);
  const [error, setError] = useState("");
  const [loadingReportId, setLoadingReportId] = useState("");

  useEffect(() => {
    api
      .get("/graduates")
      .then(({ data }) => setGraduates(data.items))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  async function viewReport(graduate) {
    setError("");
    setLoadingReportId(graduate._id);

    try {
      const { data } = await api.get(`/reports/graduate/${graduate._id}`);
      setSelectedGraduate(graduate);
      setReport(data);
      window.requestAnimationFrame(() =>
        document.getElementById("graduate-report-review")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        })
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingReportId("");
    }
  }

  return (
    <div className="page-stack">
      <div className="section-heading">
        <div>
          <h2>Graduates</h2>
          <p>Review graduate records and their latest saved skills gap analysis report.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Program</th>
              <th>Institution</th>
              <th>Year</th>
              <th>Status</th>
              <th>Report</th>
            </tr>
          </thead>
          <tbody>
            {graduates.map((graduate) => (
              <tr key={graduate._id}>
                <td>{graduate.userId?.name}</td>
                <td>{graduate.userId?.email}</td>
                <td>{graduate.program || "-"}</td>
                <td>{graduate.institutionId?.name || "-"}</td>
                <td>{graduate.graduationYear || "-"}</td>
                <td>{graduate.profileCompleted ? "Complete" : "Incomplete"}</td>
                <td>
                  <button
                    className="text-button button-with-icon"
                    type="button"
                    onClick={() => viewReport(graduate)}
                    disabled={loadingReportId === graduate._id}
                  >
                    <FileBarChart size={16} />
                    {loadingReportId === graduate._id ? "Loading..." : "View report"}
                  </button>
                </td>
              </tr>
            ))}
            {!graduates.length && (
              <tr>
                <td colSpan="7">No graduates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {report && (
        <section id="graduate-report-review" className="panel administrator-report-review">
          <header>
            <div>
              <span className="eyebrow">Latest skills gap report</span>
              <h3>{selectedGraduate?.userId?.name}</h3>
              <p>{report.ictCompetencyArea}</p>
            </div>
            <button
              type="button"
              title="Close report"
              aria-label="Close graduate report"
              onClick={() => {
                setReport(null);
                setSelectedGraduate(null);
              }}
            >
              <X size={18} />
            </button>
          </header>

          <div className="metrics-grid">
            <div className="metric-card metric-success">
              <span>Competency score</span>
              <strong>{report.analysis.readinessScore}%</strong>
            </div>
            <div className="metric-card">
              <span>Graduate level</span>
              <strong>{report.analysis.overallCompetencyLevel}</strong>
            </div>
            <div className="metric-card metric-warning">
              <span>Average gap</span>
              <strong>{report.analysis.overallGapScore}</strong>
            </div>
          </div>

          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>ICT competency</th>
                  <th>Score</th>
                  <th>Graduate level</th>
                  <th>Required RTB</th>
                  <th>Gap</th>
                  <th>Classification</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {report.competencies.map((item) => (
                  <tr key={`${item.rtbReference}-${item.competency}`}>
                    <td>
                      <strong>{item.competency}</strong>
                      <small className="table-subtext">{item.rtbReference}</small>
                    </td>
                    <td>{item.weightedScore}%</td>
                    <td>
                      Level {item.achievedLevel}
                      <small className="table-subtext">{item.competencyStatus}</small>
                    </td>
                    <td>Level {item.requiredLevel}</td>
                    <td>{item.gapScore}</td>
                    <td>{item.classification}</td>
                    <td>{item.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-review-note">
            <UserRound size={18} />
            Evidence status: {report.analysis.evidenceVerificationStatus}
          </div>
        </section>
      )}
    </div>
  );
}
