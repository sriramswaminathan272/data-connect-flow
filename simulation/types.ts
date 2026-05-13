// ─── Ground truth ─────────────────────────────────────────────────────────────

export interface Collaborator {
  name: string;
  role: string;
  relationship: "manager" | "direct-report" | "peer" | "cross-functional" | "external";
  commsChannel: string;
}

export interface Project {
  name: string;
  codename?: string;
  status: "active" | "winding-down" | "blocked" | "planning";
  description: string;
  tools: string[];
  keyPeople: string[];
}

export interface EmailPattern {
  subject: string;
  sender: string;
  tool?: string;
}

export interface CalendarPattern {
  title: string;
  recurrence: string;
  organizer: string;
  attendees: string[];
  videoLink?: string;
}

export interface PersonaProfile {
  name: string;
  role: string;
  company: string;
  tenure: string;
  reportsTo: string;
  toolStack: string[];
  primaryCommsTools: string[];
  invisibleComms: string[];
  marketingTools: string[]; // GA, Ads, AppsFlyer etc — signals the marketing OAuth path
  projects: Project[];
  collaborators: Collaborator[];
  emailPatterns: EmailPattern[];
  calendarPatterns: CalendarPattern[];
  weekNarrativeSeed: string;
}

export type PersonaRole = "pm" | "analyst" | "marketing";

export interface CompanyProfile {
  id: string;
  companyKey: string;           // groups profiles from the same company
  personaRole: PersonaRole;     // which role this profile represents
  name: string;
  industry: string;
  stage: string;
  size: string;
  city: string;
  archetype: string;
  persona: PersonaProfile;
}

// ─── Onboarding run ───────────────────────────────────────────────────────────

export type OnboardingStep =
  | "welcome"
  | "connect"
  | "mining"
  | "tools"
  | "marketing-connect"   // extra GA/Ads OAuth shown when marketing signals detected
  | "narration"
  | "extracting"
  | "done";

export interface StepOutcome {
  step: OnboardingStep;
  decision: string;
  hesitations: string[];
  input?: string;             // narration text
  toolsSelected?: string[];
  toolsAdded?: string[];
  toolsRemoved?: string[];
  tookMarketingOAuth?: boolean;
  skipped: boolean;
}

export interface SimulatedDiscovery {
  detectedTools: string[];
  falsePositives: string[];
  missedTools: string[];
  marketingSignalsDetected: boolean;
}

export interface ExtractedContext {
  projects: Array<{ name: string; status: string; signal: string }>;
  collaborators: Array<{ name: string; context: string }>;
  blockers: string[];
  toolsMentioned: string[];
  whatsappMentioned: boolean;
}

export interface OnboardingRun {
  companyId: string;
  companyKey: string;
  personaRole: PersonaRole;
  personaName: string;
  steps: StepOutcome[];
  discovery: SimulatedDiscovery;
  completedFlow: boolean;
  finalNarration: string;
  finalConfirmedTools: string[];
  extractedContext: ExtractedContext | null;
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export interface ToolDetectionScore {
  precision: number;
  recall: number;
  f1: number;
  falsePositives: string[];
  falseNegatives: string[];
}

export interface NarrationScore {
  projectsRevealed: string[];
  projectsMissed: string[];
  peopleRevealed: string[];
  toolsRevealedByNarration: string[];
  blockersSurfaced: string[];
  richness: "high" | "medium" | "low";
  richnessReason: string;
}

export interface AuditResult {
  companyId: string;
  companyKey: string;
  personaRole: PersonaRole;
  personaName: string;
  toolDetection: ToolDetectionScore;
  narration: NarrationScore;
  overallDiscoveryScore: number;
  criticalGaps: string[];
  whatWorkedWell: string[];
}

// ─── Observer ─────────────────────────────────────────────────────────────────

export interface FrictionPoint {
  step: OnboardingStep;
  issue: string;
  frequency: string;
  severity: "high" | "medium" | "low";
  suggestedFix: string;
}

export interface RoleInsight {
  role: PersonaRole;
  pattern: string;
  recommendation: string;
}

export interface CompanyInsight {
  companyKey: string;
  companyName: string;
  crossRolePattern: string;
  recommendation: string;
}

export interface ObserverReport {
  summary: string;
  overallHealthScore: number;
  frictionPoints: FrictionPoint[];
  roleInsights: RoleInsight[];
  companyInsights: CompanyInsight[];
  topRecommendations: string[];
  stepsThatWorked: string[];
  stepsToRethink: string[];
  unexpectedFindings: string[];
}

// ─── Full result ──────────────────────────────────────────────────────────────

export interface SimulationResult {
  runId: string;
  runAt: string;
  companies: CompanyProfile[];
  runs: OnboardingRun[];
  audits: AuditResult[];
  observerReport: ObserverReport;
}
