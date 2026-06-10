import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  BookOpenCheck,
  Building2,
  FileBadge2,
  ListChecks,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2
} from "lucide-react";
import { api, getErrorMessage } from "../services/api.js";

const questionSources = {
  practical: { label: "Practical assessment", weight: 40 },
  portfolio: { label: "Portfolio evidence", weight: 30 },
  academic: { label: "Academic record", weight: 20 },
  selfAssessment: { label: "Self-assessment", weight: 10 }
};

const starterOptions = {
  practical: [
    ["No demonstrated practical task", 0],
    ["Basic task completed with continuous guidance", 40],
    ["Standard task completed independently", 70],
    ["Complex task completed independently and verified", 100]
  ],
  portfolio: [
    ["No portfolio artifact", 0],
    ["Incomplete or unverified artifact", 40],
    ["Complete artifact demonstrating the outcome", 70],
    ["Multiple verified artifacts with feedback", 100]
  ],
  academic: [
    ["No relevant academic record", 0],
    ["Result below the pass requirement", 30],
    ["Passed relevant module with supporting record", 60],
    ["Strong verified result in the relevant module", 90]
  ],
  selfAssessment: [
    ["Cannot yet explain or perform the competency", 0],
    ["Understands concepts but needs guidance", 40],
    ["Performs routine tasks independently", 70],
    ["Solves complex tasks and can guide others", 100]
  ]
};

function makeQuestion(source, order, title = "this competency") {
  return {
    source,
    prompt: `Which statement best describes your verified ${questionSources[
      source
    ].label.toLowerCase()} for "${title || "this competency"}"?`,
    order,
    isActive: true,
    options: starterOptions[source].map(([label, score]) => ({ label, score }))
  };
}

function makeQuestionBank(title) {
  return Object.keys(questionSources).map((source, index) =>
    makeQuestion(source, index, title)
  );
}

function createEmptyForm(domainId = "") {
  return {
    domainId,
    title: "",
    category: "programming",
    requiredLevel: 3,
    rtbReference: "",
    version: "1.0",
    effectiveDate: new Date().toISOString().slice(0, 10),
    standardStatus: "active",
    description: "",
    evidenceExamplesText: "",
    recommendationGuidance: "",
    assessmentQuestions: makeQuestionBank("")
  };
}

const levelLabels = {
  1: "Not Yet Competent",
  2: "Partially Competent",
  3: "Competent",
  4: "Highly Competent"
};

export function CompetenciesPage() {
  const [domains, setDomains] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [domainForm, setDomainForm] = useState({ name: "", description: "" });
  const [form, setForm] = useState(createEmptyForm());
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [domainError, setDomainError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [domainRes, competencyRes] = await Promise.all([
      api.get("/domains"),
      api.get("/competencies/manage")
    ]);
    setDomains(domainRes.data);
    setCompetencies(competencyRes.data);
    setForm((current) => ({
      ...current,
      domainId: domainRes.data.some((domain) => domain._id === current.domainId)
        ? current.domainId
        : domainRes.data[0]?._id || ""
    }));
  }

  useEffect(() => {
    load();
  }, []);

  const standardStats = useMemo(
    () => ({
      total: competencies.length,
      domains: new Set(competencies.map((item) => item.domainId?._id)).size,
      ready: competencies.filter((item) => {
        const sources = new Set(
          (item.assessmentQuestions || [])
            .filter((question) => question.isActive !== false)
            .map((question) => question.source)
        );
        return Object.keys(questionSources).every((source) => sources.has(source));
      }).length
    }),
    [competencies]
  );

  function resetForm(domainId = form.domainId) {
    setEditingId("");
    setForm(createEmptyForm(domainId));
    setError("");
  }

  function editStandard(competency) {
    setEditingId(competency._id);
    setForm({
      domainId: competency.domainId?._id || competency.domainId,
      title: competency.title || "",
      category: competency.category || "",
      requiredLevel: competency.requiredLevel || 3,
      rtbReference: competency.rtbReference || "",
      version: competency.version || "1.0",
      effectiveDate: competency.effectiveDate
        ? new Date(competency.effectiveDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      standardStatus: competency.standardStatus || "active",
      description: competency.description || "",
      evidenceExamplesText: (competency.evidenceExamples || []).join("\n"),
      recommendationGuidance: competency.recommendationGuidance || "",
      assessmentQuestions:
        competency.assessmentQuestions?.length > 0
          ? competency.assessmentQuestions.map((question) => ({
              ...question,
              options: question.options.map((option) => ({ ...option }))
            }))
          : makeQuestionBank(competency.title)
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 380, behavior: "smooth" });
  }

  async function handleDomainSubmit(event) {
    event.preventDefault();
    setDomainError("");
    setMessage("");

    try {
      const { data } = await api.post("/domains", domainForm);
      setDomainForm({ name: "", description: "" });
      setMessage(`ICT domain "${data.name}" was added successfully.`);
      await load();
      setForm((current) => ({ ...current, domainId: data._id }));
    } catch (err) {
      setDomainError(getErrorMessage(err));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.domainId) {
      setError("Create or select an ICT domain before saving a competency standard.");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      evidenceExamples: form.evidenceExamplesText
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
    };
    delete payload.evidenceExamplesText;

    try {
      const { data } = editingId
        ? await api.patch(`/competencies/${editingId}`, payload)
        : await api.post("/competencies", payload);
      setMessage(data.message);
      resetForm(payload.domainId);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function archive(competency) {
    const confirmed = window.confirm(
      `Archive "${competency.title}"? It will no longer appear in new graduate assessments.`
    );
    if (!confirmed) return;

    try {
      const { data } = await api.delete(`/competencies/${competency._id}`);
      setMessage(data.message);
      if (editingId === competency._id) resetForm();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function updateQuestion(questionIndex, field, value) {
    setForm((current) => ({
      ...current,
      assessmentQuestions: current.assessmentQuestions.map((question, index) =>
        index === questionIndex ? { ...question, [field]: value } : question
      )
    }));
  }

  function updateOption(questionIndex, optionIndex, field, value) {
    setForm((current) => ({
      ...current,
      assessmentQuestions: current.assessmentQuestions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex
                  ? {
                      ...option,
                      [field]: field === "score" ? Number(value) : value
                    }
                  : option
              )
            }
          : question
      )
    }));
  }

  function addQuestion(source = "practical") {
    setForm((current) => ({
      ...current,
      assessmentQuestions: [
        ...current.assessmentQuestions,
        makeQuestion(source, current.assessmentQuestions.length, current.title)
      ]
    }));
  }

  function removeQuestion(questionIndex) {
    const question = form.assessmentQuestions[questionIndex];
    const sourceCount = form.assessmentQuestions.filter(
      (item) => item.source === question.source && item.isActive !== false
    ).length;
    if (sourceCount <= 1) {
      setError(`Keep at least one ${questionSources[question.source].label} question.`);
      return;
    }

    setForm((current) => ({
      ...current,
      assessmentQuestions: current.assessmentQuestions.filter(
        (_question, index) => index !== questionIndex
      )
    }));
  }

  return (
    <div className="page-stack standards-workspace">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Authoritative reference catalogue</span>
          <h2>RTB Standards Management</h2>
          <p>
            Define the occupational competencies, evidence expectations, and required levels used
            by the mapping and skills gap analysis engine.
          </p>
        </div>
        <div className="standards-status">
          <ShieldCheck size={18} />
          Active standards only
        </div>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="metrics-grid">
        <div className="metric-card">
          <span>Active standards</span>
          <strong>{standardStats.total}</strong>
        </div>
        <div className="metric-card metric-success">
          <span>ICT domains covered</span>
          <strong>{standardStats.domains}</strong>
        </div>
        <div className="metric-card metric-warning">
          <span>Assessment-ready</span>
          <strong>
            {standardStats.ready}/{standardStats.total}
          </strong>
        </div>
      </div>

      <section className="panel form-panel domain-management-panel">
        <div className="section-heading compact-heading">
          <div className="heading-with-icon">
            <Building2 size={22} />
            <div>
              <h3>ICT Occupational Domains</h3>
              <p>Create a domain before registering its competency standards.</p>
            </div>
          </div>
        </div>

        {domainError && <div className="alert error">{domainError}</div>}

        <form className="form-grid domain-form-grid" onSubmit={handleDomainSubmit}>
          <label>
            Domain name
            <input
              value={domainForm.name}
              onChange={(event) => setDomainForm({ ...domainForm, name: event.target.value })}
              placeholder="Example: Software Development"
              required
            />
          </label>
          <label>
            Scope and description
            <input
              value={domainForm.description}
              onChange={(event) => setDomainForm({ ...domainForm, description: event.target.value })}
              placeholder="Programming, testing, deployment, and delivery practices"
              required
            />
          </label>
          <button className="secondary-button fit button-with-icon" type="submit">
            <Plus size={17} />
            Add domain
          </button>
        </form>

        <div className="domain-chip-list" aria-label="Available ICT domains">
          {domains.map((domain) => (
            <button
              key={domain._id}
              type="button"
              className={form.domainId === domain._id ? "active" : ""}
              onClick={() => setForm({ ...form, domainId: domain._id })}
            >
              {domain.name}
            </button>
          ))}
          {!domains.length && <p className="muted">No ICT domains have been registered.</p>}
        </div>
      </section>

      <form className="panel form-panel standard-editor" onSubmit={handleSubmit}>
        <div className="section-heading compact-heading">
          <div className="heading-with-icon">
            <FileBadge2 size={22} />
            <div>
              <h3>{editingId ? "Update Competency Standard" : "Register Competency Standard"}</h3>
              <p>
                These fields become the reference snapshot stored with every graduate assessment.
              </p>
            </div>
          </div>
          {editingId && (
            <button className="text-button button-with-icon" type="button" onClick={() => resetForm()}>
              <RotateCcw size={16} />
              Cancel edit
            </button>
          )}
        </div>

        <div className="form-grid two">
          <label>
            ICT domain
            <select
              value={form.domainId}
              onChange={(event) => setForm({ ...form, domainId: event.target.value })}
              disabled={!domains.length}
              required
            >
              <option value="">{domains.length ? "Select a domain" : "Create a domain first"}</option>
              {domains.map((domain) => (
                <option key={domain._id} value={domain._id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            RTB reference code
            <input
              value={form.rtbReference}
              onChange={(event) => setForm({ ...form, rtbReference: event.target.value.toUpperCase() })}
              placeholder="Example: RTB-ICT-SD-02"
              required
            />
          </label>
          <label>
            Competency title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Example: Web application development"
              required
            />
          </label>
          <label>
            Category
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            >
              <option value="programming">Programming</option>
              <option value="database">Database</option>
              <option value="networking">Networking</option>
              <option value="cybersecurity">Cybersecurity</option>
              <option value="support">ICT support</option>
              <option value="general">General ICT</option>
            </select>
          </label>
          <label>
            Required RTB level
            <select
              value={form.requiredLevel}
              onChange={(event) => setForm({ ...form, requiredLevel: Number(event.target.value) })}
            >
              {Object.entries(levelLabels).map(([level, label]) => (
                <option key={level} value={level}>
                  Level {level} - {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Standard status
            <select value={form.standardStatus} disabled>
              <option value="active">Active</option>
            </select>
          </label>
          <label>
            Version
            <input
              value={form.version}
              onChange={(event) => setForm({ ...form, version: event.target.value })}
              placeholder="1.0"
              required
            />
          </label>
          <label>
            Effective date
            <input
              type="date"
              value={form.effectiveDate}
              onChange={(event) => setForm({ ...form, effectiveDate: event.target.value })}
              required
            />
          </label>
          <label className="full-span">
            Competency description
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Describe the observable knowledge, skills, and tasks the graduate must demonstrate."
              required
            />
          </label>
          <label>
            Accepted evidence examples
            <textarea
              value={form.evidenceExamplesText}
              onChange={(event) => setForm({ ...form, evidenceExamplesText: event.target.value })}
              placeholder={"One item per line, for example:\nResponsive portfolio project\nPractical lab task\nSupervisor validation"}
            />
          </label>
          <label>
            Recommendation guidance
            <textarea
              value={form.recommendationGuidance}
              onChange={(event) => setForm({ ...form, recommendationGuidance: event.target.value })}
              placeholder="Optional standard-specific advice shown when a graduate has a gap."
            />
          </label>
        </div>

        <section className="question-bank-editor">
          <div className="section-heading compact-heading">
            <div className="heading-with-icon">
              <ListChecks size={22} />
              <div>
                <h3>System Scoring Question Bank</h3>
                <p>
                  Graduates see prompts and answer labels only. Point values are private and used
                  by the server to calculate the four weighted source scores.
                </p>
              </div>
            </div>
            <button
              className="secondary-button fit button-with-icon"
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  assessmentQuestions: makeQuestionBank(current.title)
                }))
              }
            >
              <RotateCcw size={16} />
              Reset starter bank
            </button>
          </div>

          <div className="question-source-summary">
            {Object.entries(questionSources).map(([key, source]) => (
              <span key={key}>
                <strong>{source.weight}%</strong>
                {source.label}
                <small>
                  {
                    form.assessmentQuestions.filter(
                      (question) => question.source === key
                    ).length
                  }{" "}
                  question(s)
                </small>
              </span>
            ))}
          </div>

          <div className="admin-question-list">
            {form.assessmentQuestions.map((question, questionIndex) => (
              <article className="admin-question-card" key={question._id || questionIndex}>
                <header>
                  <span>{questionIndex + 1}</span>
                  <div>
                    <strong>{questionSources[question.source]?.label}</strong>
                    <small>{questionSources[question.source]?.weight}% source weight</small>
                  </div>
                  <button
                    type="button"
                    title="Remove question"
                    aria-label={`Remove question ${questionIndex + 1}`}
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    <Trash2 size={16} />
                  </button>
                </header>

                <div className="form-grid two">
                  <label>
                    Evidence source
                    <select
                      value={question.source}
                      onChange={(event) =>
                        updateQuestion(questionIndex, "source", event.target.value)
                      }
                    >
                      {Object.entries(questionSources).map(([key, source]) => (
                        <option key={key} value={key}>
                          {source.label} ({source.weight}%)
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Question order
                    <input
                      type="number"
                      min="0"
                      value={question.order ?? questionIndex}
                      onChange={(event) =>
                        updateQuestion(questionIndex, "order", Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="full-span">
                    Question prompt
                    <textarea
                      value={question.prompt}
                      onChange={(event) =>
                        updateQuestion(questionIndex, "prompt", event.target.value)
                      }
                      required
                    />
                  </label>
                </div>

                <div className="admin-option-grid">
                  <div className="admin-option-head">
                    <span>Answer shown to graduate</span>
                    <span>Private points</span>
                  </div>
                  {question.options.map((option, optionIndex) => (
                    <div className="admin-option-row" key={option._id || optionIndex}>
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                      <input
                        value={option.label}
                        onChange={(event) =>
                          updateOption(questionIndex, optionIndex, "label", event.target.value)
                        }
                        aria-label={`Answer ${optionIndex + 1} for question ${questionIndex + 1}`}
                        required
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={option.score}
                        onChange={(event) =>
                          updateOption(questionIndex, optionIndex, "score", event.target.value)
                        }
                        aria-label={`Private points for answer ${optionIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <button
            className="secondary-button fit button-with-icon"
            type="button"
            onClick={() => addQuestion()}
          >
            <Plus size={17} />
            Add another question
          </button>
        </section>

        <div className="standard-editor-actions">
          <span>
            <BookOpenCheck size={17} />
            Required levels use the proposal's Level 1-4 competency model.
          </span>
          <button className="primary-button fit button-with-icon" type="submit" disabled={!domains.length || saving}>
            {editingId ? <Pencil size={17} /> : <Plus size={17} />}
            {saving ? "Saving standard..." : editingId ? "Update standard" : "Add competency standard"}
          </button>
        </div>
      </form>

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
                    <small className="table-subtext">{levelLabels[competency.requiredLevel]}</small>
                  </td>
                  <td>{competency.version || "1.0"}</td>
                  <td>
                    <span className="tag tag-none">{competency.standardStatus || "active"}</span>
                  </td>
                  <td>
                    <strong>{competency.assessmentQuestions?.length || 0} questions</strong>
                    <small className="table-subtext">
                      {Object.keys(questionSources).every((source) =>
                        (competency.assessmentQuestions || []).some(
                          (question) => question.source === source
                        )
                      )
                        ? "Ready for assessment"
                        : "Needs configuration"}
                    </small>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="text-button button-with-icon"
                        type="button"
                        onClick={() => editStandard(competency)}
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        className="text-button danger button-with-icon"
                        type="button"
                        onClick={() => archive(competency)}
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
    </div>
  );
}
