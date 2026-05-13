import Anthropic from "@anthropic-ai/sdk";
import type {
  CompanyProfile,
  OnboardingRun,
  SimulatedDiscovery,
  StepOutcome,
} from "../types.js";

const client = new Anthropic();

// Simulate what the mining step would find given the persona's email patterns.
// ~80% recall, occasional false positives to make it realistic.
function simulateMining(profile: CompanyProfile): SimulatedDiscovery {
  const groundTruth = profile.persona.toolStack;
  const revealedByEmail = new Set(
    profile.persona.emailPatterns
      .filter((e) => e.tool)
      .map((e) => e.tool as string)
  );
  const revealedByCalendar = new Set(
    profile.persona.calendarPatterns
      .filter((c) => c.videoLink)
      .map((c) => (c.videoLink!.includes("zoom") ? "Zoom" : "Google Meet"))
  );

  const detected = [...new Set([...revealedByEmail, ...revealedByCalendar])];
  // Inject 1-2 plausible false positives (tools the company uses org-wide but persona doesn't)
  const plausibleFP = ["Confluence", "Jira", "Slack", "Teams", "Notion"].filter(
    (t) => !groundTruth.includes(t)
  );
  const falsePositives = plausibleFP.slice(0, 1);
  const allDetected = [...detected, ...falsePositives];

  const missedTools = groundTruth.filter((t) => !allDetected.includes(t));

  return {
    detectedTools: allDetected,
    falsePositives,
    missedTools,
  };
}

async function runPersonaStep(
  persona: CompanyProfile["persona"],
  discovery: SimulatedDiscovery,
  stepName: string,
  stepContext: string,
  previousSteps: StepOutcome[]
): Promise<StepOutcome> {
  const systemPrompt = `You are ${persona.name}, ${persona.role} at ${persona.company}.

Your actual tool stack: ${persona.toolStack.join(", ")}
Your current projects: ${persona.projects.map((p) => `${p.name} (${p.status})`).join(", ")}
Your key collaborators: ${persona.collaborators.map((c) => `${c.name} (${c.role})`).join(", ")}
Your week so far: ${persona.weekNarrativeSeed}

You are a busy, slightly distracted PM. You have moderate trust in new tools. You may:
- Miss confirming 1-2 tools you actually use (busy, didn't notice)
- Be somewhat vague in your week narration (real people are not perfectly articulate)
- Have slight hesitation about sharing Gmail access
- Mention WhatsApp or informal comms in narration even though the tool can't see them

Be realistic, not perfect.`;

  const userPrompt = `You are on the "${stepName}" step of a workflow onboarding.

${stepContext}

Previous steps: ${
    previousSteps.length === 0
      ? "none"
      : previousSteps.map((s) => `${s.step}: ${s.decision}`).join("; ")
  }

Respond with a JSON object:
{
  "step": "${stepName}",
  "decision": "what you decided or did (1-2 sentences)",
  "hesitations": ["any concerns or uncertainties you had — can be empty array"],
  ${stepName === "narration" ? '"input": "your actual narration text (3-6 sentences, realistic PM voice)",' : ""}
  ${stepName === "tools" ? `"toolsSelected": ["tools you confirmed from the detected list"],
  "toolsAdded": ["tools you manually added that were missing"],
  "toolsRemoved": ["tools you unchecked because they're wrong"],` : ""}
  "skipped": false
}

Return ONLY the JSON object.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      step: stepName as StepOutcome["step"],
      decision: "proceeded",
      hesitations: [],
      skipped: false,
    };
  }
  return JSON.parse(jsonMatch[0]) as StepOutcome;
}

export async function runPersonaAgent(company: CompanyProfile): Promise<OnboardingRun> {
  const { persona } = company;
  console.log(`  👤  PersonaRunner [${persona.name} @ ${company.name}]...`);

  const discovery = simulateMining(company);
  const steps: StepOutcome[] = [];

  // Step 1: Welcome
  steps.push(
    await runPersonaStep(
      persona,
      discovery,
      "welcome",
      `You see a screen that says: "Map your workflow — connect Gmail + Calendar (one click), detect the tools your team uses, then tell us about your week in plain language. Takes about 5 minutes."
Get started button is shown.`,
      []
    )
  );

  // Step 2: Connect
  steps.push(
    await runPersonaStep(
      persona,
      discovery,
      "connect",
      `You see a Google OAuth button with these details:
- Gmail: "we read sender/recipient patterns and notification subject lines to detect your tool stack"
- Calendar: "we read organizer, recurrence, and video link domains"
- We won't: read email body content, store credentials, share with your employer.`,
      steps
    )
  );

  // Step 3: Tools confirmation
  const detectedList = discovery.detectedTools.join(", ");
  steps.push(
    await runPersonaStep(
      persona,
      discovery,
      "tools",
      `The system detected these tools from your email and calendar: ${detectedList}.
You see each as a toggleable card. You can uncheck wrong ones and add missing ones.
Your actual tool stack for reference (you know this as the user): ${persona.toolStack.join(", ")}`,
      steps
    )
  );

  const toolsStep = steps.find((s) => s.step === "tools");
  const confirmedTools = [
    ...(toolsStep?.toolsSelected ?? discovery.detectedTools),
    ...(toolsStep?.toolsAdded ?? []),
  ].filter((t) => !(toolsStep?.toolsRemoved ?? []).includes(t));

  // Step 4: Narration
  steps.push(
    await runPersonaStep(
      persona,
      discovery,
      "narration",
      `You see a text box with prompts: "What did you actually work on last week? What are you trying to move forward this week? Who do you talk to most? What's stuck?"
Your week seed for reference: ${persona.weekNarrativeSeed}`,
      steps
    )
  );

  const narrationStep = steps.find((s) => s.step === "narration");

  console.log(`  ✓   PersonaRunner [${persona.name}] complete`);

  return {
    companyId: company.id,
    personaName: persona.name,
    steps,
    discovery,
    completedFlow: true,
    finalNarration: narrationStep?.input ?? "",
    finalConfirmedTools: confirmedTools,
  };
}
