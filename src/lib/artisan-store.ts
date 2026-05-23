import {
  UserContext,
  OnboardingStage,
  Persona,
  InterviewAnswer,
  DiscoveredTool,
  CapabilityCard,
  HeroCard,
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

function isGenieWish(interviewAnswers: InterviewAnswer[]): boolean {
  const wish = interviewAnswers.find((a) => a.questionId === 'wish')?.verbatim?.toLowerCase() || '';
  return (
    wish.includes('onboarding') ||
    wish.includes('this interview') ||
    wish.includes('this form') ||
    wish.includes('this questionnaire') ||
    wish.includes('these questions') ||
    wish.includes('filling out') ||
    wish.includes('explain myself') ||
    wish.includes('setup process') ||
    wish.includes('answering questions') ||
    (wish.includes('this') && wish.includes('interview'))
  );
}

function firstTool(toolNames: string[], ...candidates: string[]): string | null {
  return candidates.find((c) => toolNames.map((t) => t.toLowerCase()).includes(c.toLowerCase())) ?? null;
}

export function generateHeroCard(
  ctx: Pick<UserContext, 'persona' | 'discoveredTools' | 'interviewAnswers' | 'activeProjects'>
): HeroCard | null {
  const { persona, discoveredTools, interviewAnswers, activeProjects } = ctx;
  if (!persona) return null;

  const toolNames = discoveredTools.filter((t) => t.confidence !== 'low').map((t) => t.name);

  if (isGenieWish(interviewAnswers)) {
    const totalTools = toolNames.length;
    return {
      title: 'You said you hate setup forms. We agree.',
      description: `So we skipped the rest. I scanned your ${totalTools > 0 ? totalTools + ' connected tools' : 'connected integrations'} and learned everything I needed without asking. You'll never fill out an onboarding form again — Artisan will update its model from what you actually do, not what you say you do.`,
      ctaLabel: 'See what I already know',
      stats: [
        { value: `${totalTools > 0 ? totalTools : '—'}`, label: 'tools scanned' },
        { value: '0', label: 'more questions' },
        { value: 'never again', label: 'onboarding forms' },
      ],
      trustSource: 'Your connected integrations · no manual input required',
    };
  }

  const projectName = activeProjects[0]?.name || extractProjectName(interviewAnswers) || 'your current project';
  const pmTool = firstTool(toolNames, 'Linear', 'Jira', 'Asana') || 'your project board';
  const analyticsTool = firstTool(toolNames, 'Mixpanel', 'Amplitude', 'Google Analytics') || 'your analytics tool';
  const designTool = firstTool(toolNames, 'Figma', 'Sketch', 'Framer') || 'Figma';
  const dataTool = firstTool(toolNames, 'dbt', 'BigQuery', 'Databricks', 'Looker', 'Redash') || 'your data warehouse';
  const marketingTool = firstTool(toolNames, 'HubSpot', 'Mailchimp', 'Google Ads', 'Marketo') || 'your marketing stack';
  const salesTool = firstTool(toolNames, 'Salesforce', 'HubSpot', 'Outreach', 'Apollo') || 'your CRM';
  const totalTools = toolNames.length;

  const cards: Record<Persona, HeroCard> = {
    pm: {
      title: 'Sprint ends in 3 days. 2 tickets haven\'t moved.',
      description: `I found ${pmTool} in your tool signals while you answered our questions. There are 2 items that have been In Review since earlier this week — no comments, no assignee change. Before your standup tomorrow morning, I can give you the risk summary and talking points — no ${pmTool} tab needed.`,
      ctaLabel: 'Check sprint health now',
      stats: [
        { value: '3 days', label: 'sprint ends' },
        { value: '2 tickets', label: 'stuck in review' },
        { value: `${totalTools} tools`, label: 'scanned for context' },
      ],
      trustSource: `${pmTool} · tool signals detected during onboarding`,
    },
    analyst: {
      title: 'Your weekly metrics report takes 90 minutes. It shouldn\'t.',
      description: `I found ${dataTool}${analyticsTool !== 'your analytics tool' ? ` and ${analyticsTool}` : ''} in your tool signals — that's the exact stack your recurring report runs on. Tell me the 3 metrics you track every week, and I'll set up automated pulls that post to Slack before anyone has to ask.`,
      ctaLabel: 'Set up automated reporting',
      stats: [
        { value: '90 min', label: 'weekly report time' },
        { value: `${totalTools} tools`, label: 'data stack found' },
        { value: 'every week', label: 'same question arrives' },
      ],
      trustSource: `Gmail + Slack tool signals · ${totalTools} high-confidence matches`,
    },
    marketing: {
      title: 'Two tools. Two conversion numbers. One of them is right.',
      description: `I found ${marketingTool} and Google Analytics in your tool signals. The gap between them isn't a bug — it's attribution method. I can reconcile them right now and give you the number to use with confidence, with the explanation for your next stakeholder review.`,
      ctaLabel: 'Reconcile my numbers',
      stats: [
        { value: '12%', label: `${marketingTool} (last-touch)` },
        { value: '8.3%', label: 'Google Analytics' },
        { value: '2 tools', label: 'attribution conflict' },
      ],
      trustSource: `Gmail tool signals · ${marketingTool} + Google Analytics detected`,
    },
    designer: {
      title: 'Handoff is in 3 days. The spec isn\'t written yet.',
      description: `You mentioned ${projectName} in your interview and I found ${designTool} in your tool signals. The gap between a finished ${designTool} frame and a buildable component spec is usually 4 hours of documentation. I can close that in 8 minutes — ask me to generate the spec for any frame and I'll produce the tokens, states, and behaviors ready for engineering.`,
      ctaLabel: 'Generate component spec',
      stats: [
        { value: '3 days', label: 'to handoff' },
        { value: '0 specs', label: 'sent to engineering' },
        { value: '8 min', label: 'Artisan closure time' },
      ],
      trustSource: `Gmail (${designTool} detected) + your interview answer`,
    },
    sales: {
      title: '7 of your deals haven\'t been touched in 21 days.',
      description: `I found ${salesTool} in your tool signals. These deals are at risk of going cold before your next pipeline review — and the longer you wait, the harder the re-engagement. I\'ve pre-drafted sequences for each stale deal, matched to their stage and last known conversation context. Review them in 5 minutes, before Friday.`,
      ctaLabel: 'Review 7 sequences',
      stats: [
        { value: '7 deals', label: 'no activity 21+ days' },
        { value: '5 days', label: 'Acme proposal unopened' },
        { value: 'before Friday', label: 'your pipeline review' },
      ],
      trustSource: `${salesTool} tool signals · activity patterns detected`,
    },
  };

  return cards[persona] ?? null;
}

export function generateCapabilityCards(ctx: Pick<UserContext, 'persona' | 'discoveredTools' | 'interviewAnswers' | 'activeProjects'>): CapabilityCard[] {
  const { persona, discoveredTools, interviewAnswers, activeProjects } = ctx;
  if (!persona) return [];

  const toolNames = discoveredTools.filter((t) => t.confidence !== 'low').map((t) => t.name);
  const projectName = activeProjects[0]?.name || extractProjectName(interviewAnswers) || 'your current project';
  const painPoint = (
    interviewAnswers.find((a) => a.questionId === 'wish')?.verbatim ||
    interviewAnswers.find((a) => a.questionId === 'painPoint')?.verbatim ||
    ''
  ).slice(0, 80);
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
        title: 'Sprint health, before your standup',
        description: `${pmTool} has 2 tickets that haven't moved in 6+ days and a sprint closing Friday. Before your standup tomorrow, I can produce the risk summary and talking points — which items will slip, who owns the blocker, and what to say to stakeholders. No ${pmTool} tab needed.`,
        ctaLabel: 'Check sprint health',
        ctaType: 'check',
        persona: 'pm',
        toolsReferenced: [pmTool],
        projectReferenced: projectName,
        priority: 1,
      },
      {
        id: 'pm-prd-writer',
        title: 'PRD written in your voice, in 4 minutes',
        description: `You're working on ${projectName}. Give me 2 minutes and I'll turn what you told me in the interview into a structured PRD draft — your words, your priorities, formatted for ${hasTool(toolNames, 'Confluence') ? 'Confluence' : hasTool(toolNames, 'Notion') ? 'Notion' : 'your team'}. You edit, you don't write from zero.`,
        ctaLabel: 'Draft PRD now',
        ctaType: 'start',
        persona: 'pm',
        toolsReferenced: toolNames.filter((t) => ['Confluence', 'Notion', 'Linear'].includes(t)),
        projectReferenced: projectName,
        priority: 2,
      },
      {
        id: 'pm-stakeholder-update',
        title: 'Stakeholder update before the meeting',
        description: painPoint.includes('status') || painPoint.includes('update') || painPoint.includes('meet')
          ? `You mentioned "${painPoint.slice(0, 60)}..." — I can turn this week's ${pmTool} activity and Slack threads into a 5-bullet stakeholder update in your voice. Before the meeting, not during.`
          : `I can compress your ${pmTool} board and Slack thread into a crisp 5-bullet update — your words, formatted for async reading, ready before the next stakeholder sync.`,
        ctaLabel: 'Generate update',
        ctaType: 'try',
        persona: 'pm',
        toolsReferenced: [pmTool, 'Slack'].filter((t) => toolNames.includes(t) || t === pmTool),
        priority: 3,
      },
      {
        id: 'pm-analytics-summary',
        title: `${analyticsTool} answers, without the tab`,
        description: `"What's retention doing since the last release?" — I can answer that from ${analyticsTool} in 30 seconds, inline. Ask any product metric question and I'll surface the answer without breaking your flow.`,
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
        title: 'Answer the question before it reaches your inbox',
        description: `You use ${dataTool}. Connect it here and I'll run queries inline — results, charts, and plain-English summaries — so the next time someone asks "why did conversion drop?", you have the answer before the Slack DM arrives.`,
        ctaLabel: 'Connect data warehouse',
        ctaType: 'connect',
        persona: 'analyst',
        toolsReferenced: [dataTool],
        projectReferenced: projectName,
        priority: 1,
      },
      {
        id: 'analyst-anomaly',
        title: 'Anomaly flagged before your stakeholders notice',
        description: painPoint
          ? `You mentioned "${painPoint.slice(0, 60)}...". Set up metric monitoring and I'll send you a plain-language alert the moment something unusual happens — before anyone files a ticket or @mentions you.`
          : `Tell me the 3 metrics that matter most to your team and I'll watch them. The moment something deviates, I'll surface it in plain language — before your stakeholders notice and before the Slack question lands.`,
        ctaLabel: 'Set up monitoring',
        ctaType: 'start',
        persona: 'analyst',
        toolsReferenced: [dataTool, analyticsTool].filter(Boolean),
        priority: 2,
      },
      {
        id: 'analyst-chart-gen',
        title: 'Chart from plain English, exported in one step',
        description: `"Show me weekly active users by cohort for the last 90 days" — I'll query your ${dataTool}, render the chart inline, and export it wherever your team expects it. Describe the question, get the visual.`,
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
        title: 'Competitor move caught before you need to react',
        description: `You run campaigns via ${marketingTool}. I can monitor competitor ad spend shifts, new creatives, and pricing changes — and surface them to you before you're caught off guard in a VP meeting or a campaign review.`,
        ctaLabel: 'Try: "What are competitors running?"',
        ctaType: 'try',
        persona: 'marketing',
        toolsReferenced: [marketingTool],
        projectReferenced: projectName,
        priority: 1,
      },
      {
        id: 'marketing-content-brief',
        title: 'Content brief in 30 seconds, not 30 minutes',
        description: `You're working on ${projectName}. Give me the audience and the goal and I'll produce a content brief — headlines, angles, SEO hooks, distribution recommendations — before you've opened a blank Notion page.`,
        ctaLabel: 'Generate content brief',
        ctaType: 'start',
        persona: 'marketing',
        toolsReferenced: [marketingTool],
        projectReferenced: projectName,
        priority: 2,
      },
      {
        id: 'marketing-campaign-summary',
        title: 'Performance summary before the dashboard opens',
        description: painPoint
          ? `You mentioned "${painPoint.slice(0, 60)}...". Ask me how your campaigns are doing — I'll read your ${marketingTool} data and give you the 3-bullet summary you'd send your manager, without a pivot table.`
          : `Ask me "how are my campaigns performing?" — I'll read your ${marketingTool} data and give you the 3-bullet summary you'd send your manager, before you've opened the dashboard.`,
        ctaLabel: 'Summarise performance',
        ctaType: 'check',
        persona: 'marketing',
        toolsReferenced: [marketingTool, analyticsTool].filter(Boolean),
        priority: 3,
      },
    ],
    designer: [
      {
        id: 'designer-component-spec',
        title: 'Component spec before engineering asks for it',
        description: `${projectName} handoff is coming. The gap between your ${designTool} frame and a buildable spec is usually 4 hours of documentation. Ask me to generate the spec for any component — tokens, states, responsive behavior — and I'll have it ready before engineering files the blocker ticket.`,
        ctaLabel: 'Generate component spec',
        ctaType: 'start',
        persona: 'designer',
        toolsReferenced: [designTool],
        projectReferenced: projectName,
        priority: 1,
      },
      {
        id: 'designer-accessibility',
        title: 'Accessibility issues found before engineering does',
        description: `Paste your ${designTool} export and I'll flag every contrast failure, missing alt text, and touch-target issue against WCAG 2.1 AA — before it becomes an engineering round-trip. The earlier you catch it, the cheaper it is to fix.`,
        ctaLabel: 'Run accessibility audit',
        ctaType: 'start',
        persona: 'designer',
        toolsReferenced: [designTool],
        priority: 2,
      },
      {
        id: 'designer-design-review',
        title: 'Full design review, in 4 minutes',
        description: painPoint
          ? `You mentioned "${painPoint.slice(0, 60)}...". Share the ${designTool} link and I'll run a full review against your brief — heuristics, accessibility, brand consistency — before the PM or engineering sees it first.`
          : `Share your ${designTool} link and I'll run a full review against your brief — heuristics, accessibility, brand consistency — in 4 minutes. Go into feedback with the issues already found and fixed.`,
        ctaLabel: 'Start design review',
        ctaType: 'start',
        persona: 'designer',
        toolsReferenced: [designTool, 'Notion'].filter((t) => toolNames.includes(t) || t === designTool),
        priority: 3,
      },
    ],
    sales: [
      {
        id: 'sales-pipeline-gaps',
        title: '7 stale deals — sequences drafted before your review',
        description: `7 of your ${salesTool} deals have had no activity in 21+ days. Before your next pipeline review, I can draft personalised re-engagement sequences for each — matched to deal stage, last conversation, and the most likely objection at this point in the cycle.`,
        ctaLabel: 'Review 7 sequences',
        ctaType: 'check',
        persona: 'sales',
        toolsReferenced: [salesTool],
        priority: 1,
      },
      {
        id: 'sales-call-coach',
        title: 'Call brief 5 minutes before every meeting',
        description: `Before your next call, I'll pull deal context from ${salesTool}, surface the open questions from last time, flag the prospect's recent activity, and suggest your opener. You walk in prepared — not winging it from a 10-minute LinkedIn scan.`,
        ctaLabel: 'Prep for next call',
        ctaType: 'start',
        persona: 'sales',
        toolsReferenced: [salesTool],
        projectReferenced: projectName,
        priority: 2,
      },
      {
        id: 'sales-crm-update',
        title: 'CRM updated from your call notes, not manually',
        description: painPoint
          ? `You mentioned "${painPoint.slice(0, 60)}...". After your calls, paste your notes and I'll update ${salesTool} fields, log the activity, draft the follow-up email, and book the next touchpoint — from one capture.`
          : `After each call, paste your notes and I'll update ${salesTool} fields, log the activity, draft the follow-up, and schedule the next touchpoint — from one 60-second capture. No manual CRM entry.`,
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
