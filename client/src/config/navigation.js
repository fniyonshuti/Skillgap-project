import {
  BarChart3,
  Bell,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  UserRound
} from "lucide-react";

export const NAVIGATION_ITEMS = Object.freeze([
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
    to: "/recommendation-rules",
    label: "Recommendation Rules",
    description: "Define gap actions",
    icon: ListChecks,
    section: "Management",
    roles: ["institution"]
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
]);

export const NAVIGATION_SECTION_ORDER = Object.freeze([
  "Workspace",
  "Graduate",
  "Management",
  "Account"
]);

export const ROLE_LABELS = Object.freeze({
  graduate: "Graduate",
  institution: "Institutional",
  admin: "Admin"
});
