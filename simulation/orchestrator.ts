import { runDataFactory } from "./agents/data-factory.js";
import { runPersonaAgent } from "./agents/persona-runner.js";
import { runAuditorAgent } from "./agents/auditor.js";
import { runObserverAgent } from "./agents/observer.js";
import type { AuditResult, OnboardingRun, SimulationResult } from "./types.js";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export async function runSimulation(): Promise<SimulationResult> {
  const runId = `sim-${Date.now()}`;
  console.log(`\n🚀  Starting simulation: ${runId}`);
  console.log(`    15 personas × 4 agents\n`);

  // ── Agent 1: DataFactory (no LLM — instant) ───────────────────────────────
  console.log("━━ Step 1/4 — DataFactory ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  const companies = await runDataFactory();

  // ── Agent 2: PersonaRunner — sequential to respect rate limits ────────────
  console.log("━━ Step 2/4 — PersonaRunner (15 personas) ━━━━━━━━━━━━━━━━━━━━━");
  const runs: OnboardingRun[] = [];
  for (const company of companies) {
    try {
      const run = await runPersonaAgent(company);
      runs.push(run);
    } catch (err) {
      console.error(`  ✗   PersonaRunner [${company.persona.name}] failed: ${err}`);
      // Push a failed run placeholder so auditor indices stay aligned
      runs.push({
        companyId: company.id,
        companyKey: company.companyKey,
        personaRole: company.personaRole,
        personaName: company.persona.name,
        steps: [],
        discovery: { detectedTools: [], falsePositives: [], missedTools: company.persona.toolStack, marketingSignalsDetected: false },
        completedFlow: false,
        finalNarration: "",
        finalConfirmedTools: [],
        extractedContext: null,
      });
    }
  }

  // ── Agent 3: AuditorAgent — parallel across completed runs ────────────────
  console.log("\n━━ Step 3/4 — AuditorAgent (15 audits) ━━━━━━━━━━━━━━━━━━━━━━━");
  const auditPromises = runs.map((run, i) =>
    runAuditorAgent(companies[i], run).catch((err): AuditResult => {
      console.error(`  ✗   Auditor [${run.personaName}] failed: ${err}`);
      return {
        companyId: run.companyId,
        companyKey: run.companyKey,
        personaRole: run.personaRole,
        personaName: run.personaName,
        toolDetection: { precision: 0, recall: 0, f1: 0, falsePositives: [], falseNegatives: companies[i].persona.toolStack },
        narration: { projectsRevealed: [], projectsMissed: [], peopleRevealed: [], toolsRevealedByNarration: [], blockersSurfaced: [], richness: "low", richnessReason: "Audit failed" },
        overallDiscoveryScore: 0,
        criticalGaps: ["Audit agent failed — see logs"],
        whatWorkedWell: [],
      };
    })
  );
  const audits = await Promise.all(auditPromises);

  // ── Agent 4: ObserverAgent ────────────────────────────────────────────────
  console.log("\n━━ Step 4/4 — ObserverAgent ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  const observerReport = await runObserverAgent(companies, runs, audits);

  const result: SimulationResult = {
    runId,
    runAt: new Date().toISOString(),
    companies,
    runs,
    audits,
    observerReport,
  };

  // ── Write results ─────────────────────────────────────────────────────────
  const resultsDir = join(__dirname, "results");
  ensureDir(resultsDir);
  writeFileSync(join(resultsDir, `${runId}.json`), JSON.stringify(result, null, 2));

  // Write to public/ so the React dashboard can fetch it at runtime
  const publicDir = join(__dirname, "..", "public", "simulation-results");
  ensureDir(publicDir);
  writeFileSync(join(publicDir, "latest.json"), JSON.stringify(result, null, 2));

  const avgScore = Math.round(audits.reduce((s, a) => s + a.overallDiscoveryScore, 0) / audits.length);
  console.log(`\n✅  Simulation complete.`);
  console.log(`    Average discovery score: ${avgScore}/100`);
  console.log(`    Observer health score: ${result.observerReport.overallHealthScore}/100`);
  console.log(`    Results → simulation/results/${runId}.json`);
  console.log(`    Dashboard data → public/simulation-results/latest.json\n`);

  return result;
}
