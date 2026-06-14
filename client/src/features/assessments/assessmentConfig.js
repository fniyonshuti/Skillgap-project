import {
  BriefcaseBusiness,
  FlaskConical,
  GraduationCap,
  UserCheck
} from "lucide-react";

export const EVIDENCE_SOURCES = Object.freeze([
  {
    key: "practical",
    label: "Practical assessment",
    weight: 40,
    icon: FlaskConical,
    help: "System-scored questions about lab tasks, demonstrations, and practical outcomes."
  },
  {
    key: "portfolio",
    label: "Portfolio evidence",
    weight: 30,
    icon: BriefcaseBusiness,
    help: "System-scored questions about projects, certificates, and verified technical work."
  },
  {
    key: "academic",
    label: "Academic record",
    weight: 20,
    icon: GraduationCap,
    help: "Structured questions linked to relevant modules, courses, and academic records."
  },
  {
    key: "selfAssessment",
    label: "Self-assessment",
    weight: 10,
    icon: UserCheck,
    help: "Capability questions checked alongside the evidence you submit."
  }
]);

export const COMPETENCY_LEVEL_GUIDE = Object.freeze([
  { level: 4, range: "80-100", label: "Highly Competent" },
  { level: 3, range: "60-79", label: "Competent" },
  { level: 2, range: "40-59", label: "Partially Competent" },
  { level: 1, range: "0-39", label: "Not Yet Competent" }
]);

export const GAP_PRIORITY_ORDER = Object.freeze({
  high: 1,
  medium: 2,
  low: 3,
  none: 4
});

export const EVIDENCE_SOURCE_MAP = new Map(
  EVIDENCE_SOURCES.map((source) => [source.key, source])
);
