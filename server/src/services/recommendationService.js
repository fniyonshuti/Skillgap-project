const categoryResourceMap = {
  programming: "practice",
  database: "practice",
  networking: "certification",
  cybersecurity: "course",
  support: "mentorship",
  default: "course"
};

export function buildRecommendation(competency, priority, engineRecommendation) {
  const category = (competency.category || "default").toLowerCase();
  const resourceType = categoryResourceMap[category] || categoryResourceMap.default;

  const actionProfiles = {
    high: {
      lead: "Complete an intensive, supervised upskilling plan",
      actions: [
        "Join a structured short course or remedial training module.",
        "Complete at least two supervised practical tasks.",
        "Submit a portfolio artifact for institution review."
      ]
    },
    medium: {
      lead: "Complete focused practical training",
      actions: [
        "Practice the missing tasks in a lab or workplace simulation.",
        "Build one portfolio project that demonstrates the competency.",
        "Request feedback from an instructor or workplace supervisor."
      ]
    },
    low: {
      lead: "Strengthen the remaining competency areas",
      actions: [
        "Review the relevant RTB learning outcomes.",
        "Complete one targeted practical exercise.",
        "Document the result in your portfolio."
      ]
    }
  };
  const profile = actionProfiles[priority] || actionProfiles.low;
  const guidance = competency.recommendationGuidance?.trim();

  return {
    recommendationText: engineRecommendation || profile.lead,
    rationale: `Your demonstrated level is below the RTB requirement for ${competency.rtbReference || competency.title}.`,
    actionItems: guidance ? [guidance, ...profile.actions] : profile.actions,
    targetLevel: competency.requiredLevel,
    resourceType,
    priority
  };
}
