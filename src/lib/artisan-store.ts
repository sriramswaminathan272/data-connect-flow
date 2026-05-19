import {
  UserContext,
  OnboardingStage,
  Persona,
  InterviewAnswer,
  DiscoveredTool,
  CapabilityCard,
  Task,
  DailyDelta,
} from '../types/artisan';

const STORAGE_KEY = 'artisan_user_context';

const DEFAULT_CONTEXT: UserContext = {
  name: '',
  persona: null,
  personaConfidence: 'inferred',
  connectedIntegrations: [],
  discoveredTools: [],
  activeProjects: [],
  interviewAnswers: [],
  capabilityCards: [],
  onboardingComplete: false,
  onboardingStage: 'connect',
  tasks: [],
  lastRefreshed: new Date().toISOString(),
  dailyDeltas: [],
};

export function getContext(): UserContext {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_CONTEXT, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return { ...DEFAULT_CONTEXT };
}

export function saveContext(patch: Partial<UserContext>): UserContext {
  const current = getContext();
  const updated = { ...current, ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearContext(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Simulated tool discovery per integration
export const INTEGRATION_SCAN_RESULTS: Record<string, { tools: DiscoveredTool[]; toolsFound: number; projectsFound: number }> = {
  gmail: {
    toolsFound: 12,
    projectsFound: 3,
    tools: [
      { name: 'Figma', category: 'design', confidence: 'high', source: 'gmail' },
      { name: 'Notion', category: 'productivity', confidence: 'high', source: 'gmail' },
      { name: 'Linear', category: 'productivity', confidence: 'high', source: 'gmail' },
      { name: 'Zoom', category: 'communication', confidence: 'high', source: 'gmail' },
      { name: 'Loom', category: 'communication', confidence: 'high', source: 'gmail' },
      { name: 'GitHub', category: 'engineering', confidence: 'high', source: 'gmail' },
      { name: 'Confluence', category: 'productivity', confidence: 'medium', source: 'gmail' },
      { name: 'Mixpanel', category: 'data', confidence: 'medium', source: 'gmail' },
      { name: 'HubSpot', category: 'sales', confidence: 'medium', source: 'gmail' },
      { name: 'Salesforce', category: 'sales', confidence: 'medium', source: 'gmail' },
      { name: 'Stripe', category: 'engineering', confidence: 'low', source: 'gmail' },
      { name: 'Amplitude', category: 'data', confidence: 'low', source: 'gmail' },
    ],
  },
  slack: {
    toolsFound: 8,
    projectsFound: 5,
    tools: [
      { name: 'Figma', category: 'design', confidence: 'high', source: 'slack' },
      { name: 'GitHub', category: 'engineering', confidence: 'high', source: 'slack' },
      { name: 'Notion', category: 'productivity', confidence: 'high', source: 'slack' },
      { name: 'Linear', category: 'productivity', confidence: 'high', source: 'slack' },
      { name: 'Jira', category: 'productivity', confidence: 'medium', source: 'slack' },
      { name: 'Asana', category: 'productivity', confidence: 'medium', source: 'slack' },
      { name: 'Intercom', category: 'sales', confidence: 'medium', source: 'slack' },
      { name: 'PagerDuty', category: 'engineering', confidence: 'low', source: 'slack' },
    ],
  },
  drive: {
    toolsFound: 5,
    projectsFound: 4,
    tools: [
      { name: 'Figma', category: 'design', confidence: 'high', source: 'drive' },
      { name: 'Loom', category: 'communication', confidence: 'high', source: 'drive' },
      { name: 'Notion', category: 'productivity', confidence: 'medium', source: 'drive' },
      { name: 'Canva', category: 'design', confidence: 'medium', source: 'drive' },
      { name: 'Miro', category: 'design', confidence: 'low', source: 'drive' },
    ],
  },
  sheets: {
    toolsFound: 6,
    projectsFound: 3,
    tools: [
      { name: 'Salesforce', category: 'sales', confidence: 'high', source: 'sheets' },
      { name: 'HubSpot', category: 'marketing', confidence: 'high', source: 'sheets' },
      { name: 'Google Analytics', category: 'marketing', confidence: 'high', source: 'sheets' },
      { name: 'Mixpanel', category: 'data', confidence: 'medium', source: 'sheets' },
      { name: 'Looker', category: 'data', confidence: 'medium', source: 'sheets' },
      { name: 'dbt', category: 'data', confidence: 'low', source: 'sheets' },
    ],
  },
};

export function inferPersona(answers: InterviewAnswer[], tools: string[]): Persona {
  const text = answers.map((a) => `${a.verbatim} ${(a.selectedChips || []).join(' ')}`).join(' ').toLowerCase();
  const toolsLower = tools.map((t) => t.toLowerCase());

  const hasTool = (...names: string[]) => names.some((n) => toolsLower.includes(n.toLowerCase()));

  if (hasTool('salesforce', 'outreach', 'apollo') && !hasTool('hubspot')) return 'sales';
  if (hasTool('figma', 'sketch', 'framer', 'invision') && !hasTool('linear', 'jira')) return 'designer';
  if (hasTool('dbt', 'bigquery', 'redash', 'databricks', 'looker', 'metabase')) return 'analyst';
  if (hasTool('google ads', 'mailchimp', 'marketo') || (hasTool('hubspot') && !hasTool('salesforce'))) return 'marketing';
  if (hasTool('linear', 'jira', 'productboard')) return 'pm';

  const scores: Record<Persona, number> = {
    pm: ['roadmap', 'sprint', 'product', 'feature', 'stakeholder', 'backlog', 'milestone', 'ticket'].filter((k) => text.includes(k)).length,
    analyst: ['data', 'query', 'sql', 'analysis', 'metrics', 'dashboard', 'report', 'pipeline'].filter((k) => text.includes(k)).length,
    marketing: ['campaign', 'ad', 'conversion', 'leads', 'content', 'seo', 'email', 'funnel'].filter((k) => text.includes(k)).length,
    designer: ['design', 'ui', 'ux', 'prototype', 'wireframe', 'user research', 'mockup', 'visual'].filter((k) => text.includes(k)).length,
    sales: ['deal', 'pipeline', 'prospect', 'revenue', 'quota', 'crm', 'outreach', 'close'].filter((k) => text.includes(k)).length,
  };

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  return (sorted[0][0] as Persona) || 'pm';
}

function extractProjectName(answers: InterviewAnswer[]): string {
  const projectAnswer = answers.find((a) => a.questionId === 'activeProject');
  if (!projectAnswer?.verbatim) return '';
  // Extract quoted or capitalized project-like names
  const quoted = projectAnswer.verbatim.match(/"([^"]+)"/)?.[1];
  if (quoted) return quoted;
  const words = projectAnswer.verbatim.split(' ').filter((w) => w.length > 3 && /^[A-Z]/.test(w));
  return words.slice(0, 3).join(' ') || projectAnswer.verbatim.split(' ').slice(0, 4).join(' ');
}

function hasTool(toolNames: string[], ...names: string[]): boolean {
  const lower = toolNames.map((t) => t.toLowerCase());
  return names.some((n) => lower.includes(n.toLowerCase()));
}

function firstTool(toolNames: string[], ...candidates: string[]): string | null {
  return candidates.find((c) => toolNames.map((t) => t.toLowerCase()).includes(c.toLowerCase())) ?? null;
}

export function generateCapabilityCards(ctx: Pick<UserContext, 'persona' | 'discoveredTools' | 'interviewAnswers' | 'activeProjects'>): CapabilityCard[] {
  const { persona, discoveredTools, interviewAnswers, activeProjects } = ctx;
  if (!persona) return [];

  const toolNames = discoveredTools.filter((t) => t.confidence !== 'low').map((t) => t.name);
  const projectName = activeProjects[0]?.name || extractProjectName(interviewAnswers) || 'your current project';
  const painPoint = interviewAnswers.find((a) => a.questionId === 'painPoint')?.verbatim?.slice(0, 80) || '';
  const pmTool = firstTool(toolNames, 'Linear', 'Jira', 'Asana') || 'your project board';
  const analyticsTool = firstTool(toolNames, 'Mixpanel', 'Amplitude', 'Google Analytics') || 'your analytics tool';
  const designTool = firstTool(toolNames, 'Figma', 'Sketch', 'Framer') || 'Figma';
  const dataTool = firstTool(toolNames, 'dbt', 'BigQuery', 'Databricks', 'Looker', 'Redash') || 'your data warehouse';
  const marketingTool = firstTool(toolNames, 'HubSpot', 'Mailchimp', 'Google Ads', 'Marketo') || 'your marketing stack';
  const salesTool = firstTool(toolNames, 'Salesforce', 'HubSpot', 'Outreach', 'Apollo') || 'your CRM';

  const cards: Record<Persona, CapabilityCard[]> = {
    pm: [
      {
        id: 'pm-sprint-health',
        title: 'Sprint health, without the meeting',
        description: `You have tasks in review and a deadline approaching. I can read your ${pmTool} board and give you a risk summary — which items are likely to slip and why, before anyone has to ask.`,
        ctaLabel: 'Check sprint health',
        ctaType: 'check',
        persona: 'pm',
        toolsReferenced: [pmTool],
        projectReferenced: projectName,
        priority: 1,
      },
      {
        id: 'pm-prd-writer',
        title: 'PRD written in your voice',
        description: `You're working on ${projectName}. I can draft a full PRD from our conversation — your words, structured for your team, ready for ${hasTool(toolNames, 'Confluence') ? 'Confluence' : 'wherever your team documents'}.`,
        ctaLabel: 'Draft PRD',
        ctaType: 'start',
        persona: 'pm',
        toolsReferenced: toolNames.filter((t) => ['Confluence', 'Notion', 'Linear'].includes(t)),
        projectReferenced: projectName,
        priority: 2,
      },
      {
        id: 'pm-stakeholder-update',
        title: 'Stakeholder update in 30 seconds',
        description: painPoint.includes('status') || painPoint.includes('update') || painPoint.includes('meet')
          ? `You mentioned "${painPoint.slice(0, 60)}..." — I can turn your ${pmTool} comments and Slack threads into a 5-bullet stakeholder update in your voice.`
          : `I can turn your ${pmTool} board and Slack threads into a crisp stakeholder update — your words, formatted for async reading.`,
        ctaLabel: 'Generate update',
        ctaType: 'try',
        persona: 'pm',
        toolsReferenced: [pmTool, 'Slack'].filter((t) => toolNames.includes(t) || t === pmTool),
        priority: 3,
      },
      {
        id: 'pm-analytics-summary',
        title: `${analyticsTool} insights, on demand`,
        description: `You track product metrics in ${analyticsTool}. Ask me anything — "What's retention doing since the last release?" — and I'll surface the answer without you opening another tab.`,
        ctaLabel: `Try: "What's retention doing?"`,
        ctaType: 'try',
        persona: 'pm',
        toolsReferenced: [analyticsTool],
        priority: 4,
      },
    ],
    analyst: [
      {
        id: 'analyst-query-runner',
        title: 'Run queries without leaving this window',
        description: `You use ${dataTool}. With the MCP integration connected, ask me to run any query against your marts and I'll show results inline — no tab-switching to ${firstTool(toolNames, 'Redash', 'Looker', 'Metabase') || 'your BI tool'}.`,
        ctaLabel: 'Connect data warehouse',
        ctaType: 'connect',
        persona: 'analyst',
        toolsReferenced: [dataTool],
        projectReferenced: projectName,
        priority: 1,
      },
      {
        id: 'analyst-anomaly',
        title: 'Anomaly detection before your stakeholders notice',
        description: painPoint
          ? `You mentioned "${painPoint.slice(0, 60)}...". I can monitor your key metrics and surface anomalies in plain language — before anyone has to file a ticket.`
          : 'I can monitor your key metrics and flag unusual patterns before your stakeholders notice — describe the metrics you care about and I'll watch them.',
        ctaLabel: 'Set up monitoring',
        ctaType: 'start',
        persona: 'analyst',
        toolsReferenced: [dataTool, analyticsTool].filter(Boolean),
        priority: 2,
      },
      {
        id: 'analyst-chart-gen',
        title: 'Chart generation from plain English',
        description: `Ask me for any chart — "Show me weekly active users by cohort for the last 90 days" — and I'll query your ${dataTool} and render it inline. Export to wherever your team expects it.`,
        ctaLabel: 'Try: "Show me weekly active users"',
        ctaType: 'try',
        persona: 'analyst',
        toolsReferenced: [dataTool],
        priority: 3,
      },
    ],
    marketing: [
      {
        id: 'marketing-competitor-intel',
        title: 'Competitor ad intelligence, on demand',
        description: `You run campaigns via ${marketingTool}. I can pull the latest competitor creatives, CTR benchmarks for your category, and flag spend shifts in your vertical — ask me anytime.`,
        ctaLabel: 'Try: "What are my competitors spending on?"',
        ctaType: 'try',
        persona: 'marketing',
        toolsReferenced: [marketingTool],
        projectReferenced: projectName,
        priority: 1,
      },
      {
        id: 'marketing-content-brief',
        title: `Content brief from your notes`,
        description: `You're working on ${projectName}. Give me the audience and goal, and I'll output a content brief in 30 seconds — headlines, angles, and distribution recommendations.`,
        ctaLabel: 'Generate content brief',
        ctaType: 'start',
        persona: 'marketing',
        toolsReferenced: [marketingTool],
        projectReferenced: projectName,
        priority: 2,
      },
      {
        id: 'marketing-campaign-summary',
        title: 'Campaign performance, without the dashboard',
        description: painPoint
          ? `You mentioned "${painPoint.slice(0, 60)}...". I can summarise your campaign performance in plain English and suggest what to do next — no pivot tables needed.`
          : `Ask me how your campaigns are performing — I'll read your ${marketingTool} data and give you the 3-bullet summary you'd send to your manager.`,
        ctaLabel: 'Summarise performance',
        ctaType: 'check',
        persona: 'marketing',
        toolsReferenced: [marketingTool, analyticsTool].filter(Boolean),
        priority: 3,
      },
    ],
    designer: [
      {
        id: 'designer-design-review',
        title: 'Design review — ready when you are',
        description: `I can see ${projectName} is your active project${activeProjects[0]?.progress ? ` at ${activeProjects[0].progress}% complete` : ''}. When you're ready, I can do a full review against your brief: heuristics, accessibility, brand consistency.`,
        ctaLabel: 'Start design review',
        ctaType: 'start',
        persona: 'designer',
        toolsReferenced: [designTool],
        projectReferenced: projectName,
        priority: 1,
      },
      {
        id: 'designer-accessibility',
        title: 'Accessibility audit before handoff',
        description: `Upload your ${designTool} export and I'll flag every contrast failure, missing alt text, and touch-target issue against WCAG 2.1 AA — before engineering finds them.`,
        ctaLabel: 'Run accessibility audit',
        ctaType: 'start',
        persona: 'designer',
        toolsReferenced: [designTool],
        priority: 2,
      },
      {
        id: 'designer-brief-gen',
        title: 'Design brief from research notes',
        description: painPoint
          ? `You mentioned "${painPoint.slice(0, 60)}...". Paste your research notes and I'll structure a design brief — goals, constraints, success metrics — ready to share with stakeholders.`
          : 'Paste your research notes and I'll structure a design brief — goals, constraints, success metrics — ready to share with stakeholders in minutes.',
        ctaLabel: 'Generate brief',
        ctaType: 'try',
        persona: 'designer',
        toolsReferenced: [designTool, 'Notion'].filter((t) => toolNames.includes(t) || t === designTool),
        priority: 3,
      },
    ],
    sales: [
      {
        id: 'sales-pipeline-gaps',
        title: 'Pipeline gaps, flagged before your review',
        description: `I can scan your ${salesTool} pipeline for deals with no activity in 21+ days and draft personalised re-engagement sequences for each — matched to the deal stage and last conversation.`,
        ctaLabel: 'Find stale deals',
        ctaType: 'check',
        persona: 'sales',
        toolsReferenced: [salesTool],
        priority: 1,
      },
      {
        id: 'sales-deal-coach',
        title: 'Deal coaching before every call',
        description: `You're working on ${projectName}. Before your next call, share the deal context and I'll prepare discovery questions, objection handlers, and a suggested next step — tailored to the prospect.`,
        ctaLabel: 'Prep for next call',
        ctaType: 'start',
        persona: 'sales',
        toolsReferenced: [salesTool],
        projectReferenced: projectName,
        priority: 2,
      },
      {
        id: 'sales-crm-update',
        title: 'CRM updates from your call notes',
        description: painPoint
          ? `You mentioned "${painPoint.slice(0, 60)}...". After your calls, paste your notes and I'll update ${salesTool} fields and log activities — no manual entry.`
          : `After your calls, paste your notes and I'll update ${salesTool} fields and log activities automatically — so your pipeline is always current.`,
        ctaLabel: 'Try with your notes',
        ctaType: 'try',
        persona: 'sales',
        toolsReferenced: [salesTool],
        priority: 3,
      },
    ],
  };

  return (cards[persona] || []).slice(0, 4);
}

export function generateDemoTasks(persona: Persona, name: string): { tasks: Task[]; deltas: DailyDelta[] } {
  const now = new Date().toISOString();

  const demos: Record<Persona, { tasks: Task[]; deltas: DailyDelta[] }> = {
    pm: {
      deltas: [
        { text: '3 new Linear comments on Sprint Review Doc since yesterday', source: 'Linear', type: 'mention' },
        { text: 'Sprint ends in 3 days — 3 tickets still in review', source: 'Linear', type: 'deadline' },
        { text: 'Design handoff PR unblocked by Hemant', source: 'Slack · #design', type: 'update' },
      ],
      tasks: [
        {
          id: 't1',
          title: 'Sprint review prep — Q2 Analytics Track',
          state: 'active',
          project: 'Q2 Analytics Track',
          trustMarker: { source: 'Linear', confidence: 'verified', detail: 'Assigned to you · Sprint ends Friday', timestamp: '2h ago' },
          cta: { label: 'Check sprint health', action: 'sprint-health' },
        },
        {
          id: 't2',
          title: 'Product spec review request from Arjun',
          state: 'detected',
          project: 'Data Platform',
          trustMarker: { source: 'Gmail', confidence: 'inferred', detail: 'Inferred from email subject — not directly assigned', timestamp: '4h ago' },
          cta: { label: 'Confirm task', action: 'confirm' },
        },
        {
          id: 't3',
          title: 'Q3 roadmap draft ready for review',
          state: 'awaiting',
          project: 'Q3 Planning',
          trustMarker: { source: 'Notion', confidence: 'verified', detail: 'Artisan drafted this from your notes · Awaiting your review', timestamp: 'just now' },
          aiOutput: 'Draft Q3 roadmap generated — 4 themes, 12 initiatives.',
          cta: { label: 'Review draft', action: 'review' },
        },
      ],
    },
    analyst: {
      deltas: [
        { text: 'mart_orders table refreshed 4 hours ago — downstream queries ready', source: 'dbt Cloud', type: 'update' },
        { text: '2 Slack mentions of your seller_tier query since yesterday', source: 'Slack · #data-platform', type: 'mention' },
        { text: 'Weekly metrics report due today at 5pm', source: 'Google Sheets', type: 'deadline' },
      ],
      tasks: [
        {
          id: 't1',
          title: 'Weekly metrics report — retention + activation',
          state: 'active',
          project: 'Weekly Reporting',
          trustMarker: { source: 'Google Sheets', confidence: 'verified', detail: 'Recurring task · Due today 5pm', timestamp: '30m ago' },
          cta: { label: 'Run query now', action: 'query' },
        },
        {
          id: 't2',
          title: 'Investigate conversion drop — last Wednesday',
          state: 'active',
          project: 'Conversion Analysis',
          trustMarker: { source: 'Slack · #growth', confidence: 'inferred', detail: 'Inferred from 3 Slack mentions — not a direct ticket', timestamp: '3h ago' },
          cta: { label: 'Pull data', action: 'query' },
        },
        {
          id: 't3',
          title: 'Update mart_seller_tier_scores query',
          state: 'detected',
          project: 'Data Platform',
          trustMarker: { source: 'Slack · #data-platform', confidence: 'suggested', detail: 'Suggested — you were @mentioned but not assigned', timestamp: '1h ago' },
          cta: { label: 'Confirm task', action: 'confirm' },
        },
      ],
    },
    marketing: {
      deltas: [
        { text: 'Competitor launched new Google Ads campaign overnight', source: 'Google Ads', type: 'new' },
        { text: 'Email campaign open rate 22% — 4pts above your average', source: 'HubSpot', type: 'update' },
        { text: 'Campaign brief for product launch due this Friday', source: 'Google Drive', type: 'deadline' },
      ],
      tasks: [
        {
          id: 't1',
          title: 'Q2 campaign brief — product launch',
          state: 'active',
          project: 'Product Launch',
          trustMarker: { source: 'Google Drive', confidence: 'verified', detail: 'File last edited by you · Due Friday', timestamp: '1d ago' },
          cta: { label: 'Continue brief', action: 'draft' },
        },
        {
          id: 't2',
          title: 'Competitor analysis for product launch',
          state: 'awaiting',
          project: 'Product Launch',
          trustMarker: { source: 'Google Ads', confidence: 'verified', detail: 'Artisan pulled competitor data · Ready to review', timestamp: 'just now' },
          aiOutput: 'Competitor intel ready — 3 competitors, spend data, top creatives.',
          cta: { label: 'Review analysis', action: 'review' },
        },
        {
          id: 't3',
          title: 'Review email campaign performance',
          state: 'detected',
          project: 'Email Marketing',
          trustMarker: { source: 'Gmail · HubSpot notification', confidence: 'suggested', detail: 'Suggested from HubSpot email digest', timestamp: '2h ago' },
          cta: { label: 'Confirm task', action: 'confirm' },
        },
      ],
    },
    designer: {
      deltas: [
        { text: 'Figma file "Pro Redesign" updated 2 days ago — 6 new frames', source: 'Figma', type: 'update' },
        { text: 'Design review comment from Meera on Pro Redesign', source: 'Slack · #design-reviews', type: 'mention' },
        { text: 'Handoff deadline: engineering needs specs by Thursday', source: 'Linear · #pro-redesign', type: 'deadline' },
      ],
      tasks: [
        {
          id: 't1',
          title: 'Pro Redesign — address feedback from Meera',
          state: 'active',
          project: 'Pro Redesign',
          trustMarker: { source: 'Slack · #design-reviews', confidence: 'verified', detail: 'Directly mentioned in comment · 6 frames affected', timestamp: '3h ago' },
          cta: { label: 'Start design review', action: 'design-review' },
        },
        {
          id: 't2',
          title: 'Accessibility audit — v2 component library',
          state: 'detected',
          project: 'Design System',
          trustMarker: { source: 'Slack · #design', confidence: 'inferred', detail: 'Inferred from team discussion — not yet assigned to you', timestamp: '5h ago' },
          cta: { label: 'Confirm task', action: 'confirm' },
        },
        {
          id: 't3',
          title: 'Design tokens update for dark mode',
          state: 'active',
          project: 'Design System',
          trustMarker: { source: 'Linear · Design System board', confidence: 'verified', detail: 'Assigned to you · In progress', timestamp: '1d ago' },
          cta: { label: 'Continue', action: 'continue' },
        },
      ],
    },
    sales: {
      deltas: [
        { text: '7 deals no Salesforce activity in 21+ days', source: 'Salesforce', type: 'update' },
        { text: '3 new inbound leads in HubSpot since yesterday', source: 'HubSpot', type: 'new' },
        { text: 'Acme Corp proposal unopened — sent 5 days ago', source: 'HubSpot · Email tracking', type: 'mention' },
      ],
      tasks: [
        {
          id: 't1',
          title: 'Pipeline review — weekly cadence',
          state: 'active',
          project: 'Q2 Pipeline',
          trustMarker: { source: 'Salesforce', confidence: 'verified', detail: 'Recurring weekly · 7 deals need attention', timestamp: '1h ago' },
          cta: { label: 'Check pipeline', action: 'pipeline' },
        },
        {
          id: 't2',
          title: 'Re-engage 7 stale deals — draft sequences',
          state: 'awaiting',
          project: 'Q2 Pipeline',
          trustMarker: { source: 'Salesforce', confidence: 'verified', detail: 'Artisan drafted 7 re-engagement sequences · Ready to review', timestamp: 'just now' },
          aiOutput: '7 personalised re-engagement sequences drafted — matched to deal stage.',
          cta: { label: 'Review sequences', action: 'review' },
        },
        {
          id: 't3',
          title: 'Follow up: Acme Corp proposal',
          state: 'detected',
          project: 'Acme Corp',
          trustMarker: { source: 'Gmail · HubSpot tracking', confidence: 'suggested', detail: 'Suggested — proposal unopened 5 days, no reply', timestamp: '2h ago' },
          cta: { label: 'Confirm task', action: 'confirm' },
        },
      ],
    },
  };

  return demos[persona] || { tasks: [], deltas: [] };
}

export const PERSONA_LABELS: Record<Persona, string> = {
  pm: 'Product Manager',
  analyst: 'Data Analyst',
  marketing: 'Marketing Manager',
  designer: 'Designer',
  sales: 'Sales / Business',
};
