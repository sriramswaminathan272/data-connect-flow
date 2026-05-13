import Anthropic from "@anthropic-ai/sdk";
import type { AuditResult, CompanyProfile, ObserverReport, OnboardingRun } from "../types.js";

const client = new Anthropic();

export async function runObserverAgent(
  companies: CompanyProfile[],
  runs: OnboardingRun[],
  audits: AuditResult[]
): Promise<ObserverReport> {
  console.log("  👁️   Observer: synthesising across all runs...");

  const runSummaries = runs.map((run, i) => {
    const company = companies.find((c) => c.id === run.companyId)!;
    const audit = audits[i];
    return `
--- Run ${i + 1}: ${run.personaName} @ ${company.name} (${company.archetype}) ---
Tool detection: precision=${Math.round(audit.toolDetection.precision * 100)}% recall=${Math.round(audit.toolDetection.recall * 100)}%
False positives: ${audit.toolDetection.falsePositives.join(", ") || "none"}
Missed tools: ${audit.toolDetection.falseNegatives.join(", ") || "none"}
Narration richness: ${audit.narration.richness}
Overall score: ${audit.overallDiscoveryScore}

Step-by-step behaviour:
${run.steps
  .map(
    (s) => `  [${s.step}] Decision: ${s.decision}
   Hesitations: ${s.hesitations.length > 0 ? s.hesitations.join("; ") : "none"}
   Skipped: ${s.skipped}`
  )
  .join("\n")}

Narration given:
"${run.finalNarration || "(skipped)"}"

Critical gaps: ${audit.criticalGaps.join("; ") || "none"}
What worked: ${audit.whatWorkedWell.join("; ") || "nothing noted"}
`;
  });

  const onboardingFlowDescription = `
The onboarding flow being tested has these steps:
1. WELCOME — brief value prop, "get started" button
2. CONNECT — Google OAuth (Gmail + Calendar), with explicit "what we read / won't do" breakdown
3. MINING — animated scan showing progress (reads email patterns, calendar patterns, tool signals)
4. TOOLS — shows auto-detected tools as toggleable cards; user can uncheck wrong ones and add missing
5. NARRATION — free-text "tell me about your week" with 4 guided prompts
6. DONE — summary of confirmed tools + context captured
`;

  const prompt = `You are a senior UX researcher and product designer who has just watched 4 users go through a new workflow onboarding flow.

${onboardingFlowDescription}

Here are the 4 session transcripts with audit results:

${runSummaries.join("\n")}

Based on what you observed, write a thorough UX and product critique. Return JSON:
{
  "summary": "2-3 sentence executive summary of the overall health of this onboarding flow",
  "overallHealthScore": 0-100,
  "frictionPoints": [
    {
      "step": "welcome" | "connect" | "tools" | "narration" | "done",
      "issue": "what the friction is",
      "frequency": "seen in X/4 runs",
      "severity": "high" | "medium" | "low",
      "suggestedFix": "specific actionable fix"
    }
  ],
  "personaInsights": [
    {
      "archetype": "which user type",
      "specificIssue": "issue specific to this archetype",
      "recommendation": "what to do for them"
    }
  ],
  "topRecommendations": [
    "5 priority-ranked actionable recommendations — each a complete sentence"
  ],
  "stepsThatWorked": ["steps that performed well"],
  "stepsToRethink": ["steps that need redesign"],
  "unexpectedFindings": ["things you observed that you didn't expect — important surprises"]
}

Be specific. Reference actual personas and data from the runs. Don't give generic UX advice.
Return ONLY the JSON.`;

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Observer: no JSON in response");
  }

  const report = JSON.parse(jsonMatch[0]) as ObserverReport;
  console.log(`  ✓   Observer: health score ${report.overallHealthScore}/100`);
  return report;
}
