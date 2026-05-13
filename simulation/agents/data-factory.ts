// DataFactory: returns pre-built faker profiles — deterministic, no LLM needed for ground truth.
// The LLM is reserved for simulation behaviour (PersonaRunner) and synthesis (Observer).
import { ALL_PROFILES } from "../faker/index.js";
import type { CompanyProfile } from "../types.js";

export async function runDataFactory(): Promise<CompanyProfile[]> {
  console.log(`🏭  DataFactory: loading ${ALL_PROFILES.length} profiles across 5 companies...`);
  ALL_PROFILES.forEach((p) =>
    console.log(`    ${p.companyKey} / ${p.personaRole}: ${p.persona.name} — ${p.persona.role}`)
  );
  console.log(`✓  DataFactory: ready\n`);
  return ALL_PROFILES;
}
