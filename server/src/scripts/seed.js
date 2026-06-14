import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { Assessment } from "../models/Assessment.js";
import { Competency } from "../models/Competency.js";
import { Evidence } from "../models/Evidence.js";
import { GapAnalysis } from "../models/GapAnalysis.js";
import { Graduate } from "../models/Graduate.js";
import { ICTDomain } from "../models/ICTDomain.js";
import { Institution } from "../models/Institution.js";
import { Notification } from "../models/Notification.js";
import { Recommendation } from "../models/Recommendation.js";
import { Report } from "../models/Report.js";
import { User } from "../models/User.js";
import { buildDefaultQuestionBank } from "../services/defaultQuestionBank.js";

const seedPassword = process.env.SEED_DEFAULT_PASSWORD;

if (
  !seedPassword ||
  seedPassword.length < 12 ||
  !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(seedPassword)
) {
  throw new Error(
    "SEED_DEFAULT_PASSWORD must contain at least 12 characters, uppercase, lowercase, and a number."
  );
}

const institutionRecommendationRules = [
  {
    priority: "low",
    recommendationText: "Strengthen the remaining competency areas.",
    actionItems: [
      "Review the relevant RTB learning outcomes.",
      "Complete one targeted practical exercise.",
      "Document the result in your portfolio."
    ],
    resourceType: "practice"
  },
  {
    priority: "medium",
    recommendationText: "Complete focused practical training.",
    actionItems: [
      "Practice the missing tasks in a lab or workplace simulation.",
      "Build one portfolio project that demonstrates the competency.",
      "Request feedback from an instructor or workplace supervisor."
    ],
    resourceType: "course"
  },
  {
    priority: "high",
    recommendationText: "Complete an intensive, supervised upskilling plan.",
    actionItems: [
      "Join a structured short course or remedial training module.",
      "Complete at least two supervised practical tasks.",
      "Submit a portfolio artifact for institution review."
    ],
    resourceType: "mentorship"
  }
];

const domains = [
  {
    name: "Software Development",
    description: "Programming, web development, debugging, and software delivery practices."
  },
  {
    name: "Networking",
    description: "Computer networks, routing, switching, and troubleshooting."
  },
  {
    name: "Database Administration",
    description: "Database design, SQL, backups, and data management."
  },
  {
    name: "Cybersecurity",
    description: "Security fundamentals, risk management, and secure ICT operations."
  },
  {
    name: "ICT Support",
    description: "End-user support, maintenance, documentation, and service desk operations."
  }
];

const competencySeeds = {
  "Software Development": [
    ["Programming fundamentals", "programming", 4, "RTB-ICT-SD-01"],
    ["Web application development", "programming", 4, "RTB-ICT-SD-02"],
    ["Version control with Git", "programming", 3, "RTB-ICT-SD-03"],
    ["Software testing and debugging", "programming", 3, "RTB-ICT-SD-04"]
  ],
  Networking: [
    ["IP addressing and subnetting", "networking", 4, "RTB-ICT-NW-01"],
    ["Network device configuration", "networking", 3, "RTB-ICT-NW-02"],
    ["Network troubleshooting", "networking", 4, "RTB-ICT-NW-03"],
    ["Wireless network setup", "networking", 3, "RTB-ICT-NW-04"]
  ],
  "Database Administration": [
    ["Relational database design", "database", 4, "RTB-ICT-DB-01"],
    ["SQL querying and reporting", "database", 4, "RTB-ICT-DB-02"],
    ["Backup and recovery", "database", 3, "RTB-ICT-DB-03"],
    ["Data privacy and access control", "database", 3, "RTB-ICT-DB-04"]
  ],
  Cybersecurity: [
    ["Security awareness and safe practices", "cybersecurity", 4, "RTB-ICT-CS-01"],
    ["Basic vulnerability identification", "cybersecurity", 3, "RTB-ICT-CS-02"],
    ["Authentication and access control", "cybersecurity", 3, "RTB-ICT-CS-03"],
    ["Incident reporting procedures", "cybersecurity", 3, "RTB-ICT-CS-04"]
  ],
  "ICT Support": [
    ["Computer hardware maintenance", "support", 4, "RTB-ICT-SP-01"],
    ["Operating system installation", "support", 4, "RTB-ICT-SP-02"],
    ["Help desk communication", "support", 3, "RTB-ICT-SP-03"],
    ["Technical documentation", "support", 3, "RTB-ICT-SP-04"]
  ]
};

async function clearDatabase() {
  await Promise.all([
    Assessment.deleteMany({}),
    Competency.deleteMany({}),
    Evidence.deleteMany({}),
    GapAnalysis.deleteMany({}),
    Graduate.deleteMany({}),
    ICTDomain.deleteMany({}),
    Institution.deleteMany({}),
    Notification.deleteMany({}),
    Recommendation.deleteMany({}),
    Report.deleteMany({}),
    User.deleteMany({})
  ]);
}

async function seed() {
  await connectDatabase();
  await clearDatabase();

  const [adminUser, institutionUser, graduateUser] = await User.create([
    {
      name: "System Administrator",
      email: "admin@skills-gap.local",
      passwordHash: seedPassword,
      role: "admin"
    },
    {
      name: "Kicukiro TVET Institution",
      email: "institution@skills-gap.local",
      passwordHash: seedPassword,
      role: "institution"
    },
    {
      name: "Demo Graduate",
      email: "graduate@skills-gap.local",
      passwordHash: seedPassword,
      role: "graduate"
    }
  ]);

  const institution = await Institution.create({
    name: "Kicukiro Technical College",
    code: "KTC",
    district: "Kicukiro",
    contactEmail: "institution@skills-gap.local",
    contactPhone: "+250780000001",
    address: "Kicukiro District",
    accountUserId: institutionUser._id,
    recommendationRules: institutionRecommendationRules,
    recommendationRulesUpdatedAt: new Date()
  });

  await Graduate.create({
    userId: graduateUser._id,
    institutionId: institution._id,
    registrationNumber: "KTC-ICT-2026-001",
    program: "Software Development",
    graduationYear: 2026,
    phone: "+250780000002",
    district: "Kicukiro",
    profileCompleted: true
  });

  const createdDomains = await ICTDomain.insertMany(domains);

  const domainMap = new Map(createdDomains.map((domain) => [domain.name, domain._id]));
  const competencies = Object.entries(competencySeeds).flatMap(([domainName, items]) =>
    items.map(([title, category, requiredLevel, rtbReference]) => ({
      domainId: domainMap.get(domainName),
      title,
      category,
      requiredLevel,
      rtbReference,
      description: `${title} aligned to ${domainName} competency requirements.`,
      evidenceExamples: ["Portfolio item", "Practical task", "Supervisor validation"],
      assessmentQuestions: buildDefaultQuestionBank(title)
    }))
  );

  await Competency.insertMany(competencies);

  await Notification.create({
    userId: graduateUser._id,
    title: "Welcome to the Skills Gap Analysis Tool",
    message: "Complete your first assessment to generate a skills gap report.",
    type: "system"
  });

  console.log("Seed completed.");
  console.log("Development users created:", [
    adminUser.email,
    institutionUser.email,
    graduateUser.email
  ]);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
