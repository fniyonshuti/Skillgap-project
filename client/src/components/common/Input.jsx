export function Input({ description, error, label, ...inputProps }) {
  return (
    <label>
      {label}
      <input {...inputProps} />
      {description && <small>{description}</small>}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
