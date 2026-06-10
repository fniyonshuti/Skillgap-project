import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  BrainCircuit,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Circle,
  FileCheck2,
  FileUp,
  FileText,
  FlaskConical,
  GraduationCap,
  Info,
  Link as LinkIcon,
  Layers3,
  LoaderCircle,
  Paperclip,
  ShieldCheck,
  Target,
  Trash2,
  UserCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../services/api.js";

const evidenceSources = [
  {
    key: "practical",
    label: "Practical assessment",
    weight: 40,
    icon: FlaskConical,
    help: "System-scored questions about lab tasks, demonstrations, and practical outcomes."
  },
  {
    key: "portfolio",
    label: "Portfolio evidence",
    weight: 30,
    icon: BriefcaseBusiness,
    help: "System-scored questions about projects, certificates, and verified technical work."
  },
  {
    key: "academic",
    label: "Academic record",
    weight: 20,
    icon: GraduationCap,
    help: "Structured questions linked to relevant modules, courses, and academic records."
  },
  {
    key: "selfAssessment",
    label: "Self-assessment",
    weight: 10,
    icon: UserCheck,
    help: "Capability questions checked alongside the evidence you submit."
  }
];

const levelGuide = [
  { level: 4, range: "80-100", label: "Highly Competent" },
  { level: 3, range: "60-79", label: "Competent" },
  { level: 2, range: "40-59", label: "Partially Competent" },
  { level: 1, range: "0-39", label: "Not Yet Competent" }
];

const priorityOrder = { high: 1, medium: 2, low: 3, none: 4 };
const evidenceSourceMap = new Map(evidenceSources.map((source) => [source.key, source]));

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AssessmentPage() {
  const [domains, setDomains] = useState([]);
  const [domainId, setDomainId] = useState("");
  const [competencies, setCompetencies] = useState([]);
  const [answers, setAnswers] = useState({});
  const [evidence, setEvidence] = useState({});
  const [evidenceLinks, setEvidenceLinks] = useState({});
  const [evidenceFiles, setEvidenceFiles] = useState({});
  const [uploadingEvidence, setUploadingEvidence] = useState({});
  const [remarks, setRemarks] = useState({});
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeCompetencyIndex, setActiveCompetencyIndex] = useState(0);

  useEffect(() => {
    api.get("/domains").then(({ data }) => {
      setDomains(data);
      if (data[0]?._id) setDomainId(data[0]._id);
    });
    api.get("/assessments").then(({ data }) => setHistory(data)).catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    if (!domainId) return;

    api.get(`/competencies/assessment?domainId=${domainId}`).then(({ data }) => {
      setCompetencies(data);
      setAnswers({});
      setEvidence({});
      setEvidenceLinks({});
      setEvidenceFiles({});
      setUploadingEvidence({});
      setRemarks({});
      setResult(null);
      setError("");
      setActiveCompetencyIndex(0);
    });
  }, [domainId]);

  const selectedDomain = useMemo(
    () => domains.find((domain) => domain._id === domainId),
    [domains, domainId]
  );

  const isAnswerSetComplete = (competency) =>
    competency.assessmentReady &&
    competency.assessmentQuestions.length > 0 &&
    competency.assessmentQuestions.every(
      (question) => Boolean(answers[competency._id]?.[question._id])
    );

  const hasEvidence = (competencyId) =>
    Boolean(
      evidence[competencyId]?.trim() ||
        evidenceLinks[competencyId]?.trim() ||
        evidenceFiles[competencyId]?.length
    );

  const isCompetencyComplete = (competency) =>
    isAnswerSetComplete(competency) && hasEvidence(competency._id);

  const completedCount = useMemo(
    () => competencies.filter(isCompetencyComplete).length,
    [competencies, answers, evidence, evidenceLinks, evidenceFiles]
  );

  const completionPercentage = competencies.length
    ? Math.round((completedCount / competencies.length) * 100)
    : 0;

  const totalQuestions = useMemo(
    () =>
      competencies.reduce(
        (total, competency) => total + (competency.assessmentQuestions?.length || 0),
        0
      ),
    [competencies]
  );
  const answeredQuestions = useMemo(
    () =>
      competencies.reduce(
        (total, competency) =>
          total +
          (competency.assessmentQuestions || []).filter(
            (question) => answers[competency._id]?.[question._id]
          ).length,
        0
      ),
    [competencies, answers]
  );
  const questionProgress = totalQuestions
    ? Math.round((answeredQuestions / totalQuestions) * 100)
    : 0;
  const assessmentReady =
    competencies.length > 0 && competencies.every((competency) => competency.assessmentReady);

  const competencyMap = useMemo(
    () => new Map(competencies.map((competency) => [competency._id, competency])),
    [competencies]
  );

  const activeCompetency = competencies[activeCompetencyIndex] || null;
  const activeAnsweredCount = activeCompetency
    ? activeCompetency.assessmentQuestions.filter(
        (question) => answers[activeCompetency._id]?.[question._id]
      ).length
    : 0;
  const activeQuestionCount = activeCompetency?.assessmentQuestions?.length || 0;
  const activeIsComplete = Boolean(
    activeCompetency && isCompetencyComplete(activeCompetency)
  );
  const uploadInProgress = Object.values(uploadingEvidence).some(Boolean);

  const sortedGapItems = useMemo(() => {
    if (!result?.gapAnalysis?.gapItems) return [];
    return [...result.gapAnalysis.gapItems].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || b.gapLevel - a.gapLevel
    );
  }, [result]);

  async function reloadHistory() {
    const { data } = await api.get("/assessments");
    setHistory(data);
  }

  function selectAnswer(competencyId, questionId, optionId) {
    setAnswers((current) => ({
      ...current,
      [competencyId]: { ...current[competencyId], [questionId]: optionId }
    }));
  }

  async function uploadEvidence(competencyId, event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Evidence files must not exceed 5 MB.");
      return;
    }

    setError("");
    setUploadingEvidence((current) => ({ ...current, [competencyId]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/evidence/upload", formData);
      setEvidenceFiles((current) => ({
        ...current,
        [competencyId]: [...(current[competencyId] || []), data.evidence]
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploadingEvidence((current) => ({ ...current, [competencyId]: false }));
    }
  }

  async function removeEvidenceFile(competencyId, evidenceId) {
    setError("");
    try {
      await api.delete(`/evidence/${evidenceId}`);
      setEvidenceFiles((current) => ({
        ...current,
        [competencyId]: (current[competencyId] || []).filter((file) => file.id !== evidenceId)
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function goToCompetency(index) {
    setActiveCompetencyIndex(index);
    setError("");
    window.requestAnimationFrame(() => {
      document.getElementById("competency-workspace")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  function goToNextCompetency() {
    if (!activeCompetency) return;

    if (!isAnswerSetComplete(activeCompetency)) {
      setError("Answer every question for this competency before continuing.");
      return;
    }

    if (
      !evidence[activeCompetency._id]?.trim() &&
      !evidenceLinks[activeCompetency._id]?.trim() &&
      !evidenceFiles[activeCompetency._id]?.length
    ) {
      setError("Upload a file, add an evidence description, or provide an evidence link.");
      return;
    }

    goToCompetency(Math.min(activeCompetencyIndex + 1, competencies.length - 1));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    if (completedCount < competencies.length) {
      setSaving(false);
      setError("Answer every question and provide evidence for each competency before submitting.");
      return;
    }

    const missingEvidence = competencies.find(
      (competency) =>
        !evidence[competency._id]?.trim() &&
        !evidenceLinks[competency._id]?.trim() &&
        !evidenceFiles[competency._id]?.length
    );
    if (missingEvidence) {
      setSaving(false);
      setError(`Upload or describe evidence for "${missingEvidence.title}".`);
      return;
    }

    try {
      const payload = {
        domainId,
        items: competencies.map((competency) => ({
          competencyId: competency._id,
          responses: competency.assessmentQuestions.map((question) => ({
            questionId: question._id,
            optionId: answers[competency._id][question._id]
          })),
          evidence: evidence[competency._id] || "",
          evidenceLink: evidenceLinks[competency._id] || "",
          evidenceIds: (evidenceFiles[competency._id] || []).map((file) => file.id),
          remarks: remarks[competency._id] || ""
        }))
      };

      const { data } = await api.post("/assessments", payload);
      setResult(data);
      await reloadHistory();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack assessment-workspace">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Secure RTB competency assessment</span>
          <h2>Skills Assessment</h2>
          <p>
            Answer structured competency questions and provide evidence. The system calculates
            your score, level, skills gap, and recommendations after submission.
          </p>
        </div>
        <div className="score-pill">{questionProgress}% questions answered</div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <section className="graduate-workflow-bar" aria-label="Graduate assessment workflow">
        {[
          ["1", "Account", "Login complete", true],
          ["2", "Competency area", selectedDomain?.name || "Select a domain", Boolean(domainId)],
          [
            "3",
            "Evidence & assessment",
            `${completedCount} of ${competencies.length} complete`,
            completionPercentage === 100
          ],
          ["4", "Submit data", result ? "Submitted" : "Pending", Boolean(result)],
          ["5", "Report & recommendations", result?.report ? "Ready" : "Generated after submission", Boolean(result?.report)]
        ].map(([number, label, detail, complete]) => (
          <div key={label} className={complete ? "complete" : ""}>
            <span>{complete ? <Check size={15} /> : number}</span>
            <div>
              <strong>{label}</strong>
              <small>{detail}</small>
            </div>
          </div>
        ))}
      </section>

      {result && (
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
                    <article key={item._id || item.competencyId} className="gap-card recommendation-mini">
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
      )}

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
            <select value={domainId} onChange={(event) => setDomainId(event.target.value)}>
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
                {completedCount} of {competencies.length}
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

      <section className="panel scoring-guide-panel">
        <div className="assessment-panel-title">
          <BookOpenCheck size={22} />
          <div>
            <h3>How your result is calculated</h3>
            <p>Your answers are scored privately by the server using administrator-defined rules.</p>
          </div>
        </div>
        <div className="methodology-grid">
          {evidenceSources.map((source) => {
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
          {levelGuide.map((item) => (
            <div key={item.level}>
              <strong>Level {item.level}</strong>
              <span>{item.range}%</span>
              <small>{item.label}</small>
            </div>
          ))}
        </div>
        <div className="algorithm-flow" aria-label="Skills gap analysis algorithm">
          <div className="algorithm-step">
            <span>1</span>
            <strong>Collect evidence</strong>
            <small>Answers and supporting files</small>
          </div>
          <ChevronRight size={18} />
          <div className="algorithm-step">
            <span>2</span>
            <strong>Apply weights</strong>
            <small>Server derives four source scores</small>
          </div>
          <ChevronRight size={18} />
          <div className="algorithm-step">
            <span>3</span>
            <strong>Map RTB level</strong>
            <small>Score becomes Level 1-4</small>
          </div>
          <ChevronRight size={18} />
          <div className="algorithm-step">
            <span>4</span>
            <strong>Calculate gap</strong>
            <small>Required level - achieved level</small>
          </div>
          <ChevronRight size={18} />
          <div className="algorithm-step">
            <span>5</span>
            <strong>Recommend action</strong>
            <small>No, low, moderate, or high gap</small>
          </div>
        </div>
      </section>

      <form className="panel form-panel professional-assessment-form" onSubmit={handleSubmit}>
        <div className="assessment-form-head">
          <div>
            <h3>Competency evidence worksheet</h3>
            <p>
              Choose the answer that matches your demonstrated work. You cannot enter or alter
              scores; the system evaluates every response using the RTB question bank.
            </p>
          </div>
          <div className="assessment-count-chip">{competencies.length} competencies</div>
        </div>

        <div className="assessment-notice">
          <Info size={18} />
          <span>
            Answer honestly and attach verifiable evidence. Option points and final calculations
            are protected on the server and shown only after submission.
          </span>
        </div>

        {!assessmentReady && competencies.length > 0 && (
          <div className="alert error">
            This domain is not ready for assessment. An administrator must complete the question
            bank for every active RTB competency.
          </div>
        )}

        {competencies.length > 0 && (
          <div className="competency-navigator">
            <div>
              <Layers3 size={19} />
              <span>
                <strong>Competency {activeCompetencyIndex + 1}</strong>
                <small>Choose a step to review or continue your work.</small>
              </span>
            </div>
            <div className="competency-step-list">
              {competencies.map((competency, index) => {
                const complete = isCompetencyComplete(competency);
                return (
                  <button
                    key={competency._id}
                    type="button"
                    className={[
                      index === activeCompetencyIndex ? "active" : "",
                      complete ? "complete" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => goToCompetency(index)}
                    aria-label={`Open competency ${index + 1}: ${competency.title}`}
                  >
                    {complete ? <Check size={16} /> : <span>{index + 1}</span>}
                    <small>{competency.title}</small>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div id="competency-workspace" className="assessment-list professional-assessment-list">
          {activeCompetency && (
            <article className="assessment-item professional-assessment-item guided-assessment-item">
              <div className="competency-main">
                <div className="competency-title-row">
                  <span className="competency-number">{activeCompetencyIndex + 1}</span>
                  <div>
                    <span className="eyebrow">
                      Competency {activeCompetencyIndex + 1} of {competencies.length}
                    </span>
                    <h4>{activeCompetency.title}</h4>
                    <p>{activeCompetency.description}</p>
                  </div>
                </div>

                <div className="competency-meta">
                  <span>
                    <b>Category</b>
                    {activeCompetency.category || "General ICT"}
                  </span>
                  <span>
                    <b>RTB reference</b>
                    {activeCompetency.rtbReference}
                  </span>
                  <span>
                    <b>Required</b>
                    Level {activeCompetency.requiredLevel}
                  </span>
                  <span>
                    <b>Version</b>
                    {activeCompetency.version || "1.0"}
                  </span>
                </div>

                {activeCompetency.evidenceExamples?.length > 0 && (
                  <div className="evidence-examples">
                    <strong>Accepted evidence examples</strong>
                    <p>{activeCompetency.evidenceExamples.join(", ")}</p>
                  </div>
                )}

                <div className="field-section-heading">
                  <div>
                    <BrainCircuit size={19} />
                    <span>
                      <strong>Complete system-scored questions</strong>
                      <small>Select one answer for each question. Scores remain hidden.</small>
                    </span>
                  </div>
                  <span
                    className={
                      activeQuestionCount > 0 && activeAnsweredCount === activeQuestionCount
                        ? "ready"
                        : "pending"
                    }
                  >
                    {activeAnsweredCount} of {activeQuestionCount} answered
                  </span>
                </div>

                <div className="assessment-question-list">
                  {activeCompetency.assessmentQuestions.map((question, questionIndex) => {
                    const source = evidenceSourceMap.get(question.source);
                    const SourceIcon = source?.icon || ClipboardCheck;
                    const selectedOptionId =
                      answers[activeCompetency._id]?.[question._id] || "";

                    return (
                      <fieldset className="assessment-question" key={question._id}>
                        <legend>
                          <span>{questionIndex + 1}</span>
                          <span>
                            <small>
                              <SourceIcon size={15} />
                              {source?.label || question.source} - {source?.weight || 0}% weight
                            </small>
                            <strong>{question.prompt}</strong>
                          </span>
                        </legend>
                        <div className="assessment-option-list">
                          {question.options.map((option) => {
                            const selected = selectedOptionId === option._id;
                            return (
                              <label
                                key={option._id}
                                className={`assessment-option ${selected ? "selected" : ""}`}
                              >
                                <input
                                  type="radio"
                                  name={`${activeCompetency._id}-${question._id}`}
                                  value={option._id}
                                  checked={selected}
                                  onChange={() =>
                                    selectAnswer(
                                      activeCompetency._id,
                                      question._id,
                                      option._id
                                    )
                                  }
                                />
                                <span className="option-control">
                                  {selected ? <Check size={14} /> : null}
                                </span>
                                <span>{option.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    );
                  })}
                </div>

                <div className="evidence-details-grid">
                  <div className="evidence-upload-section full-span">
                    <div>
                      <FileUp size={19} />
                      <span>
                        <strong>Upload supporting evidence</strong>
                        <small>PDF, Word, PNG, JPEG, or WebP. Maximum 5 MB per file.</small>
                      </span>
                    </div>
                    <label className="evidence-upload-button">
                      {uploadingEvidence[activeCompetency._id] ? (
                        <LoaderCircle className="spin" size={17} />
                      ) : (
                        <FileUp size={17} />
                      )}
                      {uploadingEvidence[activeCompetency._id] ? "Uploading..." : "Choose evidence file"}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                        disabled={
                          uploadingEvidence[activeCompetency._id] ||
                          (evidenceFiles[activeCompetency._id]?.length || 0) >= 5
                        }
                        onChange={(event) => uploadEvidence(activeCompetency._id, event)}
                      />
                    </label>
                    {(evidenceFiles[activeCompetency._id] || []).length > 0 && (
                      <div className="uploaded-evidence-list">
                        {evidenceFiles[activeCompetency._id].map((file) => (
                          <div key={file.id}>
                            <Paperclip size={16} />
                            <span>
                              <strong>{file.originalName}</strong>
                              <small>{formatFileSize(file.size)}</small>
                            </span>
                            <button
                              type="button"
                              title="Remove uploaded evidence"
                              aria-label={`Remove ${file.originalName}`}
                              onClick={() => removeEvidenceFile(activeCompetency._id, file.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <label>
                    Evidence description (optional when a file is uploaded)
                    <textarea
                      value={evidence[activeCompetency._id] || ""}
                      onChange={(event) =>
                        setEvidence({ ...evidence, [activeCompetency._id]: event.target.value })
                      }
                      placeholder="Describe the project, practical task, certificate, module result, or supervisor feedback."
                    />
                  </label>

                  <label>
                    <span className="label-with-icon">
                      <LinkIcon size={15} />
                      Evidence link (optional when a file is uploaded)
                    </span>
                    <input
                      type="url"
                      value={evidenceLinks[activeCompetency._id] || ""}
                      onChange={(event) =>
                        setEvidenceLinks({
                          ...evidenceLinks,
                          [activeCompetency._id]: event.target.value
                        })
                      }
                      placeholder="https://github.com/... or certificate URL"
                    />
                  </label>

                  <label className="full-span">
                    Improvement notes (optional)
                    <textarea
                      value={remarks[activeCompetency._id] || ""}
                      onChange={(event) =>
                        setRemarks({ ...remarks, [activeCompetency._id]: event.target.value })
                      }
                      placeholder="Note any tasks you still need to practice or evidence you need to obtain."
                    />
                  </label>
                </div>
              </div>

              <aside className="competency-side live-algorithm-panel">
                <div className="live-algorithm-head">
                  <ShieldCheck size={20} />
                  <div>
                    <strong>Protected system evaluation</strong>
                    <span>Your browser never receives option points or calculates your result.</span>
                  </div>
                </div>

                <div className="formula-total">
                  <span>Question progress</span>
                  <strong>
                    {activeAnsweredCount}/{activeQuestionCount}
                  </strong>
                </div>

                <div className="algorithm-result-stack">
                  <div className={activeAnsweredCount === activeQuestionCount ? "resolved" : ""}>
                    <span>1</span>
                    <div>
                      <small>Validate responses</small>
                      <strong>All questions must be answered exactly once</strong>
                    </div>
                  </div>
                  <div>
                    <span>2</span>
                    <div>
                      <small>Calculate competency score</small>
                      <strong>Private option points and 40/30/20/10 weights</strong>
                    </div>
                  </div>
                  <div>
                    <span>3</span>
                    <div>
                      <small>Generate result</small>
                      <strong>RTB level, gap class, recommendations, and report</strong>
                    </div>
                  </div>
                </div>

                <div className={`competency-completion-state ${activeIsComplete ? "complete" : ""}`}>
                  {activeIsComplete ? <Check size={18} /> : <Circle size={18} />}
                  <span>
                    <strong>{activeIsComplete ? "Competency complete" : "Still to complete"}</strong>
                    <small>
                      {activeIsComplete
                        ? "You can continue to the next competency."
                        : "Answer every question and add supporting evidence."}
                    </small>
                  </span>
                </div>
              </aside>
            </article>
          )}

          {!competencies.length && (
            <div className="empty-assessment-state">
              <AlertCircle size={24} />
              <p>No active RTB competency standards are available for this ICT domain yet.</p>
            </div>
          )}
        </div>

        {competencies.length > 0 && (
          <div className="competency-navigation-actions">
            <button
              className="secondary-button button-with-icon"
              type="button"
              disabled={activeCompetencyIndex === 0}
              onClick={() => goToCompetency(activeCompetencyIndex - 1)}
            >
              <ChevronLeft size={17} />
              Previous
            </button>
            <span>
              {activeIsComplete ? <Check size={16} /> : <Circle size={16} />}
              {activeIsComplete ? "Ready to continue" : "Complete this competency to continue"}
            </span>
            {activeCompetencyIndex < competencies.length - 1 && (
              <button
                className="primary-button fit button-with-icon"
                type="button"
                onClick={goToNextCompetency}
              >
                Next competency
                <ChevronRight size={17} />
              </button>
            )}
          </div>
        )}

        <div className="assessment-submit-row">
          <div>
            <strong>{completionPercentage}% complete</strong>
            <p>The calculation and competency mapping will be verified again by the server.</p>
          </div>
          <button
            className="primary-button fit"
            type="submit"
            disabled={
              saving ||
              uploadInProgress ||
              !assessmentReady ||
              !competencies.length ||
              completedCount < competencies.length
            }
          >
            {saving ? "Calculating competency gaps..." : "Submit and generate gap analysis"}
          </button>
        </div>
      </form>
    </div>
  );
}
