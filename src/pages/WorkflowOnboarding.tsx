import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, Mail, Calendar, ChevronRight, Plus, X, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "welcome" | "connect" | "mining" | "tools" | "narration" | "done";

interface Tool {
  id: string;
  name: string;
  source: string;
  emoji: string;
  confidence: "high" | "medium" | "low";
}

const DISCOVERED_TOOLS: Tool[] = [
  { id: "slack", name: "Slack", source: "from email signatures", emoji: "💬", confidence: "high" },
  { id: "linear", name: "Linear", source: "from [Linear] notifications", emoji: "📋", confidence: "high" },
  { id: "notion", name: "Notion", source: "from doc links", emoji: "📝", confidence: "high" },
  { id: "figma", name: "Figma", source: "from [Figma] notifications", emoji: "🎨", confidence: "medium" },
  { id: "mixpanel", name: "Mixpanel", source: "from [Mixpanel] reports", emoji: "📊", confidence: "medium" },
  { id: "zoom", name: "Zoom", source: "from calendar links", emoji: "📹", confidence: "high" },
  { id: "github", name: "GitHub", source: "from [GitHub] notifications", emoji: "🐙", confidence: "low" },
];

const EXTRA_TOOLS = ["Jira", "Asana", "Loom", "Miro", "HubSpot", "Confluence", "Coda", "Airtable"];

const STEP_LABELS: Record<Step, string> = {
  welcome: "Welcome",
  connect: "Connect",
  mining: "Scanning",
  tools: "Confirm tools",
  narration: "Your week",
  done: "Done",
};

const STEP_ORDER: Step[] = ["welcome", "connect", "mining", "tools", "narration", "done"];

function ProgressBar({ step }: { step: Step }) {
  const idx = STEP_ORDER.indexOf(step);
  const total = STEP_ORDER.length - 1;
  const pct = Math.round((idx / total) * 100);

  return (
    <div className="mb-10">
      <div className="flex justify-between mb-2">
        {STEP_ORDER.slice(0, -1).map((s, i) => (
          <span
            key={s}
            className={cn(
              "text-xs font-medium",
              i < idx ? "text-blue-600" : i === idx ? "text-blue-700" : "text-slate-400"
            )}
          >
            {STEP_LABELS[s]}
          </span>
        ))}
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-2">
        <Sparkles className="w-8 h-8 text-blue-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Map your workflow</h1>
        <p className="mt-3 text-slate-600 max-w-sm mx-auto leading-relaxed">
          We'll build a picture of how you work — your projects, collaborators, and tools — so we can surface the right help at the right time.
        </p>
      </div>

      <div className="bg-slate-50 rounded-xl p-5 text-left space-y-3 max-w-sm mx-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What we'll do</p>
        {[
          { icon: "📧", text: "Connect Gmail + Calendar (one click)" },
          { icon: "🔍", text: "Detect the tools your team uses" },
          { icon: "🗣️", text: "Ask about your week in plain language" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-start gap-3 text-sm text-slate-700">
            <span className="text-base leading-tight">{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 max-w-xs mx-auto">
        Takes about 5 minutes. You control what stays connected.
      </p>

      <Button size="lg" onClick={onNext} className="w-full max-w-xs mx-auto flex gap-2">
        Get started <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function ConnectStep({ onConnect, connecting }: { onConnect: () => void; connecting: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Connect Gmail + Calendar</h2>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed">
          This single grant tells us who you work with, what cadences you keep, and which tools your team actually uses — without you listing them manually.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-5 space-y-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What we read</p>
          {[
            {
              icon: <Mail className="w-4 h-4 text-blue-500" />,
              title: "Gmail",
              detail: "Sender/recipient patterns, notification subjects (e.g. \"[Linear] You were mentioned\"), doc links in signatures.",
            },
            {
              icon: <Calendar className="w-4 h-4 text-green-500" />,
              title: "Google Calendar",
              detail: "Who organises your 1:1s, meeting recurrence, video-link domains (Zoom vs Meet).",
            },
          ].map(({ icon, title, detail }) => (
            <div key={title} className="flex gap-3">
              <div className="mt-0.5 flex-shrink-0">{icon}</div>
              <div>
                <p className="text-sm font-medium text-slate-800">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
              </div>
            </div>
          ))}

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">What we won't do</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li className="flex items-center gap-1.5"><X className="w-3 h-3 text-red-400" /> Read email body content</li>
              <li className="flex items-center gap-1.5"><X className="w-3 h-3 text-red-400" /> Store credentials or raw data</li>
              <li className="flex items-center gap-1.5"><X className="w-3 h-3 text-red-400" /> Share anything with your employer</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Button
        size="lg"
        onClick={onConnect}
        disabled={connecting}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm"
        variant="outline"
      >
        {connecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </>
        )}
      </Button>
    </div>
  );
}

function MiningStep({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  const phases = [
    "Reading 90 days of Gmail threads…",
    "Scanning calendar for meeting patterns…",
    "Extracting tool signals from notifications…",
    "Building your tool map…",
  ];

  useState(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    phases.forEach((_, i) => {
      timers.push(setTimeout(() => setPhase(i), i * 700));
    });
    timers.push(setTimeout(onDone, phases.length * 700 + 400));
    return () => timers.forEach(clearTimeout);
  });

  return (
    <div className="text-center space-y-8 py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Scanning your signal</h2>
        <p className="text-sm text-slate-500">This takes just a moment.</p>
      </div>
      <div className="space-y-2 text-left max-w-xs mx-auto">
        {phases.map((msg, i) => (
          <div key={msg} className={cn("flex items-center gap-3 text-sm transition-all duration-300", i <= phase ? "text-slate-700" : "text-slate-300")}>
            {i < phase ? (
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : i === phase ? (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-slate-200 flex-shrink-0" />
            )}
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolsStep({
  tools,
  selected,
  onToggle,
  onAddExtra,
  extraAdded,
  onNext,
}: {
  tools: Tool[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onAddExtra: (name: string) => void;
  extraAdded: Set<string>;
  onNext: () => void;
}) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">We found your tool stack</h2>
        <p className="mt-2 text-sm text-slate-600">
          We detected these from your email and calendar. Uncheck anything that's wrong, and add what's missing.
        </p>
      </div>

      <div className="space-y-2">
        {tools.map((tool) => {
          const checked = selected.has(tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => onToggle(tool.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                checked
                  ? "border-blue-200 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <span className="text-xl leading-none">{tool.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", checked ? "text-blue-900" : "text-slate-700")}>
                  {tool.name}
                </p>
                <p className="text-xs text-slate-400 truncate">{tool.source}</p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                checked ? "border-blue-500 bg-blue-500" : "border-slate-300"
              )}>
                {checked && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        })}

        {extraAdded.size > 0 && Array.from(extraAdded).map((name) => (
          <div key={name} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50">
            <span className="text-xl leading-none">🔧</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">{name}</p>
              <p className="text-xs text-slate-400">added by you</p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
        ))}
      </div>

      <div>
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          {showMore ? "Hide suggestions" : "Add a tool"}
        </button>

        {showMore && (
          <div className="mt-3 flex flex-wrap gap-2">
            {EXTRA_TOOLS.filter((t) => !extraAdded.has(t)).map((name) => (
              <button
                key={name}
                onClick={() => onAddExtra(name)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all"
              >
                + {name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button size="lg" onClick={onNext} className="w-full flex gap-2">
        Looks right <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function NarrationStep({
  value,
  onChange,
  onNext,
  onSkip,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Tell me about your week</h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          5 minutes of plain language gives us the signal that no tool can — your priorities, blockers, and the work that lives only in your head.
        </p>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm text-slate-600">
        <p className="font-medium text-slate-700">To get you started:</p>
        <ul className="space-y-1.5 text-slate-500">
          <li className="flex gap-2"><span>→</span><span>What did you actually work on last week?</span></li>
          <li className="flex gap-2"><span>→</span><span>What are you trying to move forward this week?</span></li>
          <li className="flex gap-2"><span>→</span><span>Who do you talk to most? What about?</span></li>
          <li className="flex gap-2"><span>→</span><span>What's stuck — waiting on someone or something?</span></li>
        </ul>
      </div>

      <Textarea
        placeholder="I spent most of last week on the KYC drop-off analysis — we're trying to figure out why users are abandoning the funnel at the PAN verification step. Pulled data from Mixpanel, ran it by Karthik on Monday…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="resize-none text-sm"
      />

      <div className="flex gap-3">
        <Button
          size="lg"
          onClick={onNext}
          disabled={value.trim().length < 20}
          className="flex-1"
        >
          Done
        </Button>
        <Button size="lg" variant="ghost" onClick={onSkip} className="text-slate-500">
          Skip for now
        </Button>
      </div>
    </div>
  );
}

function DoneStep({
  selectedTools,
  allTools,
  extraAdded,
  narration,
}: {
  selectedTools: Set<string>;
  allTools: Tool[];
  extraAdded: Set<string>;
  narration: string;
}) {
  const confirmedTools = allTools.filter((t) => selectedTools.has(t.id));
  const totalTools = confirmedTools.length + extraAdded.size;

  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50">
        <Check className="w-8 h-8 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">You're set up</h2>
        <p className="mt-2 text-slate-600 text-sm">
          Here's what we've learned about your workflow.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-left">
        {[
          { label: "Tools detected", value: totalTools.toString(), sub: "in your stack" },
          { label: "Signal sources", value: "2", sub: "Gmail + Calendar" },
          { label: "Week context", value: narration.trim().length > 0 ? "✓" : "—", sub: narration.trim().length > 0 ? "captured" : "skipped" },
        ].map(({ label, value, sub }) => (
          <Card key={label} className="border-slate-200">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs font-medium text-slate-700 mt-0.5">{label}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-left space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Confirmed tools</p>
        <div className="flex flex-wrap gap-2">
          {confirmedTools.map((t) => (
            <Badge key={t.id} variant="secondary" className="gap-1.5 text-xs py-1 px-2.5">
              {t.emoji} {t.name}
            </Badge>
          ))}
          {Array.from(extraAdded).map((name) => (
            <Badge key={name} variant="secondary" className="gap-1.5 text-xs py-1 px-2.5">
              🔧 {name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left text-sm text-blue-800">
        <p className="font-medium mb-1">What's next</p>
        <p className="text-blue-700 text-xs leading-relaxed">
          We'll connect to Slack and your other tools on demand — only when there's specific value to unlock. No bulk-OAuth walls.
        </p>
      </div>

      <Button size="lg" className="w-full" onClick={() => window.location.href = "/"}>
        Go to dashboard
      </Button>
    </div>
  );
}

export default function WorkflowOnboarding() {
  const [step, setStep] = useState<Step>("welcome");
  const [connecting, setConnecting] = useState(false);
  const [selectedTools, setSelectedTools] = useState<Set<string>>(
    new Set(DISCOVERED_TOOLS.filter((t) => t.confidence !== "low").map((t) => t.id))
  );
  const [extraAdded, setExtraAdded] = useState<Set<string>>(new Set());
  const [narration, setNarration] = useState("");

  const handleGoogleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setStep("mining");
    }, 1800);
  };

  const toggleTool = (id: string) => {
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addExtraTool = (name: string) => {
    setExtraAdded((prev) => new Set([...prev, name]));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-12 pb-16 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <span className="text-sm font-semibold text-slate-400 tracking-wide uppercase">Workflow setup</span>
        </div>

        <ProgressBar step={step} />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {step === "welcome" && <WelcomeStep onNext={() => setStep("connect")} />}
          {step === "connect" && (
            <ConnectStep onConnect={handleGoogleConnect} connecting={connecting} />
          )}
          {step === "mining" && <MiningStep onDone={() => setStep("tools")} />}
          {step === "tools" && (
            <ToolsStep
              tools={DISCOVERED_TOOLS}
              selected={selectedTools}
              onToggle={toggleTool}
              onAddExtra={addExtraTool}
              extraAdded={extraAdded}
              onNext={() => setStep("narration")}
            />
          )}
          {step === "narration" && (
            <NarrationStep
              value={narration}
              onChange={setNarration}
              onNext={() => setStep("done")}
              onSkip={() => setStep("done")}
            />
          )}
          {step === "done" && (
            <DoneStep
              selectedTools={selectedTools}
              allTools={DISCOVERED_TOOLS}
              extraAdded={extraAdded}
              narration={narration}
            />
          )}
        </div>
      </div>
    </div>
  );
}
