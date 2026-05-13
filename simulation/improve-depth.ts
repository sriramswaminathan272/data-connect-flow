/**
 * Automated depth improvement loop.
 * Runs check-depth, identifies weakest personas, uses Claude to generate targeted fixes,
 * writes improvements back to faker files, repeats until score ≥ target or max iterations.
 *
 * Run: npm run improve-depth
 */
import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { ALL_PROFILES } from "./faker/index.js";
import type { CompanyProfile } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const client = new Anthropic();

const FAKER_FILES: Record<string, string> = {
  feastrunner: join(__dirname, "faker/swiggy-like.ts"),
  bitvault: join(__dirname, "faker/coinswitch-like.ts"),
  mediconnect: join(__dirname, "faker/practo-like.ts"),
  quickcart: join(__dirname, "faker/flipkart-like.ts"),
  swiftship: join(__dirname, "faker/delhivery-like.ts"),
};

function runDepthChecker(): string {
  try {
    return execSync("npx tsx simulation/check-depth.ts", {
      cwd: join(__dirname, ".."),
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string };
    return (e.stdout ?? "") + (e.stderr ?? "");
  }
}

function extractScore(output: string): number {
  const m = output.match(/Avg depth score:\s+(\d+)\/100/);
  return m ? parseInt(m[1], 10) : 0;
}

function extractWarnings(output: string): Array<{ persona: string; warnings: string[] }> {
  const results: Array<{ persona: string; warnings: string[] }> = [];
  const lines = output.split("\n");
  let currentPersona = "";
  let currentWarnings: string[] = [];

  for (const line of lines) {
    // Match persona header lines — role is padded with spaces: [PM       ], [ANALYST  ], [MARKETING]
    const isPersonaLine = /[✅⚠️❌]/.test(line) && /\[(PM|ANALYST|MARKETING)/.test(line);
    if (isPersonaLine) {
      if (currentPersona && currentWarnings.length > 0) {
        results.push({ persona: currentPersona, warnings: [...currentWarnings] });
      }
      const nameMatch = line.match(/[✅⚠️❌]\s+([\w\s]+?)\s+\[/);
      currentPersona = nameMatch ? nameMatch[1].trim() : "";
      currentWarnings = [];
    } else if ((line.includes("⚠") || line.includes("⛔")) && currentPersona) {
      // Only accumulate warning-body lines, not persona header lines
      currentWarnings.push(line.trim());
    }
  }
  if (currentPersona && currentWarnings.length > 0) {
    results.push({ persona: currentPersona, warnings: currentWarnings });
  }
  return results;
}

async function generateFix(
  profile: CompanyProfile,
  warnings: string[],
  currentFileContent: string
): Promise<{ section: "emailPatterns" | "calendarPatterns" | "weekNarrativeSeed"; fix: string } | null> {
  const persona = profile.persona;

  const emailableSingleTools = persona.emailPatterns
    .reduce((acc, e) => { if (e.tool) acc.set(e.tool, (acc.get(e.tool) ?? 0) + 1); return acc; }, new Map<string, number>())
    ;
  const fragileTools = [...emailableSingleTools.entries()].filter(([, c]) => c === 1).map(([t]) => t);
  const alwaysMissedTools = persona.toolStack.filter(t => !emailableSingleTools.has(t));
  const emailableMissed = alwaysMissedTools.filter(t =>
    !["Python", "Jupyter", "Google Sheets", "Excel", "Spreadsheet", "Spark", "Hive", "BigQuery", "Redshift"].includes(t)
  );

  const prompt = `You are improving TypeScript faker data for a simulation. Fix ONE issue for this persona.

PERSONA: ${persona.name}, ${persona.role} at ${profile.name} (${profile.archetype})
NARRATIVE (${persona.weekNarrativeSeed.split(/\s+/).length} words): "${persona.weekNarrativeSeed}"
FRAGILE TOOLS (only 1 email each): ${fragileTools.join(", ") || "none"}
ALWAYS MISSED (no emails, but could have): ${emailableMissed.join(", ") || "none"}

WARNINGS:
${warnings.map(w => `  ${w}`).join("\n")}

PRIORITY ORDER — pick the first that applies:

PRIORITY 1 — if warnings mention "no specific numbers/metrics": rewrite weekNarrativeSeed with concrete numbers (%, ₹ amounts, user counts, timeframes, KPIs). Keep 80-120 words. Indian tech context.

PRIORITY 2 — if ALWAYS MISSED list has tools that send email notifications (Slack, Jira, Confluence, GitHub, PagerDuty, Clevertap, Outreach DO send emails): add 1-2 email patterns for them.

PRIORITY 3 — if FRAGILE TOOLS has 4+ entries: add 1 extra email for 2-3 of them to strengthen detection signal.

You MUST return valid JSON — no explanation, no markdown fences, just the JSON object:
{"section":"weekNarrativeSeed","fix":"...narrative text..."}
or
{"section":"emailPatterns","fix":"[{ subject: \\"...\\", sender: \\"...\\", tool: \\"...\\" }]"}

Narrative fix → "fix" is the plain text string.
Email fix → "fix" is a valid TypeScript array literal string (single or double quotes OK).`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.log(`   ⚠  LLM returned non-JSON: ${text.slice(0, 120)}`);
      return null;
    }
    return JSON.parse(match[0]) as { section: "emailPatterns" | "calendarPatterns" | "weekNarrativeSeed"; fix: string };
  } catch (err) {
    console.log(`   ⚠  API error: ${String(err).slice(0, 200)}`);
    return null;
  }
}

function applyFix(
  filePath: string,
  personaName: string,
  section: "emailPatterns" | "calendarPatterns" | "weekNarrativeSeed",
  fix: string
): boolean {
  let content = readFileSync(filePath, "utf-8");

  if (section === "weekNarrativeSeed") {
    // Find the weekNarrativeSeed for this persona and replace it
    const personaBlock = content.indexOf(`name: "${personaName}"`);
    if (personaBlock === -1) return false;
    const seedStart = content.indexOf('weekNarrativeSeed: "', personaBlock);
    if (seedStart === -1) return false;
    const seedEnd = content.indexOf('",\n  }', seedStart);
    if (seedEnd === -1) return false;
    const oldSeed = content.slice(seedStart, seedEnd + 3);
    const newSeed = `weekNarrativeSeed: "${fix.replace(/"/g, '\\"')}"`;
    content = content.replace(oldSeed, newSeed);
  } else if (section === "emailPatterns") {
    // Find the closing of emailPatterns for this persona and inject before it
    const personaBlock = content.indexOf(`name: "${personaName}"`);
    if (personaBlock === -1) return false;
    const emailStart = content.indexOf("emailPatterns: [", personaBlock);
    if (emailStart === -1) return false;
    const calStart = content.indexOf("calendarPatterns: [", emailStart);
    if (calStart === -1) return false;
    // Find the closing ], just before calendarPatterns
    const insertPos = content.lastIndexOf("],\n", calStart) + 1;
    if (insertPos === 0) return false;
    // Parse the fix array and add entries
    const newEntries = fix.trim().replace(/^\[/, "").replace(/\]$/, "").trim();
    content = content.slice(0, insertPos) + "\n      " + newEntries + content.slice(insertPos);
  }

  writeFileSync(filePath, content, "utf-8");
  return true;
}

async function improvementLoop(targetScore = 88, maxIterations = 3) {
  console.log("\n🔄  Depth Improvement Loop\n" + "━".repeat(50));

  for (let iter = 1; iter <= maxIterations; iter++) {
    console.log(`\n── Iteration ${iter}/${maxIterations} ──`);

    const depthOutput = runDepthChecker();
    const score = extractScore(depthOutput);
    console.log(`   Depth score: ${score}/100 (target: ${targetScore})`);

    if (score >= targetScore) {
      console.log("   ✅ Target score reached — stopping.");
      break;
    }

    const allWarnings = extractWarnings(depthOutput);
    const toFix = allWarnings
      .filter((w) => w.warnings.length > 0)
      .sort((a, b) => b.warnings.length - a.warnings.length)
      .slice(0, 3);

    if (toFix.length === 0) {
      console.log("   No actionable warnings — stopping.");
      break;
    }

    for (const { persona: personaName, warnings } of toFix) {
      console.log(`\n   Fixing ${personaName}: ${warnings.length} warning(s)`);

      const profile = ALL_PROFILES.find((p) => p.persona.name === personaName);
      if (!profile) { console.log(`   ⚠  Profile not found for ${personaName}`); continue; }

      const filePath = FAKER_FILES[profile.companyKey];
      if (!filePath) { console.log(`   ⚠  No file mapping for ${profile.companyKey}`); continue; }

      const fileContent = readFileSync(filePath, "utf-8");
      const suggestion = await generateFix(profile, warnings, fileContent);
      if (!suggestion) { console.log(`   ⚠  LLM returned no suggestion for ${personaName}`); continue; }

      const applied = applyFix(filePath, personaName, suggestion.section, suggestion.fix);
      console.log(`   ${applied ? "✓" : "✗"}   Applied ${suggestion.section} fix for ${personaName}`);
    }

    console.log("\n   Re-running depth check...");
  }

  // Final check
  const finalOutput = runDepthChecker();
  const finalScore = extractScore(finalOutput);
  console.log(`\n${"━".repeat(50)}`);
  console.log(`Final depth score: ${finalScore}/100`);
  if (finalScore < targetScore) {
    console.log(`⚠  Did not reach target ${targetScore} — manual review needed for remaining warnings.`);
  } else {
    console.log(`✅  Target achieved.`);
  }
}

improvementLoop().catch((err) => {
  console.error("Improvement loop failed:", err);
  process.exit(1);
});
