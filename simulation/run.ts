#!/usr/bin/env tsx
// Usage: ANTHROPIC_API_KEY=sk-... npx tsx simulation/run.ts
import { runSimulation } from "./orchestrator.js";

runSimulation().catch((err) => {
  console.error("Simulation failed:", err);
  process.exit(1);
});
