import {
  BarChart3,
  Bell,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Map,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    description: "Overview and analytics",
    icon: LayoutDashboard,
    section: "Workspace",
    roles: ["graduate", "institution", "admin"]
  },
  {
    to: "/assessment",
    label: "Assessment",
    description: "Test ICT skills",
    icon: ClipboardCheck,
    section: "Graduate",
    roles: ["graduate"]
  },
  {
    to: "/recommendations",
    label: "Recommendations",
    description: "Improvement actions",
    icon: ShieldCheck,
    section: "Workspace",
    roles: ["graduate", "institution", "admin"]
  },
  {
    to: "/reports",
    label: "Reports",
    description: "Export analysis",
    icon: FileText,
    section: "Graduate",
    roles: ["graduate"]
  },
  {
    to: "/graduates",
    label: "Graduates",
    description: "Manage graduate records",
    icon: GraduationCap,
    section: "Management",
    roles: ["institution", "admin"]
  },
  {
    to: "/competencies",
    label: "Competencies",
    description: "RTB standards",
    icon: BarChart3,
    section: "Management",
    roles: ["admin"]
  },
  {
    to: "/notifications",
    label: "Notifications",
    description: "System updates",
    icon: Bell,
    section: "Workspace",
    roles: ["graduate", "institution", "admin"]
  },
  {
    to: "/profile",
    label: "Profile",
    description: "Graduate details",
    icon: UserRound,
    section: "Account",
    roles: ["graduate"]
  }
];

const roleLabels = {
  graduate: "Graduate",
  institution: "Institutional",
  admin: "Admin"
};

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));
  const currentItem =
    visibleItems.find((item) => item.to === location.pathname) ||
    visibleItems.find((item) => location.pathname.startsWith(item.to) && item.to !== "/dashboard") ||
    visibleItems[0];
  const groupedItems = visibleItems.reduce((groups, item) => {
    const existing = groups[item.section] || [];
    return { ...groups, [item.section]: [...existing, item] };
  }, {});
  const sectionOrder = ["Workspace", "Graduate", "Management", "Account"];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/dashboard">
          <span>SG</span>
          <div>
            <strong>Skills Gap</strong>
            <small>Kicukiro ICT TVET</small>
          </div>
        </Link>

        <nav className="nav-list" aria-label="Main navigation">
          {sectionOrder
            .filter((section) => groupedItems[section]?.length)
            .map((section) => (
              <div key={section} className="nav-group">
                <span className="nav-group-label">{section}</span>
                {groupedItems[section].map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} end={item.to === "/dashboard"}>
                      <Icon size={18} />
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.description}</small>
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
        </nav>

        <Link className="home-link" to="/">
          <Home size={18} />
          <span>Homepage</span>
        </Link>

        <button className="logout-button" type="button" onClick={logout}>
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-title">
            <div className="breadcrumb">
              <Map size={14} />
              <span>{currentItem?.section || "Workspace"}</span>
              <span>/</span>
              <strong>{currentItem?.label || "Dashboard"}</strong>
            </div>
            <span className="eyebrow">{roleLabels[user.role] || user.role}</span>
            <h1>{currentItem?.label || "Dashboard"}</h1>
            <p>{currentItem?.description || "System workspace"}</p>
          </div>
          <div className="topbar-actions">
            <label className="quick-nav">
              Go to page
              <select value={currentItem?.to || "/dashboard"} onChange={(event) => navigate(event.target.value)}>
                {visibleItems.map((item) => (
                  <option key={item.to} value={item.to}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="account-chip">{user.email}</div>
          </div>
        </header>

        <section className="content-area">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
