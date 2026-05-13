import Anthropic from "@anthropic-ai/sdk";
import type { AuditResult, CompanyProfile, NarrationScore, OnboardingRun } from "../types.js";

const client = new Anthropic();

function safeParseJSON<T>(text: string, fallback: T): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return fallback;
  try { return JSON.parse(match[0]) as T; }
  catch { return fallback; }
}

export async function runAuditorAgent(company: CompanyProfile, run: OnboardingRun): Promise<AuditResult> {
  const tag = `${run.personaName} (${run.personaRole})`;
  console.log(`  🔍  Auditor [${tag}]...`);

  const groundTruthTools = company.persona.toolStack;
  const confirmed = run.finalConfirmedTools;

  // ── Deterministic tool detection metrics ─────────────────────────────────
  const truePositives = confirmed.filter((t) => groundTruthTools.includes(t));
  const falsePositives = confirmed.filter((t) => !groundTruthTools.includes(t));
  const falseNegatives = groundTruthTools.filter((t) => !confirmed.includes(t));

  const precision = confirmed.length > 0 ? truePositives.length / confirmed.length : 0;
  const recall = groundTruthTools.length > 0 ? truePositives.length / groundTruthTools.length : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  // ── LLM narration quality assessment ─────────────────────────────────────
  const narrationFallback: NarrationScore = {
    projectsRevealed: [],
    projectsMissed: company.persona.projects.map((p) => p.name),
    peopleRevealed: [],
    toolsRevealedByNarration: [],
    blockersSurfaced: [],
    richness: "low",
    richnessReason: "No narration provided or narration was skipped",
  };

  let narrationScore = narrationFallback;

  if (run.finalNarration && run.finalNarration.trim().length > 20) {
    const prompt = `Audit this PM/analyst/marketer narration against ground truth.

PERSONA: ${run.personaName}, ${company.persona.role} at ${company.name}
ROLE TYPE: ${run.personaRole}
GROUND TRUTH projects: ${company.persona.projects.map((p) => p.name).join(", ")}
GROUND TRUTH collaborators: ${company.persona.collaborators.map((c) => c.name).join(", ")}
GROUND TRUTH tools: ${company.persona.toolStack.join(", ")}
INVISIBLE COMMS: ${company.persona.invisibleComms.join(", ")}

NARRATION: "${run.finalNarration}"

Return JSON only:
{
  "projectsRevealed": ["projects explicitly or implicitly mentioned"],
  "projectsMissed": ["ground truth projects NOT mentioned at all"],
  "peopleRevealed": ["collaborator names mentioned"],
  "toolsRevealedByNarration": ["tools explicitly named in narration text"],
  "blockersSurfaced": ["specific blockers or stuck items mentioned"],
  "richness": "high" | "medium" | "low",
  "richnessReason": "one sentence explaining the richness rating"
}`;

    try {
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      });
      const text = response.content[0].type === "text" ? response.content[0].text : "";
      narrationScore = safeParseJSON(text, narrationFallback);
    } catch (err) {
      console.warn(`  ⚠   Auditor [${tag}]: narration LLM failed, using fallback`);
    }
  }

  // ── Overall score ─────────────────────────────────────────────────────────
  const richnessMap: Record<string, number> = { high: 1, medium: 0.6, low: 0.2 };
  const richnessScore = richnessMap[narrationScore.richness] ?? 0.4;
  const overallScore = Math.min(100, Math.round(recall * 50 + richnessScore * 30 + precision * 20));

  // ── Gaps and wins ─────────────────────────────────────────────────────────
  const criticalGaps: string[] = [];
  if (recall < 0.6) criticalGaps.push(`Only ${Math.round(recall * 100)}% of real tools detected — majority of stack is invisible`);
  if ((narrationScore.projectsMissed?.length ?? 0) > 1) criticalGaps.push(`Projects not surfaced: ${narrationScore.projectsMissed.join(", ")}`);
  if (company.persona.invisibleComms.length > 0) criticalGaps.push(`Invisible comms: ${company.persona.invisibleComms.join(", ")} — permanently unreachable`);
  if (falsePositives.length > 0) criticalGaps.push(`Persona confirmed tools they don't use: ${falsePositives.join(", ")}`);
  if (run.personaRole === "marketing" && !run.steps.find((s) => s.step === "marketing-connect" && s.tookMarketingOAuth))
    criticalGaps.push("Marketing persona did not take the Google Analytics/Ads OAuth upgrade — campaign context missed");

  const whatWorkedWell: string[] = [];
  if (recall >= 0.75) whatWorkedWell.push(`Email mining detected ${Math.round(recall * 100)}% of tool stack`);
  if (narrationScore.richness === "high") whatWorkedWell.push("Narration was rich and specific");
  if ((narrationScore.toolsRevealedByNarration?.length ?? 0) > 0)
    whatWorkedWell.push(`Narration surfaced extra tools: ${narrationScore.toolsRevealedByNarration.join(", ")}`);
  if ((narrationScore.blockersSurfaced?.length ?? 0) > 0)
    whatWorkedWell.push(`Blockers surfaced: ${narrationScore.blockersSurfaced.join("; ")}`);

  console.log(`  ✓   Auditor [${tag}]: recall=${Math.round(recall * 100)}% precision=${Math.round(precision * 100)}% score=${overallScore}`);

  return {
    companyId: company.id,
    companyKey: company.companyKey,
    personaRole: run.personaRole,
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
