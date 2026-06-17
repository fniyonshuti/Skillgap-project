/**
 * @fileoverview Client routing, access policies, and page-level code splitting.
 */

import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader } from "../components/common/Loader.jsx";
import { DashboardLayout } from "../layouts/DashboardLayout.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

function lazyNamed(importer, exportName) {
  return lazy(async () => {
    const module = await importer();
    return { default: module[exportName] };
  });
}

const AssessmentPage = lazyNamed(
  () => import("../pages/graduate/Assessment.jsx"),
  "AssessmentPage"
);
const CompetenciesPage = lazyNamed(
  () => import("../pages/admin/Competencies.jsx"),
  "CompetenciesPage"
);
const DashboardPage = lazyNamed(() => import("../pages/graduate/Dashboard.jsx"), "DashboardPage");
const GraduatesPage = lazyNamed(() => import("../pages/institution/Graduates.jsx"), "GraduatesPage");
const HomePage = lazyNamed(() => import("../pages/common/Home.jsx"), "HomePage");
const LoginPage = lazyNamed(() => import("../pages/auth/Login.jsx"), "LoginPage");
const NotificationsPage = lazyNamed(
  () => import("../pages/common/Notifications.jsx"),
  "NotificationsPage"
);
const ProfilePage = lazyNamed(() => import("../pages/graduate/Profile.jsx"), "ProfilePage");
const RecommendationsPage = lazyNamed(
  () => import("../pages/graduate/Recommendations.jsx"),
  "RecommendationsPage"
);
const RecommendationRulesPage = lazyNamed(
  () => import("../pages/institution/RecommendationRules.jsx"),
  "RecommendationRulesPage"
);
const RegisterPage = lazyNamed(() => import("../pages/auth/Register.jsx"), "RegisterPage");
const ReportsPage = lazyNamed(() => import("../pages/graduate/Reports.jsx"), "ReportsPage");

/**
 * Declares the client routing and role-access hierarchy.
 *
 * Pages are loaded only when visited, keeping large chart and assessment
 * dependencies out of the public landing-page bundle.
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<Loader label="Loading page..." />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route element={<ProtectedRoute roles={["graduate"]} />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/assessment" element={<AssessmentPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["institution", "admin"]} />}>
              <Route path="/graduates" element={<GraduatesPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["institution"]} />}>
              <Route path="/recommendation-rules" element={<RecommendationRulesPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/competencies" element={<CompetenciesPage />} />
            </Route>

            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
