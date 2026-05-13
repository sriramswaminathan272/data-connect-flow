import Anthropic from "@anthropic-ai/sdk";
import type { AuditResult, CompanyProfile, ObserverReport, OnboardingRun } from "../types.js";

const client = new Anthropic();

function safeParseJSON<T>(text: string, fallback: T): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return fallback;
  try { return JSON.parse(match[0]) as T; }
  catch { return fallback; }
}

export async function runObserverAgent(
  companies: CompanyProfile[],
  runs: OnboardingRun[],
  audits: AuditResult[]
): Promise<ObserverReport> {
  console.log("  👁️   Observer: synthesising across all runs...");

  const roleGroups = {
    pm: audits.filter((a) => a.personaRole === "pm"),
    analyst: audits.filter((a) => a.personaRole === "analyst"),
    marketing: audits.filter((a) => a.personaRole === "marketing"),
  };

  const companyGroups = [...new Set(runs.map((r) => r.companyKey))].map((key) => ({
    key,
    name: companies.find((c) => c.companyKey === key)?.name ?? key,
    runs: runs.filter((r) => r.companyKey === key),
    audits: audits.filter((a) => a.companyKey === key),
  }));

  const runSummaries = runs.map((run) => {
    const company = companies.find((c) => c.id === run.companyId)!;
    const audit = audits.find((a) => a.companyId === run.companyId)!;
    const stepSummary = run.steps
      .map((s) => `  [${s.step}] ${s.decision}${s.hesitations.length > 0 ? ` | hesitations: ${s.hesitations.join("; ")}` : ""}${s.skipped ? " [SKIPPED]" : ""}`)
      .join("\n");

    return `
=== ${run.personaName} | ${company.personaRole} @ ${company.name} (${company.archetype}) ===
Tool detection: recall=${Math.round(audit.toolDetection.recall * 100)}% precision=${Math.round(audit.toolDetection.precision * 100)}% F1=${Math.round(audit.toolDetection.f1 * 100)}%
False positives: ${audit.toolDetection.falsePositives.join(", ") || "none"}
Missed: ${audit.toolDetection.falseNegatives.join(", ") || "none"}
Narration richness: ${audit.narration.richness} — ${audit.narration.richnessReason ?? ""}
Overall score: ${audit.overallDiscoveryScore}/100
Marketing OAuth taken: ${run.steps.find((s) => s.step === "marketing-connect")?.tookMarketingOAuth ?? "N/A (not shown)"}

Steps:
${stepSummary}

Narration: "${run.finalNarration || "(skipped)"}"

Context extracted: ${JSON.stringify(run.extractedContext, null, 2)}

Critical gaps: ${audit.criticalGaps.join(" | ") || "none"}
What worked: ${audit.whatWorkedWell.join(" | ") || "nothing noted"}`;
  }).join("\n");

  const roleScores = {
    pm: roleGroups.pm.map((a) => a.overallDiscoveryScore),
    analyst: roleGroups.analyst.map((a) => a.overallDiscoveryScore),
    marketing: roleGroups.marketing.map((a) => a.overallDiscoveryScore),
  };
  const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const prompt = `You are a senior UX researcher and product designer. You have just observed 15 users (5 companies × 3 roles: PM, analyst, marketing) go through a workflow discovery onboarding flow.

The onboarding flow:
1. WELCOME — value prop, get started
2. CONNECT — Google OAuth (Gmail + Calendar), explicit data usage breakdown
3. MINING — animated scan, detects tools from email/calendar patterns
4. TOOLS — show detected tools as toggleable cards, user confirms/adds/removes
5. MARKETING-CONNECT — offered only when marketing signals detected; separate Google Analytics/Ads OAuth
6. NARRATION — "tell me about your week" free-text with 4 guided prompts
7. DONE — shows extracted projects, collaborators, and blockers

Role averages: PM=${avg(roleScores.pm)}/100, Analyst=${avg(roleScores.analyst)}/100, Marketing=${avg(roleScores.marketing)}/100

Session transcripts:
${runSummaries}

Write a thorough UX and product critique. Return JSON only:
{
  "summary": "2-3 sentence executive summary of overall flow health, naming specific patterns",
  "overallHealthScore": 0-100,
  "frictionPoints": [
    {
      "step": "welcome"|"connect"|"mining"|"tools"|"marketing-connect"|"narration"|"done",
      "issue": "specific friction observed",
      "frequency": "seen in X/15 runs or X/5 PM runs etc",
      "severity": "high"|"medium"|"low",
      "suggestedFix": "specific, actionable fix"
    }
  ],
  "roleInsights": [
    {
      "role": "pm"|"analyst"|"marketing",
      "pattern": "consistent behaviour pattern observed across this role",
      "recommendation": "specific product recommendation for this role"
    }
  ],
  "companyInsights": [
    {
      "companyKey": "feastrunner"|"bitvault"|"mediconnect"|"quickcart"|"swiftship",
      "companyName": "company display name",
      "crossRolePattern": "pattern observed consistently across all 3 roles at this company",
      "recommendation": "what to do differently for this company archetype"
    }
  ],
  "topRecommendations": [
    "5 priority-ranked recommendations — each a complete, specific, actionable sentence"
  ],
  "stepsThatWorked": ["steps that performed well with brief evidence"],
  "stepsToRethink": ["steps that need redesign with brief reason"],
  "unexpectedFindings": ["3-5 surprising observations grounded in specific run data"]
}

Be concrete. Reference personas by name and specific session data. No generic UX advice.
Return ONLY the JSON.`;

  const fallbackReport: ObserverReport = {
    summary: "Observer synthesis unavailable — check logs for API errors.",
    overallHealthScore: 0,
    frictionPoints: [],
    roleInsights: [],
    companyInsights: [],
    topRecommendations: [],
    stepsThatWorked: [],
    stepsToRethink: [],
    unexpectedFindings: [],
  };

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const report = safeParseJSON(text, fallbackReport);
    console.log(`  ✓   Observer: health score ${report.overallHealthScore}/100`);
    return report;
  } catch (err) {
    console.error("  ✗   Observer failed:", err);
    return fallbackReport;
  }
}
