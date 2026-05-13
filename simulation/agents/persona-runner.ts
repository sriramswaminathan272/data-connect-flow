import Anthropic from "@anthropic-ai/sdk";
import type {
  CompanyProfile,
  ExtractedContext,
  OnboardingRun,
  SimulatedDiscovery,
  StepOutcome,
} from "../types.js";

const client = new Anthropic();

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeParseJSON<T>(text: string, fallback: T): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return fallback;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return fallback;
  }
}

async function callLLM(system: string, user: string, maxTokens = 800): Promise<string> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

// ── Simulate tool detection from email/calendar patterns ──────────────────────

function simulateMining(profile: CompanyProfile): SimulatedDiscovery {
  const groundTruth = new Set(profile.persona.toolStack);

  // Count email signal strength per tool (more emails = stronger signal)
  const emailSignals = new Map<string, number>();
  for (const ep of profile.persona.emailPatterns) {
    if (ep.tool) emailSignals.set(ep.tool, (emailSignals.get(ep.tool) ?? 0) + 1);
  }

  // Probabilistic detection: weak signal (1 email) is missed ~35% of the time,
  // simulating real-world inbox noise, spam filtering, and notification opt-outs.
  const detectedSet = new Set<string>();
  for (const [tool, count] of emailSignals) {
    const detectProb = count === 1 ? 0.65 : count === 2 ? 0.85 : 0.95;
    if (Math.random() < detectProb) detectedSet.add(tool);
  }

  // Calendar-based video tool detection (deterministic — video links are reliable)
  for (const cp of profile.persona.calendarPatterns) {
    if (cp.videoLink?.includes("zoom")) detectedSet.add("Zoom");
    else if (cp.videoLink?.includes("meet.google")) detectedSet.add("Google Meet");
    else if (cp.videoLink?.includes("teams")) detectedSet.add("Microsoft Teams");
  }

  const detected = Array.from(detectedSet);

  // Plausible false positives: tools near the detected set that the persona doesn't use
  const plausibleFP = ["Confluence", "Jira", "Notion", "Linear", "Slack", "Teams", "HubSpot"]
    .filter((t) => !groundTruth.has(t))
    .slice(0, 1);

  const allDetected = [...detected, ...plausibleFP];
  const missedTools = Array.from(groundTruth).filter((t) => !allDetected.includes(t));
  const marketingSignalsDetected = allDetected.some((t) =>
    ["Google Ads", "Meta Ads", "AppsFlyer", "CleverTap", "Klaviyo", "HubSpot", "SEMrush", "LinkedIn Ads", "Outreach", "Salesforce Marketing Cloud"].includes(t)
  );

  return {
    detectedTools: allDetected,
    falsePositives: plausibleFP,
    missedTools,
    marketingSignalsDetected,
  };
}

// ── Simulate one onboarding step ──────────────────────────────────────────────

async function runStep(
  persona: CompanyProfile["persona"],
  companyName: string,
  personaRole: string,
  discovery: SimulatedDiscovery,
  stepName: string,
  stepContext: string,
  previousSteps: StepOutcome[]
): Promise<StepOutcome> {
  const system = `You are ${persona.name}, ${persona.role} at ${companyName}.
Real tool stack: ${persona.toolStack.join(", ")}
Invisible comms (tools system can't see): ${persona.invisibleComms.join(", ")}
Current projects: ${persona.projects.map((p) => `${p.name} (${p.status})`).join(", ")}
Key collaborators: ${persona.collaborators.map((c) => c.name).join(", ")}
Your week: ${persona.weekNarrativeSeed}

You are a busy ${personaRole}. Be realistic — occasionally miss confirming a tool, be somewhat vague in narration, have honest privacy hesitations about Gmail access.`;

  const toolsCtx =
    stepName === "tools"
      ? `\ntools fields: "toolsSelected" (from detected list you keep), "toolsAdded" (ones you add), "toolsRemoved" (ones you uncheck)`
      : "";
  const narrationCtx = stepName === "narration" ? `\n"input" field: your actual narration text (4-6 realistic sentences in first person)` : "";
  const marketingCtx =
    stepName === "marketing-connect"
      ? `\n"tookMarketingOAuth" field: true/false — did you connect Google Analytics/Ads?`
      : "";

  const user = `Step: "${stepName}"

${stepContext}

Previous steps: ${previousSteps.length === 0 ? "none" : previousSteps.map((s) => `[${s.step}] ${s.decision}`).join(" → ")}

Return only JSON:
{
  "step": "${stepName}",
  "decision": "what you decided (1-2 sentences)",
  "hesitations": ["any concerns — empty array if none"]${toolsCtx}${narrationCtx}${marketingCtx},
  "skipped": false
}`;

  const raw = await callLLM(system, user);
  const fallback: StepOutcome = { step: stepName as StepOutcome["step"], decision: "proceeded", hesitations: [], skipped: false };
  return safeParseJSON(raw, fallback);
}

// ── Extract context from narration ────────────────────────────────────────────

async function extractContext(narration: string, persona: CompanyProfile["persona"]): Promise<ExtractedContext> {
  if (!narration || narration.trim().length < 20) {
    return { projects: [], collaborators: [], blockers: [], toolsMentioned: [], whatsappMentioned: false };
  }

  const prompt = `Extract structured work context from this narration. Be specific — only extract what's actually mentioned.

NARRATION: "${narration}"

Return JSON:
{
  "projects": [{ "name": "project name mentioned", "status": "active/blocked/winding-down", "signal": "one quoted phrase from narration that revealed this" }],
  "collaborators": [{ "name": "person mentioned", "context": "how they were mentioned" }],
  "blockers": ["specific blocker or stuck item mentioned"],
  "toolsMentioned": ["tools explicitly named in narration"],
  "whatsappMentioned": true/false
}

Return only JSON.`;

  const raw = await callLLM("You are a context extraction assistant.", prompt, 600);
  return safeParseJSON(raw, {
    projects: [],
    collaborators: [],
    blockers: [],
    toolsMentioned: [],
    whatsappMentioned: false,
  });
}

// ── Main persona run ──────────────────────────────────────────────────────────

export async function runPersonaAgent(company: CompanyProfile): Promise<OnboardingRun> {
  const { persona } = company;
  const tag = `${company.personaRole} @ ${company.name}`;
  console.log(`  👤  PersonaRunner [${persona.name} — ${tag}]...`);

  const discovery = simulateMining(company);
  const steps: StepOutcome[] = [];

  // Step 1: Welcome
  steps.push(await runStep(persona, company.name, company.personaRole, discovery, "welcome",
    `Screen: "Map your workflow — connect Gmail + Calendar (one click), we detect your tools, then you tell us about your week. Takes 5 minutes." Get started button is shown.`,
    []));

  // Step 2: Connect
  steps.push(await runStep(persona, company.name, company.personaRole, discovery, "connect",
    `Screen shows Google OAuth button. We explain: Gmail read = notification subjects + sender patterns to detect tool stack. Calendar read = organizer, recurrence, video link domains. We explicitly say: we do NOT read email body content, do NOT store credentials, do NOT share with employer.`,
    steps));

  // Step 3: Tools confirmation
  steps.push(await runStep(persona, company.name, company.personaRole, discovery, "tools",
    `We detected these tools from your email/calendar: ${discovery.detectedTools.join(", ")}. Each shows as a toggleable card with the source (e.g. "from [Linear] notifications"). You can uncheck wrong ones and add missing ones from a suggestion list. Your real tool stack for reference: ${persona.toolStack.join(", ")}`,
    steps));

  // Step 4: Marketing OAuth (only if marketing signals detected)
  if (discovery.marketingSignalsDetected || company.personaRole === "marketing") {
    steps.push(await runStep(persona, company.name, company.personaRole, discovery, "marketing-connect",
      `We detected marketing tools (${discovery.detectedTools.filter(t => ["Google Ads","Meta Ads","AppsFlyer","CleverTap","Klaviyo","HubSpot","LinkedIn Ads","SEMrush"].includes(t)).join(", ")}). We offer: "Connect Google Analytics & Ads for 5x richer campaign context — see which campaigns drove your projects." This is optional and separate from the earlier Gmail grant.`,
      steps));
  }

  // Step 5: Narration
  steps.push(await runStep(persona, company.name, company.personaRole, discovery, "narration",
    `Free-text box with guided prompts: "What did you actually work on last week? What are you trying to move forward this week? Who do you talk to most? What's stuck?" Your real week for reference: ${persona.weekNarrativeSeed}`,
    steps));

  const narrationStep = steps.find((s) => s.step === "narration");
  const finalNarration = narrationStep?.input ?? "";

  // Step 6: Context extraction (silent — no UI step shown, just processed)
  const extractedContext = await extractContext(finalNarration, persona);

  // Compute final confirmed tools
  const toolsStep = steps.find((s) => s.step === "tools");
  const selected = toolsStep?.toolsSelected ?? discovery.detectedTools.filter((t) => !discovery.falsePositives.includes(t));
  const added = toolsStep?.toolsAdded ?? [];
  const removed = toolsStep?.toolsRemoved ?? [];
  const finalConfirmedTools = [...new Set([...selected, ...added])].filter((t) => !removed.includes(t));

  console.log(`  ✓   PersonaRunner [${persona.name}] — ${finalConfirmedTools.length} tools, narration ${finalNarration.length} chars`);

  return {
    companyId: company.id,
    companyKey: company.companyKey,
    personaRole: company.personaRole,
    personaName: persona.name,
    steps,
    discovery,
    completedFlow: true,
    finalNarration,
    finalConfirmedTools,
    extractedContext,
  };
}
