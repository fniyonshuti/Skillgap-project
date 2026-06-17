import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BrainCircuit,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Circle,
  FileUp,
  Info,
  Link as LinkIcon,
  Layers3,
  LoaderCircle,
  Paperclip,
  ShieldCheck,
  Trash2
} from "lucide-react";
import {
  EVIDENCE_SOURCE_MAP,
  GAP_PRIORITY_ORDER
} from "../../features/assessments/assessmentConfig.js";
import { AssessmentOverview } from "../../features/assessments/components/AssessmentOverview.jsx";
import { AssessmentResult } from "../../features/assessments/components/AssessmentResult.jsx";
import { AssessmentScoringGuide } from "../../features/assessments/components/AssessmentScoringGuide.jsx";
import {
  buildAssessmentPayload,
  formatFileSize,
  isAnswerSetComplete,
  isCompetencyComplete
} from "../../features/assessments/assessmentUtils.js";
import { api, getErrorMessage } from "../../services/api.js";

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
    api
      .get("/domains")
      .then(({ data }) => {
        setDomains(data);
        if (data[0]?._id) setDomainId(data[0]._id);
      })
      .catch((err) => setError(getErrorMessage(err)));
    api.get("/assessments").then(({ data }) => setHistory(data)).catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    if (!domainId) return;

    api
      .get(`/competencies/assessment?domainId=${domainId}`)
      .then(({ data }) => {
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
      })
      .catch((err) => {
        setCompetencies([]);
        setError(getErrorMessage(err));
      });
  }, [domainId]);

  const selectedDomain = useMemo(
    () => domains.find((domain) => domain._id === domainId),
    [domains, domainId]
  );

  const answerSetIsComplete = (competency) => isAnswerSetComplete(competency, answers);
  const competencyIsComplete = (competency) =>
    isCompetencyComplete(
      competency,
      answers,
      evidence,
      evidenceLinks,
      evidenceFiles
    );

  const completedCount = useMemo(
    () => competencies.filter(competencyIsComplete).length,
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
    activeCompetency && competencyIsComplete(activeCompetency)
  );
  const uploadInProgress = Object.values(uploadingEvidence).some(Boolean);

  const sortedGapItems = useMemo(() => {
    if (!result?.gapAnalysis?.gapItems) return [];
    return [...result.gapAnalysis.gapItems].sort(
      (a, b) =>
        GAP_PRIORITY_ORDER[a.priority] - GAP_PRIORITY_ORDER[b.priority] ||
        b.gapLevel - a.gapLevel
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

    if (!answerSetIsComplete(activeCompetency)) {
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
      const payload = buildAssessmentPayload({
        domainId,
        competencies,
        answers,
        evidence,
        evidenceLinks,
        evidenceFiles,
        remarks
      });

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

      <AssessmentResult
        result={result}
        sortedGapItems={sortedGapItems}
        competencyMap={competencyMap}
      />

      <AssessmentOverview
        domains={domains}
        domainId={domainId}
        onDomainChange={setDomainId}
        selectedDomain={selectedDomain}
        completionPercentage={completionPercentage}
        completedCount={completedCount}
        competencyCount={competencies.length}
        history={history}
      />

      <AssessmentScoringGuide />

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
                const complete = competencyIsComplete(competency);
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
                    const source = EVIDENCE_SOURCE_MAP.get(question.source);
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
