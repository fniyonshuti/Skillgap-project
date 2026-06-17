export function Loader({ label = "Loading..." }) {
  return (
    <div className="screen-center" role="status" aria-live="polite">
      <span className="loader-dot" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
