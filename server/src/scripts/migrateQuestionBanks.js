import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { Competency } from "../models/Competency.js";
import { buildDefaultQuestionBank } from "../services/defaultQuestionBank.js";
import { isQuestionBankReady } from "../services/assessmentQuestionScoringService.js";

async function migrateQuestionBanks() {
  await connectDatabase();
  const competencies = await Competency.find({ isActive: true });
  let updated = 0;

  for (const competency of competencies) {
    if (isQuestionBankReady(competency)) continue;
    competency.assessmentQuestions = buildDefaultQuestionBank(competency.title);
    await competency.save();
    updated += 1;
  }

  console.log(`Question-bank migration complete. Updated ${updated} competencies.`);
  await mongoose.disconnect();
}

migrateQuestionBanks().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
