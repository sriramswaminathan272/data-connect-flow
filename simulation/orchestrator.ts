import { runDataFactory } from "./agents/data-factory.js";
import { runPersonaAgent } from "./agents/persona-runner.js";
import { runAuditorAgent } from "./agents/auditor.js";
import { runObserverAgent } from "./agents/observer.js";
import type { SimulationResult } from "./types.js";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runSimulation(): Promise<SimulationResult> {
  const runId = `sim-${Date.now()}`;
  console.log(`\n🚀  Starting simulation run: ${runId}\n`);

  // ── Agent 1: DataFactory ──────────────────────────────────────────────────
  console.log("Step 1/4 — DataFactory");
  const companies = await runDataFactory();

  // ── Agent 2: PersonaRunner (sequentially to avoid rate limits) ────────────
  console.log("\nStep 2/4 — PersonaRunner (4 personas)");
  const runs = [];
  for (const company of companies) {
    runs.push(await runPersonaAgent(company));
  }

  // ── Agent 3: AuditorAgent (parallel — independent per run) ────────────────
  console.log("\nStep 3/4 — AuditorAgent (4 audits)");
  const audits = await Promise.all(
    runs.map((run, i) => runAuditorAgent(companies[i], run))
  );

  // ── Agent 4: ObserverAgent ────────────────────────────────────────────────
  console.log("\nStep 4/4 — ObserverAgent");
  const observerReport = await runObserverAgent(companies, runs, audits);

  const result: SimulationResult = {
    runId,
    runAt: new Date().toISOString(),
    companies,
    runs,
    audits,
    observerReport,
  };

  // Write result to file so the React dashboard can load it
  const outPath = join(__dirname, "results", `${runId}.json`);
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`\n✅  Simulation complete. Results written to simulation/results/${runId}.json`);

  // Also write as "latest.json" for easy dashboard loading
  const latestPath = join(__dirname, "results", "latest.json");
  writeFileSync(latestPath, JSON.stringify(result, null, 2));
  console.log(`📄  Also saved as simulation/results/latest.json\n`);

  return result;
}
