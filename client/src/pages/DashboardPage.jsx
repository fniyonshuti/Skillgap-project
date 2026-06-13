import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MetricCard } from "../components/MetricCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api, getErrorMessage } from "../services/api.js";

export function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/analytics/dashboard")
      .then(({ data }) => setAnalytics(data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const cards = useMemo(() => {
    if (!analytics) return [];

    if (user.role === "graduate") {
      return [
        ["Assessments", analytics.assessmentCount, "neutral"],
        ["Evidence Score", `${analytics.readinessScore}%`, "success"],
        ["Average Gap", analytics.overallGapScore, "warning"]
      ];
    }

    if (user.role === "institution") {
      return [
        ["Graduates", analytics.graduateCount, "neutral"],
        ["Assessments", analytics.assessmentCount, "neutral"],
        ["Avg Evidence Score", `${analytics.avgReadiness}%`, "success"],
        ["Avg Gap", analytics.avgGap, "warning"]
      ];
    }

    return [
      ["Users", analytics.userCount, "neutral"],
      ["Graduates", analytics.graduateCount, "neutral"],
      ["Institutions", analytics.institutionCount, "success"],
      ["Competencies", analytics.competencyCount, "warning"],
      ["Assessments", analytics.assessmentCount, "neutral"]
    ];
  }, [analytics, user.role]);

  const chartData = cards.map(([label, value]) => ({
    label,
    value: Number(String(value).replace("%", "")) || 0
  }));

  return (
    <div className="page-stack">
      <div className="section-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Current performance and activity summary.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="metrics-grid">
        {cards.map(([label, value, tone]) => (
          <MetricCard key={label} label={label} value={value} tone={tone} />
        ))}
      </div>

      <section className="panel">
        <h3>Overview</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
