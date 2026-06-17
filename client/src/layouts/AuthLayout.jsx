export function AuthLayout({ title, description, children }) {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <span className="logo-mark">SG</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        {children}
      </section>
    </main>
  );
}
