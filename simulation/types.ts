// ─── Ground truth (what DataFactory generates) ───────────────────────────────

export interface Collaborator {
  name: string;
  role: string;
  relationship: "manager" | "direct-report" | "peer" | "cross-functional" | "external";
  commsChannel: string; // "Slack DMs", "email", "WhatsApp", "standup"
}

export interface Project {
  name: string;
  codename?: string;
  status: "active" | "winding-down" | "blocked" | "planning";
  description: string;
  tools: string[]; // tools specifically used for this project
  keyPeople: string[];
}

export interface EmailPattern {
  subject: string;
  sender: string;
  tool?: string; // tool this notification reveals
}

export interface CalendarPattern {
  title: string;
  recurrence: string;
  organizer: string;
  attendees: string[];
  videoLink?: string; // "zoom.us", "meet.google.com", etc.
}

export interface PersonaProfile {
  name: string;
  role: string;
  company: string;
  tenure: string;
  reportsTo: string;
  toolStack: string[]; // ground truth — every tool they actually use
  primaryCommsTools: string[]; // where most work happens
  invisibleComms: string[]; // WhatsApp, phone, etc. — tools we can't see
  projects: Project[];
  collaborators: Collaborator[];
  emailPatterns: EmailPattern[];
  calendarPatterns: CalendarPattern[];
  weekNarrativeSeed: string; // the "real" week — what the persona agent draws from
}

export interface CompanyProfile {
  id: string;
  name: string;
  industry: string;
  stage: string; // "Series B", "Enterprise", "Seed", etc.
  size: string;
  city: string;
  archetype: string; // "B2C fintech", "B2B SaaS", "early-stage startup", "enterprise"
  persona: PersonaProfile;
}

// ─── Onboarding run (what PersonaRunner produces) ────────────────────────────

export type OnboardingStep =
  | "welcome"
  | "connect"
  | "tools"
  | "narration"
  | "done";

export interface StepOutcome {
  step: OnboardingStep;
  decision: string; // what the persona decided/did
  hesitations: string[]; // concerns or uncertainties the persona had
  input?: string; // for narration step: what they typed
  toolsSelected?: string[]; // for tools step: what they confirmed
  toolsAdded?: string[]; // for tools step: what they manually added
  toolsRemoved?: string[]; // for tools step: what they unchecked
  skipped: boolean;
}

export interface SimulatedDiscovery {
  detectedTools: string[]; // what the "mining" step surfaced
  falsePositives: string[]; // detected but persona doesn't use
  missedTools: string[]; // persona uses but not detected
}

export interface OnboardingRun {
  companyId: string;
  personaName: string;
  steps: StepOutcome[];
  discovery: SimulatedDiscovery;
  completedFlow: boolean;
  dropOffStep?: OnboardingStep;
  finalNarration: string;
  finalConfirmedTools: string[];
}

// ─── Audit result (what AuditorAgent produces) ───────────────────────────────

export interface ToolDetectionScore {
  precision: number; // detected tools that are real / all detected
  recall: number; // real tools detected / all real tools
  f1: number;
  falsePositives: string[];
  falseNegatives: string[];
}

export interface NarrationScore {
  projectsRevealed: string[]; // projects the persona mentioned
  projectsMissed: string[]; // projects they didn't mention
  peopleRevealed: string[];
  toolsRevealedByNarration: string[]; // tools mentioned in narration (not detected by mining)
  blockersSurfaced: string[];
  richness: "high" | "medium" | "low"; // qualitative assessment
}

export interface AuditResult {
  companyId: string;
  personaName: string;
  toolDetection: ToolDetectionScore;
  narration: NarrationScore;
  overallDiscoveryScore: number; // 0-100
  criticalGaps: string[]; // most important things that were missed
  whatWorkedWell: string[];
}

// ─── Observer report (what ObserverAgent produces) ───────────────────────────

export interface FrictionPoint {
  step: OnboardingStep;
  issue: string;
  frequency: string; // "seen in 3/4 runs", "seen in 1/4 runs"
  severity: "high" | "medium" | "low";
  suggestedFix: string;
}

export interface PersonaInsight {
  archetype: string;
  specificIssue: string;
  recommendation: string;
}

export interface ObserverReport {
  summary: string;
  overallHealthScore: number; // 0-100 across all runs
  frictionPoints: FrictionPoint[];
  personaInsights: PersonaInsight[];
  topRecommendations: string[]; // priority-ranked, top 5
  stepsThatWorked: string[];
  stepsToRethink: string[];
  unexpectedFindings: string[];
}

// ─── Full simulation result ───────────────────────────────────────────────────

export interface SimulationResult {
  runId: string;
  runAt: string;
  companies: CompanyProfile[];
  runs: OnboardingRun[];
  audits: AuditResult[];
  observerReport: ObserverReport;
}
