import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  FileBarChart,
  FileSpreadsheet,
  Info,
  PrinterCheck
} from "lucide-react";
import { api, getErrorMessage } from "../services/api.js";

export function ReportsPage() {
  const [profile, setProfile] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    api
      .get("/graduates/me")
      .then(({ data }) => setProfile(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingProfile(false));
  }, []);

  useEffect(() => {
    if (profile?._id) loadReport();
  }, [profile?._id]);

  async function loadReport() {
    setError("");
    setLoading(true);

    try {
      const { data } = await api.get(`/reports/graduate/${profile._id}`);
      setReport(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function download(format) {
    setError("");

    try {
      const response = await api.get(`/reports/graduate/${profile._id}?format=${format}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `graduate-skills-gap-report.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loadingProfile) return <div className="panel">Loading your report workspace...</div>;

  if (!profile) {
    return <div className="alert error">{error || "Graduate profile could not be loaded."}</div>;
  }

  return (
    <div className="page-stack reports-workspace">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Competency evidence and gap results</span>
          <h2>Competency Reports</h2>
          <p>
            Preview the latest verified calculation and export a complete RTB competency mapping
            report for review, career planning, or submission.
          </p>
        </div>
        <div className="button-row">
          <button className="secondary-button button-with-icon" type="button" onClick={() => download("csv")}>
            <FileSpreadsheet size={17} />
            CSV
          </button>
          <button className="secondary-button button-with-icon" type="button" onClick={() => download("pdf")}>
            <Download size={17} />
            PDF
          </button>
          <button className="primary-button fit button-with-icon" type="button" onClick={loadReport}>
            <Eye size={17} />
            {loading ? "Generating..." : "Preview report"}
          </button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {!report && (
        <section className="panel report-empty-state">
          <FileBarChart size={36} />
          <h3>Your latest analysis is ready to format</h3>
          <p>
            Complete an assessment first, then select Preview report to review the evidence scores,
            RTB mappings, gaps, and recommendations before exporting.
          </p>
        </section>
      )}

      {report && (
        <section className="panel report-document">
          <header className="report-document-head">
            <div>
              <span className="eyebrow">{report.message}</span>
              <h3>Skills Gap Analysis Report</h3>
              <p>
                {report.graduate.name} - {report.ictCompetencyArea}
              </p>
            </div>
            <div className="report-generated-mark">
              <PrinterCheck size={20} />
              <span>Generated</span>
              <strong>{new Date(report.generatedAt).toLocaleDateString()}</strong>
            </div>
          </header>

          <div className="report-methodology">
            <Info size={18} />
            <span>{report.methodology}</span>
          </div>

          <div className="metrics-grid">
            <div className="metric-card metric-success">
              <span>Weighted score</span>
              <strong>{report.analysis.readinessScore}%</strong>
            </div>
            <div className="metric-card">
              <span>Competency level</span>
              <strong>{report.analysis.overallCompetencyLevel || "-"}</strong>
            </div>
            <div className="metric-card metric-warning">
              <span>Average gap</span>
              <strong>{report.analysis.overallGapScore}</strong>
            </div>
            <div className="metric-card">
              <span>Improvement actions</span>
              <strong>{report.recommendations.length}</strong>
            </div>
          </div>

          <div className="report-summary">
            <h4>Executive summary</h4>
            <p>{report.analysis.summary}</p>
          </div>

          <div className="table-panel report-results-table">
            <table>
              <thead>
                <tr>
                  <th>RTB competency</th>
                  <th>Evidence score</th>
                  <th>Level mapping</th>
                  <th>Gap</th>
                  <th>Classification</th>
                </tr>
              </thead>
              <tbody>
                {report.competencies.map((item) => (
                  <tr key={`${item.rtbReference}-${item.competency}`}>
                    <td>
                      <strong>{item.competency}</strong>
                      <small className="table-subtext">{item.rtbReference}</small>
                    </td>
                    <td>
                      <strong>{item.weightedScore}%</strong>
                      {item.practicalScore !== null && (
                        <small className="table-subtext">
                          P {item.practicalScore} / PF {item.portfolioScore} / A {item.academicScore} / S{" "}
                          {item.selfAssessmentScore}
                        </small>
                      )}
                      {item.evidenceFiles?.length > 0 && (
                        <small className="table-subtext">
                          {item.evidenceFiles.length} uploaded file
                          {item.evidenceFiles.length === 1 ? "" : "s"}
                        </small>
                      )}
                    </td>
                    <td>
                      Level {item.achievedLevel} achieved
                      <small className="table-subtext">{item.competencyStatus}</small>
                      <small className="table-subtext">Level {item.requiredLevel} required</small>
                    </td>
                    <td>{item.gapScore}</td>
                    <td>
                      <span className={`tag tag-${item.priority}`}>{item.classification}</span>
                    </td>
                  </tr>
                ))}
                {!report.competencies.length && (
                  <tr>
                    <td colSpan="5">Complete an assessment to generate competency results.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="report-recommendations">
            <h4>Personalized recommendations</h4>
            <div className="recommendation-stack">
              {report.recommendations.map((item) => (
                <article key={`${item.competency}-${item.action}`} className="recommendation-card">
                  <div>
                    <strong>{item.competency}</strong>
                    <span className={`tag tag-${item.priority}`}>{item.priority}</span>
                  </div>
                  <p>{item.action}</p>
                  {item.actionItems?.length > 0 && (
                    <ul>
                      {item.actionItems.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
              {!report.recommendations.length && (
                <p className="muted">No remedial actions are required for the latest assessment.</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
