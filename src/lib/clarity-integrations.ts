/**
 * Artisan-specific calls to Clarity MCP tools.
 * Each function maps one Artisan capability to one or more Clarity MCPs.
 * All functions return null / empty on failure — callers fall back to mocks.
 */

import { callTool, parseToolJSON, parseToolText } from './clarity-client';
import { DiscoveredTool, Task, DailyDelta, ActiveProject } from '../types/artisan';

// ─── Google Workspace → Tool Discovery + Project Map ──────────────────────────

interface GmailToolSignal {
  tool: string;
  count: number;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Scan Gmail for tool mentions across the last 90 days.
 * Maps to the Clarity google-workspace MCP.
 */
export async function scanGmailForTools(): Promise<DiscoveredTool[]> {
  const result = await callTool('google-workspace', 'gmail_search_messages', {
    query: '-in:spam',
    max_results: 100,
  });

  const signals = parseToolJSON<GmailToolSignal[]>(result);
  if (!signals) return [];

  return signals.map((s) => ({
    name: s.tool,
    category: categorizeTool(s.tool),
    confidence: s.confidence,
    source: 'gmail' as const,
  }));
}

/**
 * List recent Drive files to build the active project map.
 */
export async function scanDriveForProjects(): Promise<ActiveProject[]> {
  const result = await callTool('google-workspace', 'drive_list_recent_files', {
    max_results: 20,
  });

  const files = parseToolJSON<Array<{ name: string; modified_time: string; shared_with: number }>>
    (result);
  if (!files) return [];

  return files.map((f) => ({
    name: f.name,
    lastActivity: f.modified_time,
    source: 'Google Drive',
    collaborators: f.shared_with,
  }));
}

// ─── Slack → Real-time Task Detection + Delta Signals ─────────────────────────

interface SlackMessage {
  text: string;
  channel: string;
  ts: string;
  is_mention: boolean;
  permalink: string;
}

/**
 * Scan Slack for @mentions and keywords that signal tasks.
 * Returns tasks in Detected state + delta highlights.
 */
export async function scanSlackForTasks(): Promise<{
  tasks: Partial<Task>[];
  deltas: DailyDelta[];
}> {
  const result = await callTool('slack', 'slack_search_messages', {
    query: 'to:me OR @me',
    count: 30,
  });

  const messages = parseToolJSON<SlackMessage[]>(result);
  if (!messages) return { tasks: [], deltas: [] };

  const tasks: Partial<Task>[] = messages
    .filter((m) => looksLikeTask(m.text))
    .map((m) => ({
      title: extractTaskTitle(m.text),
      state: 'detected' as const,
      trustMarker: {
        source: `Slack · #${m.channel}`,
        confidence: 'inferred' as const,
        detail: 'Inferred from @mention — not directly assigned',
        timestamp: relativeTime(m.ts),
      },
    }));

  const deltas: DailyDelta[] = messages.slice(0, 3).map((m) => ({
    text: m.text.slice(0, 80),
    source: `Slack · #${m.channel}`,
    type: 'mention' as const,
  }));

  return { tasks, deltas };
}

// ─── Jira → PM Sprint Health ───────────────────────────────────────────────────

interface JiraTicket {
  key: string;
  summary: string;
  status: string;
  assignee: string;
  sprint_end: string;
  story_points?: number;
}

interface SprintHealth {
  daysLeft: number;
  inReview: number;
  atRisk: number;
  tickets: JiraTicket[];
}

/**
 * Pull current sprint state from the Jira MCP.
 * Powers the PM persona's sprint health capability card.
 */
export async function getJiraSprintHealth(): Promise<SprintHealth | null> {
  const result = await callTool('jira', 'jira_get_active_sprint', {
    include_subtasks: false,
  });
  return parseToolJSON<SprintHealth>(result);
}

/**
 * Get Jira tickets assigned to the current user.
 */
export async function getJiraMyTickets(): Promise<Task[]> {
  const result = await callTool('jira', 'jira_search_issues', {
    jql: 'assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC',
    max_results: 10,
  });

  const tickets = parseToolJSON<JiraTicket[]>(result);
  if (!tickets) return [];

  return tickets.map((t) => ({
    id: t.key,
    title: `${t.key}: ${t.summary}`,
    state: jiraStatusToArtisanState(t.status),
    project: t.key.split('-')[0],
    trustMarker: {
      source: `Jira · ${t.key}`,
      confidence: 'verified' as const,
      detail: `Assigned to you · Status: ${t.status}`,
    },
  }));
}

// ─── Athena → Analyst Query Runner ────────────────────────────────────────────

export interface QueryResult {
  columns: string[];
  rows: string[][];
  row_count: number;
  execution_time_ms: number;
  query_execution_id: string;
}

/**
 * Run a SQL query against AWS Athena via the Clarity MCP.
 * This is the "run queries without leaving Artisan" capability card action.
 */
export async function runAthenaQuery(sql: string, database?: string): Promise<QueryResult | null> {
  const result = await callTool('athena', 'athena_run_query', {
    query_string: sql,
    ...(database ? { database } : {}),
  });
  return parseToolJSON<QueryResult>(result);
}

/**
 * List available Athena tables — used to power the analyst's context graph.
 */
export async function listAthenaTables(database?: string): Promise<string[]> {
  const result = await callTool('athena', 'athena_list_table_metadata', {
    ...(database ? { database_name: database } : {}),
  });
  const meta = parseToolJSON<Array<{ Name: string }>>(result);
  return meta?.map((t) => t.Name) ?? [];
}

// ─── Grafana → Analyst/PM Metrics Context ─────────────────────────────────────

interface GrafanaDashboardSummary {
  title: string;
  uid: string;
  panels: Array<{ title: string; type: string }>;
}

export async function getGrafanaDashboards(): Promise<GrafanaDashboardSummary[]> {
  const result = await callTool('grafana', 'grafana_search_dashboards', { limit: 10 });
  return parseToolJSON<GrafanaDashboardSummary[]>(result) ?? [];
}

export async function getGrafanaAlerts(): Promise<DailyDelta[]> {
  const result = await callTool('grafana', 'grafana_get_alert_rules', { state: 'firing' });
  const alerts = parseToolJSON<Array<{ title: string; state: string }>>
    (result);
  if (!alerts) return [];

  return alerts.map((a) => ({
    text: `Alert firing: ${a.title}`,
    source: 'Grafana',
    type: 'update' as const,
  }));
}

// ─── PagerDuty → On-call / Incident Signals ───────────────────────────────────

export async function getPagerDutyIncidents(): Promise<DailyDelta[]> {
  const result = await callTool('pagerduty', 'pagerduty_list_incidents', {
    statuses: ['triggered', 'acknowledged'],
    limit: 5,
  });
  const incidents = parseToolJSON<Array<{ title: string; urgency: string; created_at: string }>>(result);
  if (!incidents) return [];

  return incidents.map((i) => ({
    text: `${i.urgency === 'high' ? 'P1' : 'P2'} incident: ${i.title}`,
    source: 'PagerDuty',
    type: 'new' as const,
  }));
}

// ─── Sentry → Error Context for Analysts/Engineers ────────────────────────────

export async function getSentryIssues(): Promise<DailyDelta[]> {
  const result = await callTool('sentry', 'sentry_list_issues', {
    query: 'is:unresolved',
    limit: 5,
  });
  const issues = parseToolJSON<Array<{ title: string; events: number; firstSeen: string }>>(result);
  if (!issues) return [];

  return issues.map((i) => ({
    text: `${i.events} events: ${i.title}`,
    source: 'Sentry',
    type: 'mention' as const,
  }));
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function categorizeTool(name: string): DiscoveredTool['category'] {
  const lower = name.toLowerCase();
  if (['figma', 'sketch', 'framer', 'canva', 'miro'].some((t) => lower.includes(t))) return 'design';
  if (['salesforce', 'hubspot', 'outreach', 'apollo', 'cognism', 'lusha'].some((t) => lower.includes(t))) return 'sales';
  if (['google ads', 'mailchimp', 'marketo', 'klaviyo'].some((t) => lower.includes(t))) return 'marketing';
  if (['dbt', 'bigquery', 'redash', 'databricks', 'looker', 'athena', 'metabase'].some((t) => lower.includes(t))) return 'data';
  if (['github', 'gitlab', 'sentry', 'pagerduty', 'datadog'].some((t) => lower.includes(t))) return 'engineering';
  if (['slack', 'zoom', 'loom', 'notion', 'confluence'].some((t) => lower.includes(t))) return 'communication';
  return 'productivity';
}

function looksLikeTask(text: string): boolean {
  const taskSignals = ['can you', 'could you', 'please', 'need you to', 'can u', 'help with', 'review', 'take a look', 'check'];
  const lower = text.toLowerCase();
  return taskSignals.some((s) => lower.includes(s));
}

function extractTaskTitle(text: string): string {
  const clean = text.replace(/<@[A-Z0-9]+>/g, '').replace(/\s+/g, ' ').trim();
  return clean.slice(0, 80);
}

function relativeTime(slackTs: string): string {
  const ms = parseFloat(slackTs) * 1000;
  const diffMin = Math.round((Date.now() - ms) / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.round(diffMin / 60)}h ago`;
  return `${Math.round(diffMin / 1440)}d ago`;
}

function jiraStatusToArtisanState(status: string): Task['state'] {
  const s = status.toLowerCase();
  if (['in review', 'in progress', 'in development'].some((x) => s.includes(x))) return 'active';
  if (['done', 'closed', 'resolved', 'won\'t fix'].some((x) => s.includes(x))) return 'closed';
  if (['to do', 'open', 'backlog', 'new'].some((x) => s.includes(x))) return 'detected';
  return 'active';
}
