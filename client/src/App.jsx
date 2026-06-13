import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AssessmentPage } from "./pages/AssessmentPage.jsx";
import { CompetenciesPage } from "./pages/CompetenciesPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { GraduatesPage } from "./pages/GraduatesPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { NotificationsPage } from "./pages/NotificationsPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { RecommendationsPage } from "./pages/RecommendationsPage.jsx";
import { RecommendationRulesPage } from "./pages/RecommendationRulesPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { ReportsPage } from "./pages/ReportsPage.jsx";

export function App() {
  return (
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
  );
}
