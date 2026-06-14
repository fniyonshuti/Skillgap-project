import { Building2, Plus } from "lucide-react";

export function DomainManagementPanel({
  domains,
  selectedDomainId,
  domainForm,
  domainError,
  onDomainFormChange,
  onDomainSubmit,
  onDomainSelect
}) {
  return (
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

      <form className="form-grid domain-form-grid" onSubmit={onDomainSubmit}>
        <label>
          Domain name
          <input
            value={domainForm.name}
            onChange={(event) => onDomainFormChange({ ...domainForm, name: event.target.value })}
            placeholder="Example: Software Development"
            required
          />
        </label>
        <label>
          Scope and description
          <input
            value={domainForm.description}
            onChange={(event) =>
              onDomainFormChange({ ...domainForm, description: event.target.value })
            }
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
            className={selectedDomainId === domain._id ? "active" : ""}
            onClick={() => onDomainSelect(domain._id)}
          >
            {domain.name}
          </button>
        ))}
        {!domains.length && <p className="muted">No ICT domains have been registered.</p>}
      </div>
    </section>
  );
}
