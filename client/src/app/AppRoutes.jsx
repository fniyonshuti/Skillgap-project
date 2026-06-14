/**
 * @fileoverview Client routing, access policies, and page-level code splitting.
 */

import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/AppLayout.jsx";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";

function lazyNamed(importer, exportName) {
  return lazy(async () => {
    const module = await importer();
    return { default: module[exportName] };
  });
}

const AssessmentPage = lazyNamed(
  () => import("../pages/AssessmentPage.jsx"),
  "AssessmentPage"
);
const CompetenciesPage = lazyNamed(
  () => import("../pages/CompetenciesPage.jsx"),
  "CompetenciesPage"
);
const DashboardPage = lazyNamed(() => import("../pages/DashboardPage.jsx"), "DashboardPage");
const GraduatesPage = lazyNamed(() => import("../pages/GraduatesPage.jsx"), "GraduatesPage");
const HomePage = lazyNamed(() => import("../pages/HomePage.jsx"), "HomePage");
const LoginPage = lazyNamed(() => import("../pages/LoginPage.jsx"), "LoginPage");
const NotificationsPage = lazyNamed(
  () => import("../pages/NotificationsPage.jsx"),
  "NotificationsPage"
);
const ProfilePage = lazyNamed(() => import("../pages/ProfilePage.jsx"), "ProfilePage");
const RecommendationsPage = lazyNamed(
  () => import("../pages/RecommendationsPage.jsx"),
  "RecommendationsPage"
);
const RecommendationRulesPage = lazyNamed(
  () => import("../pages/RecommendationRulesPage.jsx"),
  "RecommendationRulesPage"
);
const RegisterPage = lazyNamed(() => import("../pages/RegisterPage.jsx"), "RegisterPage");
const ReportsPage = lazyNamed(() => import("../pages/ReportsPage.jsx"), "ReportsPage");

/**
 * Declares the client routing and role-access hierarchy.
 *
 * Pages are loaded only when visited, keeping large chart and assessment
 * dependencies out of the public landing-page bundle.
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<div className="screen-center">Loading page...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
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
