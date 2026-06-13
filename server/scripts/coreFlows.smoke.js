import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, unlink } from "node:fs/promises";
import net from "node:net";
import { resolve } from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import mongoose from "mongoose";

const serverRoot = resolve(process.cwd());
dotenv.config({ path: resolve(serverRoot, ".env") });

const baseMongoUri = process.env.MONGO_URI;
if (!baseMongoUri) {
  throw new Error("MONGO_URI must be configured in server/.env before running the core smoke test.");
}

const databaseName = `sg_smoke_${Date.now().toString(36)}_${process.pid}`;
const parsedMongoUri = new URL(baseMongoUri);
parsedMongoUri.pathname = `/${databaseName}`;
const smokeMongoUri = parsedMongoUri.toString();
const uploadDirectory = resolve(serverRoot, "uploads/evidence");

let serverProcess;

function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolvePort(address.port));
    });
  });
}

function runNode(args, environment) {
  return new Promise((resolveProcess, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: serverRoot,
      env: environment,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolveProcess({ stdout, stderr });
        return;
      }
      reject(new Error(`Command failed with exit code ${code}.\n${stdout}\n${stderr}`));
    });
  });
}

async function waitForApi(baseUrl, serverLogs) {
  const deadline = Date.now() + 20000;

  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`API server exited early.\n${serverLogs.stdout}\n${serverLogs.stderr}`);
    }

    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }

    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }

  throw new Error(`Timed out waiting for the API server.\n${serverLogs.stdout}\n${serverLogs.stderr}`);
}

async function request(baseUrl, method, path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let body;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  } else if (options.form) {
    body = options.form;
  }

  const response = await fetch(`${baseUrl}${path}`, { method, headers, body });
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "";
  let data = buffer;

  if (contentType.includes("application/json") && buffer.length) {
    data = JSON.parse(buffer.toString("utf8"));
  } else if (contentType.startsWith("text/")) {
    data = buffer.toString("utf8");
  }

  const expectedStatuses = Array.isArray(options.expected)
    ? options.expected
    : [options.expected ?? 200];
  assert.ok(
    expectedStatuses.includes(response.status),
    `${method} ${path} returned ${response.status}: ${
      typeof data === "string" ? data : JSON.stringify(data)
    }`
  );

  return { data, headers: response.headers, status: response.status };
}

function buildQuestionBank() {
  return ["practical", "portfolio", "academic", "selfAssessment"].map(
    (source, index) => ({
      source,
      prompt: `Smoke test question for ${source}`,
      order: index,
      isActive: true,
      options: [
        { label: "Needs development", score: 0 },
        { label: "Meets the standard", score: 100 }
      ]
    })
  );
}

async function login(baseUrl, email) {
  const response = await request(baseUrl, "POST", "/api/auth/login", {
    body: { email, password: "Password123!" }
  });
  assert.ok(response.data.token);
  return response.data.token;
}

async function runCoreFlows(baseUrl) {
  const graduateToken = await login(baseUrl, "graduate@skills-gap.local");
  const institutionToken = await login(baseUrl, "institution@skills-gap.local");
  const adminToken = await login(baseUrl, "admin@skills-gap.local");

  for (const token of [graduateToken, institutionToken, adminToken]) {
    await request(baseUrl, "GET", "/api/auth/me", { token });
    await request(baseUrl, "GET", "/api/analytics/dashboard", { token });
  }

  await request(baseUrl, "POST", "/api/auth/register", {
    body: {
      role: "graduate",
      name: "Smoke Graduate",
      email: "smoke.graduate@example.test",
      password: "Password123!",
      program: "ICT",
      graduationYear: 2026
    },
    expected: 201
  });
  await request(baseUrl, "POST", "/api/auth/register", {
    body: {
      role: "admin",
      name: "Blocked Admin",
      email: "blocked.admin@example.test",
      password: "Password123!",
      adminSetupCode: "incorrect"
    },
    expected: 403
  });

  await request(baseUrl, "GET", "/api/graduates", {
    token: graduateToken,
    expected: 403
  });
  await request(baseUrl, "GET", "/api/competencies/manage", {
    token: institutionToken,
    expected: 403
  });
  await request(baseUrl, "GET", "/api/recommendation-rules", {
    token: graduateToken,
    expected: 403
  });
  await request(baseUrl, "GET", "/api/recommendation-rules", {
    token: adminToken,
    expected: 403
  });

  const institutionRulePayload = {
    rules: [
      {
        priority: "low",
        recommendationText: "Institution low-gap support plan.",
        actionItems: ["Complete the institution refresher exercise."],
        resourceType: "practice"
      },
      {
        priority: "medium",
        recommendationText: "Institution moderate-gap support plan.",
        actionItems: ["Attend the institution practical workshop."],
        resourceType: "course"
      },
      {
        priority: "high",
        recommendationText: "Institution high-gap support plan.",
        actionItems: ["Join the institution supervised remediation program."],
        resourceType: "mentorship"
      }
    ]
  };
  const institutionRules = await request(
    baseUrl,
    "PUT",
    "/api/recommendation-rules",
    {
      token: institutionToken,
      body: institutionRulePayload
    }
  );
  assert.equal(institutionRules.data.rules.length, 3);
  const storedInstitutionRules = await request(
    baseUrl,
    "GET",
    "/api/recommendation-rules",
    { token: institutionToken }
  );
  assert.deepEqual(
    storedInstitutionRules.data.rules.map((rule) => rule.recommendationText).sort(),
    institutionRulePayload.rules.map((rule) => rule.recommendationText).sort()
  );
  const publicInstitutions = await request(baseUrl, "GET", "/api/institutions");
  const publicInstitution = publicInstitutions.data.find(
    (institution) => institution.name === "Kicukiro Technical College"
  );
  assert.ok(publicInstitution);
  assert.equal(Object.hasOwn(publicInstitution, "recommendationRules"), false);
  await request(baseUrl, "PATCH", `/api/institutions/${publicInstitution._id}`, {
    token: adminToken,
    body: {
      name: publicInstitution.name,
      code: publicInstitution.code,
      recommendationRules: [
        {
          priority: "high",
          recommendationText: "Administrator override",
          actionItems: ["This must be ignored."],
          resourceType: "course"
        }
      ]
    }
  });
  const rulesAfterAdminUpdate = await request(
    baseUrl,
    "GET",
    "/api/recommendation-rules",
    { token: institutionToken }
  );
  assert.deepEqual(
    rulesAfterAdminUpdate.data.rules.map((rule) => rule.recommendationText).sort(),
    institutionRulePayload.rules.map((rule) => rule.recommendationText).sort()
  );

  const profileResponse = await request(baseUrl, "GET", "/api/graduates/me", {
    token: graduateToken
  });
  const graduate = profileResponse.data;
  const originalInstitutionId = graduate.institutionId?._id;
  assert.ok(originalInstitutionId);

  await request(baseUrl, "PATCH", "/api/graduates/me", {
    token: graduateToken,
    body: {
      institutionId: originalInstitutionId,
      registrationNumber: graduate.registrationNumber,
      program: graduate.program,
      graduationYear: graduate.graduationYear,
      phone: graduate.phone,
      district: graduate.district
    }
  });

  const domainsResponse = await request(baseUrl, "GET", "/api/domains");
  assert.ok(domainsResponse.data.length > 0);
  const domainId = domainsResponse.data[0]._id;
  const competencyResponse = await request(
    baseUrl,
    "GET",
    `/api/competencies/assessment?domainId=${domainId}`,
    { token: graduateToken }
  );
  const competencies = competencyResponse.data;
  assert.ok(competencies.length > 0);
  assert.ok(competencies.every((competency) => competency.assessmentReady));
  assert.ok(
    competencies.every((competency) =>
      competency.assessmentQuestions.every((question) =>
        question.options.every((option) => !Object.hasOwn(option, "score"))
      )
    )
  );

  const imageBuffer = await readFile(resolve(serverRoot, "../client/src/assets/home-hero.png"));
  const evidenceForm = new FormData();
  evidenceForm.append("file", new Blob([imageBuffer], { type: "image/png" }), "smoke-evidence.png");
  const evidenceResponse = await request(baseUrl, "POST", "/api/evidence/upload", {
    token: graduateToken,
    form: evidenceForm,
    expected: 201
  });
  const evidenceId = evidenceResponse.data.evidence.id;

  const assessmentPayload = {
    domainId,
    items: competencies.map((competency, index) => ({
      competencyId: competency._id,
      responses: competency.assessmentQuestions.map((question) => ({
        questionId: question._id,
        optionId: question.options[0]._id
      })),
      evidence: `Smoke test evidence for ${competency.title}`,
      evidenceIds: index === 0 ? [evidenceId] : [],
      remarks: "Automated core-flow verification"
    }))
  };
  const assessmentResponse = await request(baseUrl, "POST", "/api/assessments", {
    token: graduateToken,
    body: assessmentPayload,
    expected: 201
  });
  const assessmentId = assessmentResponse.data.assessment._id;
  assert.equal(assessmentResponse.data.assessment.status, "submitted");
  assert.equal(assessmentResponse.data.assessment.processingStatus, "completed");
  assert.ok(assessmentResponse.data.recommendations.length > 0);
  assert.ok(
    assessmentResponse.data.recommendations.every((recommendation) =>
      recommendation.recommendationText.startsWith("Institution ")
    )
  );

  await request(baseUrl, "GET", `/api/assessments/${assessmentId}`, {
    token: graduateToken
  });
  await request(baseUrl, "GET", `/api/gaps/assessment/${assessmentId}`, {
    token: graduateToken
  });
  await request(baseUrl, "GET", `/api/gaps/graduate/${graduate._id}/latest`, {
    token: graduateToken
  });
  await request(baseUrl, "GET", `/api/evidence/${evidenceId}/download`, {
    token: institutionToken
  });
  await request(baseUrl, "DELETE", `/api/evidence/${evidenceId}`, {
    token: graduateToken,
    expected: 409
  });

  const recommendationsResponse = await request(baseUrl, "GET", "/api/recommendations", {
    token: graduateToken
  });
  assert.ok(recommendationsResponse.data.length > 0);
  await request(
    baseUrl,
    "PATCH",
    `/api/recommendations/${recommendationsResponse.data[0]._id}/status`,
    {
      token: graduateToken,
      body: { status: "completed" }
    }
  );

  const notificationsResponse = await request(baseUrl, "GET", "/api/notifications", {
    token: graduateToken
  });
  assert.ok(notificationsResponse.data.length > 0);
  await request(
    baseUrl,
    "PATCH",
    `/api/notifications/${notificationsResponse.data[0]._id}/read`,
    { token: graduateToken }
  );

  const reportPath = `/api/reports/graduate/${graduate._id}`;
  const jsonReport = await request(baseUrl, "GET", reportPath, { token: graduateToken });
  assert.ok(jsonReport.data.competencies.length > 0);
  const csvReport = await request(baseUrl, "GET", `${reportPath}?format=csv`, {
    token: graduateToken
  });
  assert.match(csvReport.data, /RTB Reference/);
  const pdfReport = await request(baseUrl, "GET", `${reportPath}?format=pdf`, {
    token: graduateToken
  });
  assert.equal(pdfReport.data.subarray(0, 4).toString("utf8"), "%PDF");
  await request(baseUrl, "GET", `${reportPath}?format=xlsx`, {
    token: graduateToken,
    expected: 400
  });

  const institutionGraduates = await request(baseUrl, "GET", "/api/graduates", {
    token: institutionToken
  });
  assert.ok(
    institutionGraduates.data.items.some((item) => item._id === graduate._id)
  );
  await request(baseUrl, "GET", reportPath, { token: institutionToken });
  const reviewedAssessment = await request(
    baseUrl,
    "PATCH",
    `/api/assessments/${assessmentId}/review`,
    { token: institutionToken, body: {} }
  );
  assert.equal(reviewedAssessment.data.status, "reviewed");
  assert.equal(reviewedAssessment.data.evidenceVerificationStatus, "verified");

  const managedCompetencies = await request(baseUrl, "GET", "/api/competencies/manage", {
    token: adminToken
  });
  assert.ok(managedCompetencies.data.length > 0);
  assert.ok(
    managedCompetencies.data.some((competency) =>
      competency.assessmentQuestions.some((question) =>
        question.options.some((option) => Object.hasOwn(option, "score"))
      )
    )
  );
  await request(baseUrl, "GET", "/api/users", { token: adminToken });

  const newDomain = await request(baseUrl, "POST", "/api/domains", {
    token: adminToken,
    body: {
      name: "Core Smoke Domain",
      description: "Temporary domain for core workflow verification."
    },
    expected: 201
  });
  const competencyPayload = {
    domainId: newDomain.data._id,
    title: "Core smoke competency",
    category: "general",
    requiredLevel: 3,
    rtbReference: "RTB-SMOKE-01",
    version: "1.0",
    effectiveDate: new Date().toISOString(),
    standardStatus: "active",
    description: "Temporary competency for core workflow verification.",
    evidenceExamples: ["Smoke evidence"],
    assessmentQuestions: buildQuestionBank()
  };
  const createdCompetency = await request(baseUrl, "POST", "/api/competencies", {
    token: adminToken,
    body: competencyPayload,
    expected: 201
  });
  const competencyId = createdCompetency.data.competency._id;
  await request(baseUrl, "PATCH", `/api/competencies/${competencyId}`, {
    token: adminToken,
    body: { ...competencyPayload, title: "Updated core smoke competency" }
  });
  await request(baseUrl, "DELETE", `/api/competencies/${competencyId}`, {
    token: adminToken
  });

  const clearedProfile = await request(baseUrl, "PATCH", "/api/graduates/me", {
    token: graduateToken,
    body: { institutionId: "" }
  });
  assert.equal(clearedProfile.data.institutionId, null);
  await request(baseUrl, "PATCH", "/api/graduates/me", {
    token: graduateToken,
    body: { institutionId: originalInstitutionId }
  });
}

async function cleanup() {
  if (serverProcess && serverProcess.exitCode === null) {
    serverProcess.kill();
    await new Promise((resolveExit) => {
      const timer = setTimeout(resolveExit, 3000);
      serverProcess.once("exit", () => {
        clearTimeout(timer);
        resolveExit();
      });
    });
  }

  const connection = await mongoose.createConnection(smokeMongoUri).asPromise();
  let evidenceFiles = [];
  try {
    evidenceFiles = await connection
      .collection("evidences")
      .find({}, { projection: { storedName: 1 } })
      .toArray();
    await connection.dropDatabase();
  } finally {
    await connection.close();
  }

  await Promise.all(
    evidenceFiles.map((evidence) =>
      unlink(resolve(uploadDirectory, evidence.storedName)).catch(() => null)
    )
  );
}

const port = await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;
const childEnvironment = {
  ...process.env,
  MONGO_URI: smokeMongoUri,
  PORT: String(port),
  CLIENT_URL: "http://localhost:5173",
  NODE_ENV: "test"
};
const serverLogs = { stdout: "", stderr: "" };

try {
  console.log(`Preparing isolated smoke database: ${databaseName}`);
  await runNode(["src/scripts/seed.js"], childEnvironment);

  serverProcess = spawn(process.execPath, ["src/server.js"], {
    cwd: serverRoot,
    env: childEnvironment,
    stdio: ["ignore", "pipe", "pipe"]
  });
  serverProcess.stdout.on("data", (chunk) => {
    serverLogs.stdout += chunk;
  });
  serverProcess.stderr.on("data", (chunk) => {
    serverLogs.stderr += chunk;
  });

  await waitForApi(baseUrl, serverLogs);
  await runCoreFlows(baseUrl);
  console.log("Core application smoke test passed.");
} finally {
  await cleanup();
}
