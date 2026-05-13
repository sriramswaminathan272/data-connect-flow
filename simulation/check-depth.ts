/**
 * Depth auditor for faker persona profiles.
 * Run: npm run check-depth
 * Reports on tool coverage, noise ratio, calendar density, narrative richness,
 * and cross-company name consistency. Fails with exit code 1 if data is too shallow.
 */
import { ALL_PROFILES } from "./faker/index.js";
import type { CompanyProfile } from "./types.js";

interface AuditRow {
  personaName: string;
  company: string;
  role: string;
  score: number;
  recallCeiling: number;       // max recall achievable given email patterns (%)
  singleEmailTools: string[];  // tools with only 1 email pattern (fragile detection)
  undetectable: string[];      // tools in stack with NO email pattern
  noiseRatio: number;          // % of emails with no tool field (inbox realism)
  calendarCount: number;
  narrativeWords: number;
  narrativeHasMetrics: boolean;
  narrativeHasBlocker: boolean;
  narrativePeopleCount: number;
  crossReferenced: number;     // collaborators that appear in same-company profiles
  warnings: string[];
}

function auditProfile(profile: CompanyProfile): AuditRow {
  const { persona } = profile;

  // ── Email signal analysis ─────────────────────────────────────────────────
  const emailCountByTool = new Map<string, number>();
  for (const ep of persona.emailPatterns) {
    if (ep.tool) emailCountByTool.set(ep.tool, (emailCountByTool.get(ep.tool) ?? 0) + 1);
  }
  const toolsWithEmail = new Set(emailCountByTool.keys());
  const undetectable = persona.toolStack.filter((t) => !toolsWithEmail.has(t));
  const singleEmailTools = [...emailCountByTool.entries()]
    .filter(([, c]) => c === 1)
    .map(([t]) => t);
  const noiseEmails = persona.emailPatterns.filter((e) => !e.tool);
  const noiseRatio = persona.emailPatterns.length > 0
    ? Math.round((noiseEmails.length / persona.emailPatterns.length) * 100)
    : 0;

  // Recall ceiling: if every email-pattern tool were detected, what's max recall?
  const recallCeiling = persona.toolStack.length > 0
    ? Math.round((toolsWithEmail.size / persona.toolStack.length) * 100)
    : 0;

  // ── Calendar analysis ─────────────────────────────────────────────────────
  const calendarCount = persona.calendarPatterns.length;

  // ── Narrative richness ────────────────────────────────────────────────────
  const seed = persona.weekNarrativeSeed;
  const narrativeWords = seed.split(/\s+/).length;
  // Catch: percentages, rupee amounts, AUC scores, sample sizes (n=X), NPS values,
  // cohort labels (D7/D30), decimal metrics (0.83), and 2+ digit numbers in context
  const narrativeHasMetrics = /\d+\.?\d*\s*%|₹\s*\d+|\bAUC\b|\bn=\d|\bNPS\b.*\d|[Dd]\d+\b|\d{2,}\s*(users|events|pp\b|x\b|days|hours|leads)|0\.\d+/.test(seed);
  const narrativeHasBlocker = /block|stuck|wait|delay|pending|not yet|behind|couldn't|can't|missing/i.test(seed);
  const narrativePeopleCount = persona.collaborators.filter((c) =>
    seed.includes(c.name.split(" ")[0])
  ).length;

  // ── Cross-company name consistency ────────────────────────────────────────
  const sameCompany = ALL_PROFILES.filter(
    (p) => p.companyKey === profile.companyKey && p.id !== profile.id
  );
  const crossReferenced = persona.collaborators.filter((c) =>
    sameCompany.some(
      (p) =>
        p.persona.name === c.name ||
        p.persona.collaborators.some((pc) => pc.name === c.name)
    )
  ).length;

  // ── Score ─────────────────────────────────────────────────────────────────
  const score = Math.min(
    100,
    Math.round(
      (recallCeiling / 100) * 30 +         // max 30: tool detection potential
      (noiseRatio >= 20 ? 20 : noiseRatio) + // max 20: inbox realism
      Math.min(calendarCount * 2, 16) +     // max 16: calendar density (8 events = full)
      (narrativeWords >= 80 ? 14 : (narrativeWords / 80) * 14) + // max 14: narrative length
      (narrativeHasMetrics ? 8 : 0) +       // max 8: specific numbers
      (narrativeHasBlocker ? 6 : 0) +       // max 6: blockers surfaced
      Math.min(crossReferenced * 3, 6)      // max 6: cross-company names
    )
  );

  // ── Warnings ──────────────────────────────────────────────────────────────
  const warnings: string[] = [];
  if (noiseRatio === 0)
    warnings.push("⛔ ZERO noise emails — inbox is 100% tool notifications, unrealistic");
  else if (noiseRatio < 15)
    warnings.push(`⚠  Only ${noiseRatio}% noise emails (target ≥20%)`);
  if (calendarCount < 5)
    warnings.push(`⚠  Only ${calendarCount} calendar events (target ≥7)`);
  if (undetectable.length > 2)
    warnings.push(`⚠  ${undetectable.length} tools ALWAYS missed (no email): ${undetectable.join(", ")}`);
  if (singleEmailTools.length > 3)
    warnings.push(`⚠  ${singleEmailTools.length} tools fragile (1 email each): ${singleEmailTools.join(", ")}`);
  if (narrativeWords < 60)
    warnings.push(`⚠  Narrative seed thin (${narrativeWords} words — target ≥80)`);
  if (!narrativeHasMetrics)
    warnings.push("⚠  Narrative has no specific numbers/metrics — too vague for LLM to echo back richly");
  if (crossReferenced === 0)
    warnings.push("⚠  No collaborators cross-referenced with other personas at this company");

  return {
    personaName: persona.name,
    company: profile.name,
    role: profile.personaRole,
    score,
    recallCeiling,
    singleEmailTools,
    undetectable,
    noiseRatio,
    calendarCount,
    narrativeWords,
    narrativeHasMetrics,
    narrativeHasBlocker,
    narrativePeopleCount,
    crossReferenced,
    warnings,
  };
}

function checkDepth() {
  console.log("\n🔬  Faker Data Depth Audit\n" + "━".repeat(64));

  const results = ALL_PROFILES.map(auditProfile);

  // ── Per-persona output ────────────────────────────────────────────────────
  const companyKeys = [...new Set(ALL_PROFILES.map((p) => p.companyKey))];
  for (const key of companyKeys) {
    const companyName = ALL_PROFILES.find((p) => p.companyKey === key)?.name ?? key;
    console.log(`\n  ${companyName}`);
    console.log("  " + "─".repeat(50));
    const rows = results.filter((r) => {
      const p = ALL_PROFILES.find((p) => p.companyKey === key && p.persona.name === r.personaName);
      return p !== undefined;
    });
    for (const r of rows) {
      const icon = r.score >= 75 ? "✅" : r.score >= 55 ? "⚠️ " : "❌";
      console.log(
        `  ${icon} ${r.personaName.padEnd(22)} [${r.role.toUpperCase().padEnd(9)}] score=${r.score}/100`
      );
      console.log(
        `      Recall ceiling: ${r.recallCeiling}%  |  Noise: ${r.noiseRatio}%  |  Calendar: ${r.calendarCount} events  |  Narrative: ${r.narrativeWords} words`
      );
      if (r.undetectable.length > 0)
        console.log(`      Always missed (no email): ${r.undetectable.join(", ")}`);
      if (r.singleEmailTools.length > 0)
        console.log(`      Fragile (1 email): ${r.singleEmailTools.join(", ")}`);
      for (const w of r.warnings) console.log(`      ${w}`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  const avgRecall = Math.round(results.reduce((s, r) => s + r.recallCeiling, 0) / results.length);
  const avgNoise = Math.round(results.reduce((s, r) => s + r.noiseRatio, 0) / results.length);
  const zeroNoise = results.filter((r) => r.noiseRatio === 0).length;
  const thinCalendar = results.filter((r) => r.calendarCount < 5).length;
  const totalWarnings = results.reduce((s, r) => s + r.warnings.length, 0);

  console.log("\n" + "━".repeat(64));
  console.log(`\n📊  Summary across ${results.length} personas:`);
  console.log(`   Avg depth score:       ${avgScore}/100`);
  console.log(`   Avg recall ceiling:    ${avgRecall}% (max achievable with current email patterns)`);
  console.log(`   Avg noise ratio:       ${avgNoise}% (target ≥20%)`);
  console.log(`   Zero-noise personas:   ${zeroNoise}/${results.length}`);
  console.log(`   Thin calendar (<5):    ${thinCalendar}/${results.length}`);
  console.log(`   Total warnings:        ${totalWarnings}`);

  const verdict =
    avgScore >= 80
      ? "✅  VERDICT: Data depth is sufficient for production simulation."
      : avgScore >= 60
      ? "⚠️   VERDICT: Functional but will show limited variance. Address warnings above."
      : "❌  VERDICT: Data too shallow — simulation will produce unrealistic results.";
  console.log(`\n${verdict}\n`);

  if (avgScore < 60) process.exit(1);
}

checkDepth();
