import Anthropic from "@anthropic-ai/sdk";
import type { AuditResult, CompanyProfile, OnboardingRun } from "../types.js";

const client = new Anthropic();

export async function runAuditorAgent(
  company: CompanyProfile,
  run: OnboardingRun
): Promise<AuditResult> {
  console.log(`  🔍  Auditor [${run.personaName}]...`);

  const groundTruthTools = company.persona.toolStack;
  const detectedTools = run.discovery.detectedTools;
  const confirmedTools = run.finalConfirmedTools;

  // Compute tool detection metrics (deterministic — no LLM needed)
  const truePositives = confirmedTools.filter((t) => groundTruthTools.includes(t));
  const falsePositives = confirmedTools.filter((t) => !groundTruthTools.includes(t));
  const falseNegatives = groundTruthTools.filter((t) => !confirmedTools.includes(t));

  const precision = confirmedTools.length > 0 ? truePositives.length / confirmedTools.length : 0;
  const recall = groundTruthTools.length > 0 ? truePositives.length / groundTruthTools.length : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  // Use LLM to assess narration quality
  const narrationPrompt = `You are auditing the output of a PM workflow onboarding.

PERSONA: ${run.personaName}, ${company.persona.role} at ${company.name}
GROUND TRUTH projects: ${company.persona.projects.map((p) => p.name).join(", ")}
GROUND TRUTH collaborators: ${company.persona.collaborators.map((c) => c.name).join(", ")}
GROUND TRUTH tool stack: ${company.persona.toolStack.join(", ")}
INVISIBLE COMMS (WhatsApp, etc.): ${company.persona.invisibleComms.join(", ")}

NARRATION the persona gave:
"${run.finalNarration}"

Evaluate the narration. Return JSON:
{
  "projectsRevealed": ["projects explicitly or implicitly mentioned"],
  "projectsMissed": ["projects from ground truth not mentioned at all"],
  "peopleRevealed": ["collaborators mentioned by name"],
  "toolsRevealedByNarration": ["tools mentioned in narration text — even ones not detected by email mining"],
  "blockersSurfaced": ["blockers or stuck items mentioned"],
  "richness": "high" | "medium" | "low",
  "richnessReason": "one sentence explaining why"
}

Return ONLY the JSON.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [{ role: "user", content: narrationPrompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const narrationScore = jsonMatch
    ? JSON.parse(jsonMatch[0])
    : {
        projectsRevealed: [],
        projectsMissed: company.persona.projects.map((p) => p.name),
        peopleRevealed: [],
        toolsRevealedByNarration: [],
        blockersSurfaced: [],
        richness: "low",
        richnessReason: "No narration provided",
      };

  // Overall score: weighted average of recall (50%) + narration richness (30%) + precision (20%)
  const richnessMap = { high: 1, medium: 0.6, low: 0.2 };
  const richnessScore = richnessMap[narrationScore.richness as "high" | "medium" | "low"] ?? 0.4;
  const overallScore = Math.round((recall * 50 + richnessScore * 30 + precision * 20) * 100) / 100;

  const criticalGaps: string[] = [];
  if (recall < 0.6) criticalGaps.push(`Only ${Math.round(recall * 100)}% of real tools were detected`);
  if (narrationScore.projectsMissed?.length > 1)
    criticalGaps.push(`Key projects not surfaced: ${narrationScore.projectsMissed.join(", ")}`);
  if (company.persona.invisibleComms.length > 0)
    criticalGaps.push(`Invisible comms gap: ${company.persona.invisibleComms.join(", ")} — unreachable`);
  if (falsePositives.length > 0)
    criticalGaps.push(`False positives confirmed by persona: ${falsePositives.join(", ")}`);

  const whatWorkedWell: string[] = [];
  if (recall >= 0.8) whatWorkedWell.push("Email mining caught most of the tool stack");
  if (narrationScore.richness === "high") whatWorkedWell.push("Narration provided rich context");
  if (narrationScore.toolsRevealedByNarration?.length > 0)
    whatWorkedWell.push(
      `Narration surfaced tools email couldn't: ${narrationScore.toolsRevealedByNarration.join(", ")}`
    );

  console.log(
    `  ✓   Auditor [${run.personaName}]: recall=${Math.round(recall * 100)}% precision=${Math.round(precision * 100)}% score=${overallScore}`
  );

  return {
    companyId: company.id,
    personaName: run.personaName,
    toolDetection: {
      precision: Math.round(precision * 100) / 100,
      recall: Math.round(recall * 100) / 100,
      f1: Math.round(f1 * 100) / 100,
      falsePositives,
      falseNegatives,
    },
    narration: narrationScore,
    overallDiscoveryScore: overallScore,
    criticalGaps,
    whatWorkedWell,
  };
}
