import {
  Home,
  LogOut,
  Map
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  NAVIGATION_ITEMS,
  NAVIGATION_SECTION_ORDER,
  ROLE_LABELS
} from "../config/navigation.js";
import { useAuth } from "../context/AuthContext.jsx";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const visibleItems = NAVIGATION_ITEMS.filter((item) => item.roles.includes(user.role));
  const currentItem =
    visibleItems.find((item) => item.to === location.pathname) ||
    visibleItems.find((item) => location.pathname.startsWith(item.to) && item.to !== "/dashboard") ||
    visibleItems[0];
  const groupedItems = visibleItems.reduce((groups, item) => {
    const existing = groups[item.section] || [];
    return { ...groups, [item.section]: [...existing, item] };
  }, {});

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
          {NAVIGATION_SECTION_ORDER
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
            <span className="eyebrow">{ROLE_LABELS[user.role] || user.role}</span>
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
