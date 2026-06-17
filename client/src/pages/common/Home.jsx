import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/images/home-hero.webp";
import { useAuth } from "../../context/AuthContext.jsx";

const roleCards = [
  {
    title: "Graduates",
    text: "Complete ICT competency assessments, view personal gaps, and follow recommended improvement actions.",
    icon: ClipboardCheck
  },
  {
    title: "Institutional",
    text: "Monitor graduate readiness, review assessment activity, and understand program-level skill needs.",
    icon: Users
  },
  {
    title: "Admin",
    text: "Manage users, RTB-aligned competencies, ICT domains, reports, notifications, and system data.",
    icon: ShieldCheck
  }
];

const workflowItems = [
  "Create the right account type",
  "Select an ICT domain",
  "Assess skills against RTB-aligned competencies",
  "Generate gap analysis and recommendations",
  "Track progress through dashboards and reports"
];

const footerLinks = [
  { label: "Create account", to: "/register" },
  { label: "Sign in", to: "/login" },
  { label: "Dashboard", to: "/dashboard" }
];

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="home-page">
      <section className="home-hero">
        <img src={heroImage} alt="ICT graduates reviewing skills analytics in a training lab" />
        <div className="home-overlay" />

        <nav className="home-nav" aria-label="Homepage navigation">
          <Link className="home-brand" to="/">
            <span>SG</span>
            <strong>Skills Gap</strong>
          </Link>
          <div className="home-nav-actions">
            <Link to="/login">Sign in</Link>
            <Link className="home-nav-button" to={isAuthenticated ? "/dashboard" : "/register"}>
              {isAuthenticated ? "Dashboard" : "Create account"}
            </Link>
          </div>
        </nav>

        <div className="home-hero-content">
          <span className="home-kicker">Kicukiro District ICT TVET</span>
          <h1>Skills Gap Analysis Tool</h1>
          <p>
            A web-based platform for assessing graduate ICT competencies, comparing them with
            RTB-aligned standards, and generating practical improvement recommendations.
          </p>
          <div className="home-actions">
            <Link className="home-primary" to={isAuthenticated ? "/dashboard" : "/register"}>
              {isAuthenticated ? "Go to dashboard" : "Get started"}
              <ArrowRight size={18} />
            </Link>
            <Link className="home-secondary" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="home-band">
        <div className="home-section-heading">
          <span>System coverage</span>
          <h2>Built for graduates, TVET institutions, and administrators</h2>
        </div>

        <div className="home-role-grid">
          {roleCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="home-role-card">
                <Icon size={24} />
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="home-band home-band-muted">
        <div className="home-feature-layout">
          <div>
            <span className="home-kicker dark">How it works</span>
            <h2>From assessment to evidence-based action</h2>
            <p>
              The system keeps RTB competencies configurable, stores assessment history, calculates
              gaps, and turns weak competency areas into prioritized recommendations.
            </p>
          </div>

          <ol className="home-workflow">
            {workflowItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-band">
        <div className="home-metrics">
          <div>
            <BarChart3 size={26} />
            <strong>Dashboards</strong>
            <span>Role-based analytics for decision-making</span>
          </div>
          <div>
            <FileText size={26} />
            <strong>Reports</strong>
            <span>Graduate reports with CSV and PDF export</span>
          </div>
          <div>
            <ShieldCheck size={26} />
            <strong>Secure access</strong>
            <span>JWT authentication and role-based authorization</span>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-main">
          <div className="home-footer-brand">
            <Link className="home-brand footer-brand" to="/">
              <span>SG</span>
              <strong>Skills Gap</strong>
            </Link>
            <p>
              Supporting ICT graduate readiness through competency assessment, gap analysis,
              recommendations, and reporting for TVET stakeholders.
            </p>
          </div>

          <div className="home-footer-column">
            <h3>Access</h3>
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="home-footer-column">
            <h3>Users</h3>
            <span>Graduates</span>
            <span>Institutional users</span>
            <span>System administrators</span>
          </div>

        </div>

        <div className="home-footer-bottom">
          <span>Skills Gap Analysis Tool for TVET ICT Graduates</span>
          <span>RTB-aligned competency evaluation</span>
        </div>
      </footer>
    </main>
  );
}
