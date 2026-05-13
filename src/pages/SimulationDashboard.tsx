import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { SimulationResult, AuditResult, OnboardingRun, CompanyProfile, ObserverReport } from "../../simulation/types";

// ── Sample result for when no real run exists yet ────────────────────────────
const SAMPLE: SimulationResult = {
  runId: "sim-demo",
  runAt: new Date().toISOString(),
  companies: [
    {
      id: "b2c-fintech", name: "PaySpark", industry: "Consumer Fintech", stage: "Series B",
      size: "280 people", city: "Bangalore", archetype: "B2C fintech",
      persona: {
        name: "Priya Mehta", role: "Senior Product Manager – Growth", company: "PaySpark",
        tenure: "2.5 years", reportsTo: "Karthik Sharma (Director of Growth)",
        toolStack: ["Slack", "Linear", "Mixpanel", "Notion", "Figma", "Zoom", "Google Sheets", "Looker", "Jira"],
        primaryCommsTools: ["Slack", "Linear"],
        invisibleComms: ["WhatsApp"],
        projects: [
          { name: "KYC Drop-off Reduction", codename: "Project Clarity", status: "active", description: "Reducing PAN verification abandonment from 42% to <25%.", tools: ["Mixpanel", "Linear", "Figma"], keyPeople: ["Karthik", "Anand"] },
          { name: "Referral v2", status: "active", description: "Redesigning the referral programme for higher activation.", tools: ["Notion", "Linear"], keyPeople: ["Meera", "Rohit"] },
          { name: "Push Notification Redesign", status: "winding-down", description: "Shipped; now in post-launch monitoring.", tools: ["Mixpanel"], keyPeople: ["Anand"] },
        ],
        collaborators: [
          { name: "Karthik Sharma", role: "Director of Growth", relationship: "manager", commsChannel: "weekly 1:1 + Slack" },
          { name: "Anand Rao", role: "Eng Lead", relationship: "peer", commsChannel: "Slack + standup" },
          { name: "Meera Iyer", role: "Designer", relationship: "peer", commsChannel: "Figma + Slack" },
          { name: "Rohit Gupta", role: "Data Analyst", relationship: "cross-functional", commsChannel: "Slack DMs" },
          { name: "Vikram Nair", role: "Backend Eng", relationship: "peer", commsChannel: "Slack" },
        ],
        emailPatterns: [
          { subject: "[Linear] Karthik assigned you #KYC-142", sender: "notify@linear.app", tool: "Linear" },
          { subject: "[Mixpanel] Weekly activation digest", sender: "reports@mixpanel.com", tool: "Mixpanel" },
          { subject: "[Figma] Meera shared 'KYC Flow v3' with you", sender: "noreply@figma.com", tool: "Figma" },
          { subject: "Zoom Meeting: Growth Sync", sender: "no-reply@zoom.us", tool: "Zoom" },
          { subject: "[Notion] Rohit edited 'Referral v2 PRD'", sender: "mail@mail.notion.so", tool: "Notion" },
        ],
        calendarPatterns: [
          { title: "Growth Weekly", recurrence: "weekly", organizer: "Karthik Sharma", attendees: ["Priya", "Anand", "Meera"], videoLink: "zoom.us" },
          { title: "1:1 w/ Karthik", recurrence: "weekly", organizer: "Karthik Sharma", attendees: ["Priya"], videoLink: "zoom.us" },
        ],
        weekNarrativeSeed: "Spent Monday digging into the KYC drop-off numbers with Rohit — we found a 38% abandonment spike right at PAN entry. Tuesday was Figma reviews with Meera for the new flow. Referral v2 is blocked because Rohit is still on the KYC analysis. Push notification PRD shipped.",
      },
    },
    {
      id: "b2b-saas", name: "Linkably", industry: "B2B SaaS", stage: "Series C",
      size: "145 people", city: "Austin, TX", archetype: "B2B SaaS",
      persona: {
        name: "Marcus Chen", role: "Product Manager – Integrations Platform", company: "Linkably",
        tenure: "3 years", reportsTo: "Sandra Wu (VP Product)",
        toolStack: ["Teams", "Jira", "Confluence", "Salesforce", "GitHub", "Zoom", "Datadog", "Looker", "Figma"],
        primaryCommsTools: ["Teams", "Jira"],
        invisibleComms: ["phone calls with enterprise customers"],
        projects: [
          { name: "Webhook Reliability", status: "active", description: "P99 webhook delivery <500ms; reducing retry storms.", tools: ["Jira", "Datadog", "GitHub"], keyPeople: ["Elena", "Raj"] },
          { name: "OAuth 2.0 Migration", status: "planning", description: "Migrating all integrations off legacy API keys.", tools: ["Confluence", "Jira"], keyPeople: ["Sandra", "Elena"] },
          { name: "Salesforce Native App", status: "blocked", description: "Blocked on ISV certification from Salesforce.", tools: ["Salesforce", "Jira"], keyPeople: ["Raj"] },
        ],
        collaborators: [
          { name: "Sandra Wu", role: "VP Product", relationship: "manager", commsChannel: "weekly 1:1 + Teams" },
          { name: "Elena Kovács", role: "Eng Lead", relationship: "peer", commsChannel: "Jira + Teams" },
          { name: "Raj Patel", role: "Solutions Engineer", relationship: "cross-functional", commsChannel: "Teams DMs" },
          { name: "Tom Briggs", role: "Enterprise AE", relationship: "cross-functional", commsChannel: "Salesforce + email" },
          { name: "Yuki Tanaka", role: "Designer", relationship: "peer", commsChannel: "Figma + Teams" },
        ],
        emailPatterns: [
          { subject: "[Jira] Elena assigned PLAT-892 to you", sender: "jira@atlassian.com", tool: "Jira" },
          { subject: "Datadog Alert: webhook_failures spike", sender: "noreply@datadoghq.com", tool: "Datadog" },
          { subject: "[Salesforce] Case #SF-44201 updated", sender: "salesforce@salesforce.com", tool: "Salesforce" },
          { subject: "Zoom: Weekly Integrations Sync", sender: "no-reply@zoom.us", tool: "Zoom" },
          { subject: "[GitHub] PR review requested: webhook-retry-logic", sender: "noreply@github.com", tool: "GitHub" },
        ],
        calendarPatterns: [
          { title: "Integrations Weekly", recurrence: "weekly", organizer: "Marcus Chen", attendees: ["Marcus", "Elena", "Raj"], videoLink: "zoom.us" },
          { title: "1:1 w/ Sandra", recurrence: "biweekly", organizer: "Sandra Wu", attendees: ["Marcus"], videoLink: "zoom.us" },
        ],
        weekNarrativeSeed: "Webhook reliability incident on Monday took half the week — spent time with Elena triaging and writing the post-mortem. OAuth migration planning session with Sandra got pushed to next week. Salesforce ISV cert is still stuck waiting on their partner team.",
      },
    },
    {
      id: "early-startup", name: "Kojo", industry: "Procurement Tech", stage: "Seed",
      size: "18 people", city: "London", archetype: "early-stage startup",
      persona: {
        name: "Amara Osei", role: "Product Lead", company: "Kojo",
        tenure: "14 months", reportsTo: "Olu Adeyemi (CEO)",
        toolStack: ["Slack", "Notion", "GitHub", "Loom", "Figma", "Linear", "Google Analytics", "Intercom"],
        primaryCommsTools: ["Slack", "Notion"],
        invisibleComms: ["WhatsApp group (team social)", "voice calls with customers"],
        projects: [
          { name: "Supplier Portal v1", status: "active", description: "First supplier-facing surface; in private beta with 3 customers.", tools: ["Figma", "Linear", "GitHub"], keyPeople: ["Finn", "Dayo"] },
          { name: "Buyer Onboarding Revamp", status: "planning", description: "Reducing time-to-first-order from 11 days to <3.", tools: ["Notion", "Intercom"], keyPeople: ["Olu", "Temi"] },
          { name: "Analytics Foundation", status: "blocked", description: "Blocked on data model decision with engineering.", tools: ["Google Analytics"], keyPeople: ["Dayo"] },
        ],
        collaborators: [
          { name: "Olu Adeyemi", role: "CEO", relationship: "manager", commsChannel: "Slack + daily standup" },
          { name: "Finn O'Brien", role: "Lead Engineer", relationship: "peer", commsChannel: "Slack + GitHub" },
          { name: "Dayo Ogunnaike", role: "Data + Eng", relationship: "peer", commsChannel: "Slack DMs" },
          { name: "Temi Afolabi", role: "Customer Success", relationship: "cross-functional", commsChannel: "Slack + Intercom" },
          { name: "Sara Lindqvist", role: "Design contractor", relationship: "external", commsChannel: "Figma + email" },
        ],
        emailPatterns: [
          { subject: "[Linear] Finn opened PR for SP-44", sender: "notify@linear.app", tool: "Linear" },
          { subject: "[Figma] Sara shared 'Supplier Portal mockups'", sender: "noreply@figma.com", tool: "Figma" },
          { subject: "[Intercom] New message from customer: Acme Corp", sender: "notifications@intercom.com", tool: "Intercom" },
          { subject: "Loom: Olu recorded 'CEO Update — Week 22'", sender: "notifications@loom.com", tool: "Loom" },
        ],
        calendarPatterns: [
          { title: "Daily standup", recurrence: "daily", organizer: "Olu Adeyemi", attendees: ["full team"], videoLink: "meet.google.com" },
          { title: "Supplier beta call", recurrence: "weekly", organizer: "Temi Afolabi", attendees: ["Amara", "Temi"], videoLink: "meet.google.com" },
        ],
        weekNarrativeSeed: "Supplier portal private beta launched Monday — three customers onboarded by Wednesday. Spent Thursday with a customer doing a Loom walkthrough; they flagged the PO creation flow is confusing. Analytics foundation is blocked on Dayo's availability. Olu wants buyer onboarding kickoff next week.",
      },
    },
    {
      id: "enterprise", name: "Meridian Financial", industry: "Financial Services", stage: "Enterprise",
      size: "9,400 people", city: "New York", archetype: "enterprise",
      persona: {
        name: "Lisa Patel", role: "Product Operations Manager – Digital Channels", company: "Meridian Financial",
        tenure: "6 years", reportsTo: "James Whitmore (Head of Digital Products)",
        toolStack: ["Outlook", "Teams", "SharePoint", "ServiceNow", "Jira", "Power BI", "Confluence", "Zoom"],
        primaryCommsTools: ["Outlook", "Teams"],
        invisibleComms: ["in-person whiteboard sessions", "phone calls with compliance"],
        projects: [
          { name: "Mobile App Accessibility Audit", status: "active", description: "WCAG 2.1 AA compliance for the retail mobile app by Q3.", tools: ["Jira", "Confluence", "SharePoint"], keyPeople: ["Aisha", "Tom"] },
          { name: "Service Desk Automation", status: "planning", description: "Using ServiceNow flows to reduce L1 ticket volume 30%.", tools: ["ServiceNow", "Power BI"], keyPeople: ["James", "Raj"] },
          { name: "Cross-sell Dashboard", status: "active", description: "Power BI dashboard for RM team to surface cross-sell signals.", tools: ["Power BI", "SharePoint"], keyPeople: ["Nina"] },
        ],
        collaborators: [
          { name: "James Whitmore", role: "Head of Digital Products", relationship: "manager", commsChannel: "weekly 1:1 + Outlook" },
          { name: "Aisha Bell", role: "Accessibility Lead", relationship: "cross-functional", commsChannel: "Teams + Jira" },
          { name: "Tom Reeves", role: "Mobile Eng Lead", relationship: "cross-functional", commsChannel: "Teams + Jira" },
          { name: "Nina Castillo", role: "BI Analyst", relationship: "peer", commsChannel: "Teams DMs" },
          { name: "Raj Sharma", role: "IT Service Manager", relationship: "cross-functional", commsChannel: "ServiceNow + email" },
        ],
        emailPatterns: [
          { subject: "[Jira] Aisha assigned ACC-201 to you", sender: "jira@atlassian.com", tool: "Jira" },
          { subject: "[ServiceNow] Ticket INC0047823 assigned to your team", sender: "noreply@service-now.com", tool: "ServiceNow" },
          { subject: "Power BI: Cross-sell dashboard alert", sender: "powerbi@microsoft.com", tool: "Power BI" },
          { subject: "Zoom: Product Ops Weekly", sender: "no-reply@zoom.us", tool: "Zoom" },
        ],
        calendarPatterns: [
          { title: "Product Ops Weekly", recurrence: "weekly", organizer: "Lisa Patel", attendees: ["Lisa", "Aisha", "Tom", "Nina"], videoLink: "zoom.us" },
          { title: "Digital Products SteerCo", recurrence: "monthly", organizer: "James Whitmore", attendees: ["full dept"], videoLink: "teams.microsoft.com" },
        ],
        weekNarrativeSeed: "Accessibility audit vendor delivered findings on Monday — 47 open issues, 12 critical. Spent two days triaging with Aisha and Tom. ServiceNow automation requirements meeting got cancelled (James was out). Cross-sell dashboard finally approved by compliance; Nina is deploying Friday.",
      },
    },
  ],
  runs: [] as OnboardingRun[],
  audits: [
    { companyId: "b2c-fintech", personaName: "Priya Mehta", toolDetection: { precision: 0.86, recall: 0.78, f1: 0.82, falsePositives: ["Confluence"], falseNegatives: ["Google Sheets", "Looker"] }, narration: { projectsRevealed: ["KYC Drop-off Reduction", "Push Notification Redesign"], projectsMissed: ["Referral v2"], peopleRevealed: ["Karthik", "Rohit", "Meera", "Anand"], toolsRevealedByNarration: ["Mixpanel", "Figma"], blockersSurfaced: ["Referral v2 blocked: Rohit on KYC analysis"], richness: "high" }, overallDiscoveryScore: 79, criticalGaps: ["Looker and Google Sheets not detected", "WhatsApp coordination invisible"], whatWorkedWell: ["Email mining caught Slack/Linear/Mixpanel/Figma/Notion/Zoom", "Narration was rich and specific"] },
    { companyId: "b2b-saas", personaName: "Marcus Chen", toolDetection: { precision: 0.80, recall: 0.67, f1: 0.73, falsePositives: ["Slack"], falseNegatives: ["Confluence", "Teams", "Looker"] }, narration: { projectsRevealed: ["Webhook Reliability"], projectsMissed: ["OAuth 2.0 Migration", "Salesforce Native App"], peopleRevealed: ["Elena", "Sandra"], toolsRevealedByNarration: ["Datadog"], blockersSurfaced: ["OAuth migration pushed", "Salesforce ISV cert stuck"], richness: "medium" }, overallDiscoveryScore: 62, criticalGaps: ["Teams not detected (Microsoft ecosystem poorly represented)", "Two of three projects not mentioned in narration", "Lots of work lives in Salesforce — missed"], whatWorkedWell: ["Jira/Datadog/GitHub detected via email notifications"] },
    { companyId: "early-startup", personaName: "Amara Osei", toolDetection: { precision: 1.0, recall: 0.63, f1: 0.77, falsePositives: [], falseNegatives: ["Slack", "Notion", "Google Analytics"] }, narration: { projectsRevealed: ["Supplier Portal v1", "Analytics Foundation", "Buyer Onboarding Revamp"], projectsMissed: [], peopleRevealed: ["Olu", "Dayo", "Temi"], toolsRevealedByNarration: ["Loom", "Intercom"], blockersSurfaced: ["Analytics blocked on Dayo", "PO creation flow confusing"], richness: "high" }, overallDiscoveryScore: 82, criticalGaps: ["Slack and Notion invisible to email (no notification patterns)", "Google Analytics not detectable without direct integration"], whatWorkedWell: ["Zero false positives", "Narration was excellent — all 3 projects mentioned", "Intercom surfaced by narration despite no email pattern"] },
    { companyId: "enterprise", personaName: "Lisa Patel", toolDetection: { precision: 0.75, recall: 0.50, f1: 0.60, falsePositives: ["Notion", "Linear"], falseNegatives: ["Outlook", "Teams", "SharePoint", "Confluence"] }, narration: { projectsRevealed: ["Mobile App Accessibility Audit", "Cross-sell Dashboard"], projectsMissed: ["Service Desk Automation"], peopleRevealed: ["Aisha", "Tom", "James", "Nina"], toolsRevealedByNarration: ["ServiceNow"], blockersSurfaced: ["ServiceNow meeting cancelled", "47 open accessibility issues"], richness: "medium" }, overallDiscoveryScore: 51, criticalGaps: ["Microsoft stack (Outlook, Teams, SharePoint) invisible to Google OAuth mining", "False positives from previous company (Notion/Linear) inserted", "Less than half the tool stack detected"], whatWorkedWell: ["Narration was solid for the detected projects", "ServiceNow surfaced by narration"] },
  ],
  observerReport: {
    summary: "The onboarding flow performs well for Google-centric and Slack-native teams (Priya, Amara) but degrades significantly for Microsoft-ecosystem users (Lisa) and orgs with many tools not represented in Gmail notification patterns. The narration step is the strongest signal source — it surfaced tools and projects the mining step missed in every run. The connect step copy is trusted by most personas but enterprises want to know more about data retention before proceeding.",
    overallHealthScore: 69,
    frictionPoints: [
      { step: "connect", issue: "Enterprise persona (Lisa) hesitated on the Gmail OAuth consent due to corporate data policy concerns — the current copy doesn't address regulated-industry scenarios", frequency: "seen in 1/4 runs", severity: "high", suggestedFix: "Add a one-liner: 'Works with corporate Google Workspace — we only read metadata, never message bodies. SOC 2 compliant.'" },
      { step: "tools", issue: "Microsoft-ecosystem users (Lisa) saw many false positives (Notion, Linear) that don't exist in their stack, eroding trust in the detection quality", frequency: "seen in 1/4 runs", severity: "high", suggestedFix: "Before showing the tool list, ask 'Does your company use Google Workspace or Microsoft 365?' — this primes the right tool universe and suppresses implausible suggestions" },
      { step: "tools", issue: "Tools with no email notification pattern (Slack, Notion, Teams) were consistently missed across archetypes — users didn't think to add them manually", frequency: "seen in 3/4 runs", severity: "medium", suggestedFix: "Show a 'frequently missed' chip list below the detected tools: 'Teams? Slack? SharePoint?' based on detected stack context" },
      { step: "narration", issue: "B2B SaaS persona (Marcus) gave a thin narration — enterprise PMs are less fluent in plain-language self-narration, defaulting to status-update mode", frequency: "seen in 2/4 runs", severity: "medium", suggestedFix: "For B2B archetypes, change the first prompt from 'What did you work on?' to 'What was the biggest external blocker this week?' — this unlocks richer signal" },
      { step: "welcome", issue: "The value prop 'map your workflow' is abstract for senior PMs who think in outcomes, not processes", frequency: "seen in 2/4 runs", severity: "low", suggestedFix: "Make it concrete: 'See your week as your manager sees it — projects, blockers, who you depend on — in 5 minutes'" },
    ],
    personaInsights: [
      { archetype: "B2C fintech PM", specificIssue: "WhatsApp coordination is the most important invisible layer and we have no solution for it", recommendation: "Surface the gap honestly: 'We know you're on WhatsApp. You can mention it in your narration and we'll treat it as context even though we can't read it.'" },
      { archetype: "B2B SaaS PM", specificIssue: "Salesforce is the source of truth for feature prioritisation — ignoring it makes the profile feel incomplete to the PM", recommendation: "After the narration step, add a targeted 'One more thing' prompt: 'Is Salesforce important to your work? If yes, connect it now for 3x richer project context.'" },
      { archetype: "Early-stage startup PM", specificIssue: "Flow worked best here — minimal false positives, rich narration, all projects surfaced", recommendation: "This is the reference case. Keep the current flow for this archetype; use it as the benchmark." },
      { archetype: "Enterprise PM", specificIssue: "Google OAuth mining is nearly useless for Microsoft-stack companies — only 50% recall", recommendation: "Detect Microsoft tenant on signup (email domain → check for Office 365 MX records) and offer Microsoft Graph OAuth as alternative to Google." },
    ],
    topRecommendations: [
      "Add Microsoft Graph OAuth as a parallel path to Google OAuth — enterprise and B2B companies run on M365 and are currently underserved with <60% tool recall",
      "After the tools step, show a 'What's missing?' chip list with contextually-relevant suggestions based on what was detected (e.g., if Jira was found, suggest Confluence; if Slack was found, suggest Notion)",
      "Redesign the narration prompt for B2B/enterprise archetypes — replace 'What did you do this week?' with 'What's the one thing most likely to slip without your attention?' to get richer signal faster",
      "Be honest about the WhatsApp/invisible comms gap on the Done screen — show it as a known limitation with an invitation: 'Mention it in your narration anytime'",
      "Add a pre-onboarding workspace detection step — Google Workspace vs Microsoft 365 — so the tool universe, OAuth path, and false-positive suppression are calibrated before discovery starts",
    ],
    stepsThatWorked: ["connect (trust signals were effective for Google-native teams)", "narration (strongest signal source across all runs)", "done (summary was appreciated)"],
    stepsToRethink: ["tools (false positives for Microsoft users, missed tools for everyone)", "welcome (value prop too abstract for senior PMs)"],
    unexpectedFindings: [
      "The narration step consistently surfaced tools that email mining missed — in 3/4 runs, narration was the only source for at least 1 important tool. Narration is not a supplement; it's the primary signal.",
      "The early-stage startup persona produced the highest quality onboarding despite having the least structured data — suggesting that product complexity (not company size) is the real predictor of onboarding quality.",
      "Enterprise persona's hesitation was not about privacy per se — it was about corporate policy compliance. The fix is not softer copy; it's adding a compliance signal (SOC 2, no message body access).",
    ],
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "bg-green-100 text-green-800" : score >= 55 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";
  return <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", color)}>{score}/100</span>;
}

function SeverityDot({ severity }: { severity: "high" | "medium" | "low" }) {
  const color = { high: "bg-red-500", medium: "bg-yellow-400", low: "bg-blue-400" }[severity];
  return <span className={cn("inline-block w-2 h-2 rounded-full flex-shrink-0 mt-1.5", color)} />;
}

function AuditCard({ audit, company }: { audit: AuditResult; company: CompanyProfile }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{audit.personaName}</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">{company.role ?? company.persona.role} · {company.name} · {company.archetype}</p>
          </div>
          <ScoreBadge score={audit.overallDiscoveryScore} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Precision", value: `${Math.round(audit.toolDetection.precision * 100)}%` },
            { label: "Recall", value: `${Math.round(audit.toolDetection.recall * 100)}%` },
            { label: "F1", value: `${Math.round(audit.toolDetection.f1 * 100)}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Narration richness</p>
          <div className="flex items-center gap-2">
            <Badge variant={audit.narration.richness === "high" ? "default" : audit.narration.richness === "medium" ? "secondary" : "outline"}>
              {audit.narration.richness}
            </Badge>
            <span className="text-slate-500 text-xs">
              {audit.narration.projectsRevealed.length} projects · {audit.narration.peopleRevealed.length} people · {audit.narration.blockersSurfaced.length} blockers
            </span>
          </div>
        </div>

        {audit.criticalGaps.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">Critical gaps</p>
            <ul className="space-y-1">
              {audit.criticalGaps.map((g) => (
                <li key={g} className="text-xs text-slate-600 flex gap-1.5"><span className="text-red-400 flex-shrink-0">✗</span>{g}</li>
              ))}
            </ul>
          </div>
        )}

        {audit.whatWorkedWell.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">What worked</p>
            <ul className="space-y-1">
              {audit.whatWorkedWell.map((w) => (
                <li key={w} className="text-xs text-slate-600 flex gap-1.5"><span className="text-green-500 flex-shrink-0">✓</span>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ObserverPanel({ report }: { report: ObserverReport }) {
  return (
    <div className="space-y-6">
      <Card className="border-blue-100 bg-blue-50/40">
        <CardContent className="pt-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">👁️</span>
            <div>
              <p className="font-semibold text-slate-800">Overall health</p>
              <ScoreBadge score={report.overallHealthScore} />
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{report.summary}</p>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Top recommendations</h3>
        <ol className="space-y-2">
          {report.topRecommendations.map((r, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700">
              <span className="font-bold text-blue-600 flex-shrink-0">{i + 1}.</span>
              {r}
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Friction points</h3>
        <div className="space-y-3">
          {report.frictionPoints.map((fp, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-2">
                <SeverityDot severity={fp.severity} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">{fp.step}</Badge>
                    <span className="text-xs text-slate-400">{fp.frequency}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1">{fp.issue}</p>
                  <p className="text-xs text-blue-700 mt-1.5 bg-blue-50 rounded px-2 py-1">
                    Fix: {fp.suggestedFix}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Unexpected findings</h3>
        <ul className="space-y-3">
          {report.unexpectedFindings.map((f, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="text-purple-500 flex-shrink-0 mt-0.5">⚡</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Steps that worked</p>
          <ul className="space-y-1">
            {report.stepsThatWorked.map((s) => (
              <li key={s} className="text-xs text-slate-600 flex gap-1.5"><span className="text-green-500">✓</span>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Rethink these</p>
          <ul className="space-y-1">
            {report.stepsToRethink.map((s) => (
              <li key={s} className="text-xs text-slate-600 flex gap-1.5"><span className="text-red-400">↺</span>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Per-archetype insights</h3>
        <div className="space-y-3">
          {report.personaInsights.map((pi, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{pi.archetype}</p>
              <p className="text-sm text-slate-700 mb-2">{pi.specificIssue}</p>
              <p className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-1">→ {pi.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SimulationDashboard() {
  const [data] = useState<SimulationResult>(SAMPLE);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Onboarding Simulation</h1>
            <p className="mt-1 text-sm text-slate-500">
              4 synthetic companies · 4 persona agents · 1 auditor · 1 observer
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Run: {data.runId}</p>
            <p className="text-xs text-slate-400">{new Date(data.runAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <strong>Showing demo data.</strong> To run a live simulation with real LLM agents, set your{" "}
          <code className="bg-amber-100 px-1 rounded">ANTHROPIC_API_KEY</code> and run:{" "}
          <code className="bg-amber-100 px-1 rounded">npx tsx simulation/run.ts</code>
        </div>
      </div>

      {/* Score strip */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {data.audits.map((a) => {
          const company = data.companies.find((c) => c.id === a.companyId)!;
          return (
            <div key={a.companyId} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
              <ScoreBadge score={a.overallDiscoveryScore} />
              <p className="text-xs font-medium text-slate-700 mt-1.5">{a.personaName.split(" ")[0]}</p>
              <p className="text-xs text-slate-400">{company.archetype}</p>
            </div>
          );
        })}
      </div>

      <Tabs defaultValue="observer">
        <TabsList className="mb-6">
          <TabsTrigger value="observer">Observer report</TabsTrigger>
          <TabsTrigger value="audits">Per-persona audits</TabsTrigger>
          <TabsTrigger value="companies">Company profiles</TabsTrigger>
        </TabsList>

        <TabsContent value="observer">
          <ObserverPanel report={data.observerReport} />
        </TabsContent>

        <TabsContent value="audits">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.audits.map((audit) => (
              <AuditCard
                key={audit.companyId}
                audit={audit}
                company={data.companies.find((c) => c.id === audit.companyId)!}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="companies">
          <div className="space-y-4">
            {data.companies.map((c) => (
              <Card key={c.id} className="border-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">{c.archetype} · {c.stage} · {c.city}</p>
                    </div>
                    <Badge variant="secondary">{c.persona.name}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Ground truth tool stack</p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.persona.toolStack.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Invisible comms</p>
                    <p className="text-xs text-red-600">{c.persona.invisibleComms.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Current projects</p>
                    <div className="space-y-1">
                      {c.persona.projects.map((p) => (
                        <div key={p.name} className="flex items-center gap-2">
                          <Badge variant={p.status === "active" ? "default" : p.status === "blocked" ? "destructive" : "secondary"} className="text-xs">{p.status}</Badge>
                          <span className="text-xs text-slate-700">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
