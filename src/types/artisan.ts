export type Persona = 'pm' | 'analyst' | 'marketing' | 'designer' | 'sales';
export type ConfidenceLevel = 'verified' | 'inferred' | 'suggested';
export type TaskState = 'detected' | 'active' | 'awaiting' | 'closed';
export type OnboardingStage = 'connect' | 'interview' | 'personalization';

export interface Integration {
  id: 'gmail' | 'drive' | 'sheets' | 'slack';
  name: string;
  valueProp: string;
  connected: boolean;
  scanning: boolean;
  toolsFound: number;
  projectsFound: number;
  scanComplete: boolean;
}

export interface DiscoveredTool {
  name: string;
  category: 'productivity' | 'data' | 'design' | 'marketing' | 'sales' | 'engineering' | 'communication';
  confidence: 'high' | 'medium' | 'low';
  source: Integration['id'];
}

export interface ActiveProject {
  name: string;
  progress?: number;
  lastActivity: string;
  source: string;
}

export interface InterviewAnswer {
  questionId: string;
  verbatim: string;
  selectedChips?: string[];
  selectedOption?: string;
}

export interface CapabilityCard {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaType: 'connect' | 'try' | 'start' | 'check';
  persona: Persona;
  toolsReferenced: string[];
  projectReferenced?: string;
  priority: number;
}

export interface TrustMarker {
  source: string;
  confidence: ConfidenceLevel;
  detail: string;
  timestamp?: string;
}

export interface Task {
  id: string;
  title: string;
  state: TaskState;
  trustMarker: TrustMarker;
  project?: string;
  daysInactive?: number;
  aiOutput?: string;
  cta?: {
    label: string;
    action: string;
  };
}

export interface DailyDelta {
  text: string;
  source: string;
  type: 'mention' | 'update' | 'deadline' | 'new';
}

export interface UserContext {
  name: string;
  persona: Persona | null;
  personaConfidence: 'inferred' | 'corrected';
  connectedIntegrations: Array<Pick<Integration, 'id' | 'name' | 'toolsFound' | 'projectsFound'>>;
  discoveredTools: DiscoveredTool[];
  activeProjects: ActiveProject[];
  interviewAnswers: InterviewAnswer[];
  capabilityCards: CapabilityCard[];
  onboardingComplete: boolean;
  onboardingStage: OnboardingStage;
  tasks: Task[];
  lastRefreshed: string;
  dailyDeltas: DailyDelta[];
}
