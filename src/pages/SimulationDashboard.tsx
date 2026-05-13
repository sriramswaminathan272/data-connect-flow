import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  SimulationResult,
  AuditResult,
  CompanyProfile,
  ObserverReport,
  PersonaRole,
} from "../../simulation/types";

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "bg-green-100 text-green-800"
      : score >= 55
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", color)}>
      {score}/100
    </span>
  );
}

function SeverityDot({ severity }: { severity: "high" | "medium" | "low" }) {
  const color = { high: "bg-red-500", medium: "bg-yellow-400", low: "bg-blue-400" }[severity];
  return <span className={cn("inline-block w-2 h-2 rounded-full flex-shrink-0 mt-1.5", color)} />;
}

const ROLE_LABELS: Record<PersonaRole, string> = { pm: "PM", analyst: "Analyst", marketing: "Marketing" };
const ROLE_COLORS: Record<PersonaRole, string> = {
  pm: "bg-blue-50 text-blue-700 border-blue-200",
  analyst: "bg-purple-50 text-purple-700 border-purple-200",
  marketing: "bg-orange-50 text-orange-700 border-orange-200",
};

function AuditCard({ audit, company }: { audit: AuditResult; company: CompanyProfile }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{audit.personaName}</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {company.persona.role} · {company.name} · {company.archetype}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <ScoreBadge score={audit.overallDiscoveryScore} />
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium border",
                ROLE_COLORS[audit.personaRole]
              )}
            >
              {ROLE_LABELS[audit.personaRole]}
            </span>
          </div>
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
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Narration richness
          </p>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                audit.narration.richness === "high"
                  ? "default"
                  : audit.narration.richness === "medium"
                  ? "secondary"
                  : "outline"
              }
            >
              {audit.narration.richness}
            </Badge>
            <span className="text-slate-500 text-xs">
              {audit.narration.projectsRevealed.length} projects ·{" "}
              {audit.narration.peopleRevealed.length} people ·{" "}
              {audit.narration.blockersSurfaced.length} blockers
            </span>
          </div>
          {audit.narration.richnessReason && (
            <p className="text-xs text-slate-500 mt-1 italic">{audit.narration.richnessReason}</p>
          )}
        </div>

        {audit.criticalGaps.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">
              Critical gaps
            </p>
            <ul className="space-y-1">
              {audit.criticalGaps.map((g) => (
                <li key={g} className="text-xs text-slate-600 flex gap-1.5">
                  <span className="text-red-400 flex-shrink-0">✗</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {audit.whatWorkedWell.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
              What worked
            </p>
            <ul className="space-y-1">
              {audit.whatWorkedWell.map((w) => (
                <li key={w} className="text-xs text-slate-600 flex gap-1.5">
                  <span className="text-green-500 flex-shrink-0">✓</span>
                  {w}
                </li>
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
                    <Badge variant="outline" className="text-xs">
                      {fp.step}
                    </Badge>
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

      {report.roleInsights && report.roleInsights.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Role insights</h3>
          <div className="space-y-3">
            {report.roleInsights.map((ri, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-4">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium border",
                    ROLE_COLORS[ri.role] ?? "bg-slate-50 text-slate-700 border-slate-200"
                  )}
                >
                  {ROLE_LABELS[ri.role] ?? ri.role}
                </span>
                <p className="text-sm text-slate-700 mt-2 mb-2">{ri.pattern}</p>
                <p className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-1">
                  → {ri.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.companyInsights && report.companyInsights.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Company insights</h3>
          <div className="space-y-3">
            {report.companyInsights.map((ci, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  {ci.companyName}
                </p>
                <p className="text-sm text-slate-700 mb-2">{ci.crossRolePattern}</p>
                <p className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-1">
                  → {ci.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
            Steps that worked
          </p>
          <ul className="space-y-1">
            {report.stepsThatWorked.map((s) => (
              <li key={s} className="text-xs text-slate-600 flex gap-1.5">
                <span className="text-green-500">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">
            Rethink these
          </p>
          <ul className="space-y-1">
            {report.stepsToRethink.map((s) => (
              <li key={s} className="text-xs text-slate-600 flex gap-1.5">
                <span className="text-red-400">↺</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Score matrix: 5 companies × 3 roles ──────────────────────────────────────

function ScoreMatrix({ data }: { data: SimulationResult }) {
  const companyKeys = [...new Set(data.companies.map((c) => c.companyKey))];
  const roles: PersonaRole[] = ["pm", "analyst", "marketing"];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 pr-4 text-slate-500 font-medium">Company</th>
            {roles.map((r) => (
              <th key={r} className="px-3 py-2 text-center text-slate-500 font-medium">
                {ROLE_LABELS[r]}
              </th>
            ))}
            <th className="px-3 py-2 text-center text-slate-500 font-medium">Avg</th>
          </tr>
        </thead>
        <tbody>
          {companyKeys.map((key) => {
            const companyName =
              data.companies.find((c) => c.companyKey === key)?.name ?? key;
            const companyAudits = data.audits.filter((a) => a.companyKey === key);
            const avg =
              companyAudits.length > 0
                ? Math.round(
                    companyAudits.reduce((s, a) => s + a.overallDiscoveryScore, 0) /
                      companyAudits.length
                  )
                : 0;
            return (
              <tr key={key} className="border-t border-slate-100">
                <td className="py-2 pr-4 font-medium text-slate-700">{companyName}</td>
                {roles.map((role) => {
                  const audit = companyAudits.find((a) => a.personaRole === role);
                  return (
                    <td key={role} className="px-3 py-2 text-center">
                      {audit ? (
                        <ScoreBadge score={audit.overallDiscoveryScore} />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center font-bold">
                  <ScoreBadge score={avg} />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200">
            <td className="py-2 pr-4 font-semibold text-slate-600">Role avg</td>
            {roles.map((role) => {
              const roleAudits = data.audits.filter((a) => a.personaRole === role);
              const avg =
                roleAudits.length > 0
                  ? Math.round(
                      roleAudits.reduce((s, a) => s + a.overallDiscoveryScore, 0) /
                        roleAudits.length
                    )
                  : 0;
              return (
                <td key={role} className="px-3 py-2 text-center">
                  <ScoreBadge score={avg} />
                </td>
              );
            })}
            <td className="px-3 py-2 text-center font-bold">
              <ScoreBadge
                score={Math.round(
                  data.audits.reduce((s, a) => s + a.overallDiscoveryScore, 0) /
                    Math.max(data.audits.length, 1)
                )}
              />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Empty / loading states ────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-64 mx-auto mb-4" />
        <div className="h-4 bg-slate-100 rounded w-48 mx-auto" />
      </div>
      <p className="mt-6 text-sm text-slate-400">Loading simulation results…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-4">🔬</p>
      <h2 className="text-xl font-bold text-slate-800 mb-2">No simulation results yet</h2>
      <p className="text-slate-500 text-sm mb-6">
        Run the multi-agent simulation to generate results. It runs 15 personas across 5 companies
        and writes the output to <code className="bg-slate-100 px-1 rounded">public/simulation-results/latest.json</code>.
      </p>
      <div className="bg-slate-900 rounded-xl p-4 text-left text-sm font-mono">
        <p className="text-green-400"># Make sure ANTHROPIC_API_KEY is set, then:</p>
        <p className="text-white mt-1">npm run simulate</p>
      </div>
      <p className="text-xs text-slate-400 mt-4">
        Takes ~3–5 minutes · 15 LLM persona runs + 15 audits + 1 observer synthesis
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SimulationDashboard() {
  const [data, setData] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch("/simulation-results/latest.json")
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json() as Promise<SimulationResult>;
      })
      .then(setData)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (fetchError || !data) return <EmptyState />;

  const uniqueCompanies: CompanyProfile[] = [];
  const seen = new Set<string>();
  for (const c of data.companies) {
    if (!seen.has(c.companyKey)) { seen.add(c.companyKey); uniqueCompanies.push(c); }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Onboarding Simulation</h1>
            <p className="mt-1 text-sm text-slate-500">
              {data.companies.length} personas · {uniqueCompanies.length} companies · 3 roles · 4 agents
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Run: {data.runId}</p>
            <p className="text-xs text-slate-400">{new Date(data.runAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Score matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-slate-600 mb-4">Discovery scores · 5 companies × 3 roles</h2>
        <ScoreMatrix data={data} />
      </div>

      <Tabs defaultValue="observer">
        <TabsList className="mb-6">
          <TabsTrigger value="observer">Observer report</TabsTrigger>
          <TabsTrigger value="audits">Per-persona audits ({data.audits.length})</TabsTrigger>
          <TabsTrigger value="companies">Company profiles ({uniqueCompanies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="observer">
          <ObserverPanel report={data.observerReport} />
        </TabsContent>

        <TabsContent value="audits">
          {/* Group audits by company */}
          {uniqueCompanies.map((company) => {
            const companyAudits = data.audits.filter((a) => a.companyKey === company.companyKey);
            return (
              <div key={company.companyKey} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">{company.name}</h3>
                  <span className="text-xs text-slate-400">{company.archetype} · {company.stage}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["pm", "analyst", "marketing"] as PersonaRole[]).map((role) => {
                    const audit = companyAudits.find((a) => a.personaRole === role);
                    const auditCompany = data.companies.find(
                      (c) => c.companyKey === company.companyKey && c.personaRole === role
                    );
                    if (!audit || !auditCompany) return null;
                    return <AuditCard key={role} audit={audit} company={auditCompany} />;
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="companies">
          <div className="space-y-6">
            {uniqueCompanies.map((company) => {
              const allPersonas = data.companies.filter((c) => c.companyKey === company.companyKey);
              return (
                <Card key={company.companyKey} className="border-slate-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{company.name}</CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {company.archetype} · {company.stage} · {company.size} · {company.city}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {allPersonas.map((p) => (
                          <span
                            key={p.personaRole}
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs border",
                              ROLE_COLORS[p.personaRole]
                            )}
                          >
                            {ROLE_LABELS[p.personaRole]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-4">
                    {allPersonas.map((p) => (
                      <div key={p.personaRole} className="border-t border-slate-100 pt-3 first:border-0 first:pt-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs border",
                              ROLE_COLORS[p.personaRole]
                            )}
                          >
                            {ROLE_LABELS[p.personaRole]}
                          </span>
                          <span className="font-medium text-slate-700">{p.persona.name}</span>
                          <span className="text-xs text-slate-400">— {p.persona.role}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {p.persona.toolStack.map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                        {p.persona.invisibleComms.length > 0 && (
                          <p className="text-xs text-red-600">
                            Invisible: {p.persona.invisibleComms.join(", ")}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {p.persona.projects.map((proj) => (
                            <div key={proj.name} className="flex items-center gap-1">
                              <Badge
                                variant={
                                  proj.status === "active"
                                    ? "default"
                                    : proj.status === "blocked"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {proj.status}
                              </Badge>
                              <span className="text-xs text-slate-600">{proj.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
