
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Flame,
  Search,
  BookOpen,
  Target,
  Users,
  TrendingUp,
  Shield,
  Database,
  Map,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Sparkles,
  BarChart2,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Question Framework ───────────────────────────────────────────────────────

interface QuestionCategory {
  category: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  questions: string[];
}

const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    category: "Context & Vision",
    icon: Target,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    questions: [
      "What problem are you solving, and for whom exactly?",
      "What does success look like in 6 months? In 2 years?",
      "What is your unique angle vs. existing solutions?",
      "What constraints are you operating under — time, budget, team size?",
      "Who is the primary stakeholder and what do they care most about?",
    ],
  },
  {
    category: "User & Trader Types",
    icon: Users,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    questions: [
      "Who are the different types of users? (retail, HNI, institutional, prop desk...)",
      "What are their core motivations — hedging, speculation, arbitrage, portfolio diversification?",
      "How tech-savvy is your primary user?",
      "What does a typical trading day look like for each user type?",
      "What are the top 3 frustrations users have with current tools?",
      "What triggers a user to take action — price alert, news, technical signal?",
    ],
  },
  {
    category: "Competition & Market",
    icon: TrendingUp,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    questions: [
      "Who are the top 3–5 direct competitors in this market?",
      "Why do users prefer each competitor — UX, price, features, trust?",
      "What features do competitors have that you lack?",
      "What are competitors missing that you can uniquely provide?",
      "Is the market growing, shrinking, or fragmented?",
      "What regulatory or licensing requirements apply in your target geography?",
    ],
  },
  {
    category: "Data Sources & Architecture",
    icon: Database,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    questions: [
      "What are ALL the data sources powering this system — exchange feeds, news, weather, macroeconomic?",
      "How real-time does data need to be — tick-by-tick, 1-min, end-of-day?",
      "What happens when a data source goes down or sends bad data?",
      "Who owns the data — exchange, vendor, self-collected? Are there licensing costs?",
      "What volume of data are we talking — rows/day, events/second?",
      "How do you validate data quality and detect anomalies or corrupted prices?",
    ],
  },
  {
    category: "Calculations & Financial Logic",
    icon: BarChart2,
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    questions: [
      "What financial calculations are core to the user experience — P&L, margin, MTM?",
      "How are contracts priced — spot, futures basis, contango/backwardation?",
      "How do you handle contract rollovers, expiry, and delivery?",
      "What fees, taxes (STT, GST, exchange fees), and slippage must be modeled?",
      "What statistical or analytical models will power insights — VWAP, OI analysis, correlation?",
      "How are lot sizes, tick sizes, and circuit limits managed?",
    ],
  },
  {
    category: "Shadow System & Validation",
    icon: Search,
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    questions: [
      "What does 'running a shadow system' mean for this domain — paper trading, parallel feeds?",
      "How will you benchmark shadow results against live market ground truth?",
      "What is the acceptable error threshold before going live?",
      "How long do you need to run the shadow system before trusting it?",
      "Who reviews shadow system results — engineers, traders, compliance?",
      "What instrumentation / logging will the shadow system need?",
    ],
  },
  {
    category: "Edge Cases & Risks",
    icon: Shield,
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    questions: [
      "What is the worst-case scenario if this system fails in production?",
      "What happens during market circuit breakers, trading halts, or exchange outages?",
      "How do you handle extreme volatility — limit-up/limit-down moves?",
      "What are the fraud and market manipulation vectors to defend against?",
      "How do you handle timezone, holiday calendar, and settlement cycle differences?",
      "What regulatory reporting obligations does this feature trigger?",
    ],
  },
  {
    category: "Implementation Roadmap",
    icon: Map,
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    questions: [
      "What is the MVP — the smallest version that delivers real user value?",
      "What must you build vs. buy vs. partner for?",
      "Does your current tech stack support this, or do you need new infrastructure?",
      "What skills does your team currently lack for this project?",
      "What would a 3-phase rollout look like — pilot, beta, full launch?",
      "How will you validate with real users before committing to full launch?",
    ],
  },
];

// ─── Research Plan Sections ───────────────────────────────────────────────────

interface ResearchSection {
  title: string;
  icon: React.ElementType;
  color: string;
  placeholder: string;
}

const RESEARCH_SECTIONS: ResearchSection[] = [
  {
    title: "Domain Overview",
    icon: BookOpen,
    color: "text-purple-700",
    placeholder:
      "Key concepts, terminology, market structure, how it works, regulatory environment, key players...",
  },
  {
    title: "User & Stakeholder Map",
    icon: Users,
    color: "text-blue-700",
    placeholder:
      "User types, their goals, motivations, trading behaviors, pain points, jobs-to-be-done...",
  },
  {
    title: "Competitor Intelligence",
    icon: TrendingUp,
    color: "text-green-700",
    placeholder:
      "Top competitors, why users choose them, their key features, pricing, weaknesses, gaps you can fill...",
  },
  {
    title: "Data Sources & Feeds",
    icon: Database,
    color: "text-orange-700",
    placeholder:
      "Exchange APIs, data vendors, news feeds, alternative data, licensing costs, SLAs, quality controls...",
  },
  {
    title: "Shadow System Design",
    icon: Search,
    color: "text-indigo-700",
    placeholder:
      "How to run a parallel validation system — inputs, outputs, comparison methodology, success criteria...",
  },
  {
    title: "Edge Cases & Risk Register",
    icon: AlertTriangle,
    color: "text-red-700",
    placeholder:
      "All failure modes, market events, regulatory risks, fraud vectors, data quality issues, compliance gaps...",
  },
  {
    title: "Implementation Roadmap",
    icon: Map,
    color: "text-slate-700",
    placeholder:
      "Phase 1 MVP, Phase 2 growth features, Phase 3 scale — milestones, team requirements, decision gates...",
  },
];

// ─── Helper Components ────────────────────────────────────────────────────────

interface GrillCategoryProps {
  cat: QuestionCategory;
  answers: Record<string, string>;
  checked: Record<string, boolean>;
  onAnswer: (key: string, value: string) => void;
  onCheck: (key: string) => void;
}

const GrillCategory: React.FC<GrillCategoryProps> = ({ cat, answers, checked, onAnswer, onCheck }) => {
  const [open, setOpen] = useState(true);
  const Icon = cat.icon;
  const answeredCount = cat.questions.filter((_, i) => checked[`${cat.category}-${i}`]).length;

  return (
    <div className={cn("border rounded-lg overflow-hidden mb-3", cat.borderColor)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-left",
          cat.bgColor
        )}
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className={cat.color} />
          <span className={cn("font-semibold text-sm", cat.color)}>{cat.category}</span>
          <Badge variant="secondary" className="text-xs ml-1">
            {answeredCount}/{cat.questions.length}
          </Badge>
        </div>
        {open ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
      </button>

      {open && (
        <div className="divide-y divide-slate-100 bg-white">
          {cat.questions.map((q, i) => {
            const key = `${cat.category}-${i}`;
            const isChecked = !!checked[key];
            return (
              <div key={key} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onCheck(key)}
                    className="mt-0.5 flex-shrink-0"
                    title={isChecked ? "Mark as open" : "Mark as answered"}
                  >
                    {isChecked ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Circle size={16} className="text-slate-300" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium mb-1", isChecked ? "text-slate-400 line-through" : "text-slate-800")}>
                      {q}
                    </p>
                    <Textarea
                      value={answers[key] || ""}
                      onChange={(e) => onAnswer(key, e.target.value)}
                      placeholder="Your answer / notes..."
                      className="text-xs min-h-[60px] resize-none bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const BrainstormingResearch: React.FC = () => {
  const [topic, setTopic] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [researchNotes, setResearchNotes] = useState<Record<string, string>>({});

  const totalQuestions = QUESTION_CATEGORIES.reduce((acc, c) => acc + c.questions.length, 0);
  const answeredCount = Object.values(checked).filter(Boolean).length;
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleStart = () => {
    if (topic.trim()) setSessionStarted(true);
  };

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheck = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame size={24} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Grill Me</h1>
            <p className="text-slate-500 text-sm">Super-powered brainstorming + auto research</p>
          </div>
        </div>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Enter a topic or problem you're tackling. "Grill Me" asks the deep questions you haven't thought of.
          "Research Plan" gives you a structured canvas to document your findings.
        </p>
      </header>

      {/* Topic Input */}
      <Card className="mb-6 border-orange-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb size={16} className="text-orange-500" />
            What are you brainstorming?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. 'Implementing commodities trading in an Indian stock market app — I need to understand the market, user types, data sources, calculations, competitors, and build a complete roadmap.'"
            className="min-h-[80px] resize-none text-sm"
          />
          <div className="flex gap-2 items-center">
            <Button
              onClick={handleStart}
              disabled={!topic.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Flame size={14} className="mr-2" />
              Grill Me
            </Button>
            <Button
              onClick={handleStart}
              disabled={!topic.trim()}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Sparkles size={14} className="mr-2" />
              Auto Research
            </Button>
            {sessionStarted && (
              <span className="text-xs text-slate-500 ml-auto">
                {answeredCount}/{totalQuestions} questions addressed &nbsp;·&nbsp;
                <span className="font-medium text-green-600">{progressPct}% complete</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress bar */}
      {sessionStarted && (
        <div className="mb-6 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-green-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Main Content */}
      {sessionStarted && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Questions + Research Plan */}
          <div className="xl:col-span-2">
            <Tabs defaultValue="grill">
              <TabsList className="mb-4">
                <TabsTrigger value="grill" className="gap-2">
                  <Flame size={14} /> Grill Me
                </TabsTrigger>
                <TabsTrigger value="research" className="gap-2">
                  <Sparkles size={14} /> Research Plan
                </TabsTrigger>
              </TabsList>

              {/* ── Grill Me Tab ── */}
              <TabsContent value="grill">
                <div className="mb-3 p-3 bg-orange-50 border border-orange-100 rounded-lg text-sm text-orange-800">
                  <strong>Topic:</strong> {topic}
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Work through each category. Check off a question when you've thought it through.
                  Your answers auto-save to the Research Canvas.
                </p>
                {QUESTION_CATEGORIES.map((cat) => (
                  <GrillCategory
                    key={cat.category}
                    cat={cat}
                    answers={answers}
                    checked={checked}
                    onAnswer={handleAnswer}
                    onCheck={handleCheck}
                  />
                ))}
              </TabsContent>

              {/* ── Research Plan Tab ── */}
              <TabsContent value="research">
                <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                  <strong>Research canvas for:</strong> {topic}
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Document your findings in each section. Use this as your living research document.
                </p>
                <div className="space-y-4">
                  {RESEARCH_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    return (
                      <Card key={section.title} className="border-slate-200">
                        <CardHeader className="pb-2 pt-4">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Icon size={15} className={section.color} />
                            {section.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            value={researchNotes[section.title] || ""}
                            onChange={(e) =>
                              setResearchNotes((prev) => ({
                                ...prev,
                                [section.title]: e.target.value,
                              }))
                            }
                            placeholder={section.placeholder}
                            className="min-h-[100px] resize-none text-sm bg-slate-50"
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Research Canvas Summary */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb size={14} className="text-yellow-500" />
                    Key Answers So Far
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(answers).filter((k) => answers[k]?.trim()).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      Start answering questions on the left — your notes will appear here.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {QUESTION_CATEGORIES.map((cat) =>
                        cat.questions.map((q, i) => {
                          const key = `${cat.category}-${i}`;
                          if (!answers[key]?.trim()) return null;
                          return (
                            <div key={key} className="border-l-2 border-orange-300 pl-2">
                              <p className="text-xs font-medium text-slate-700">{q}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{answers[key]}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progress by category */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Coverage by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {QUESTION_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const done = cat.questions.filter((_, i) => checked[`${cat.category}-${i}`]).length;
                      const pct = Math.round((done / cat.questions.length) * 100);
                      return (
                        <div key={cat.category}>
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1">
                              <Icon size={11} className={cat.color} />
                              <span className="text-xs text-slate-600">{cat.category}</span>
                            </div>
                            <span className="text-xs text-slate-400">{done}/{cat.questions.length}</span>
                          </div>
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 to-green-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Research Plan filled % */}
              {Object.keys(researchNotes).length > 0 && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Research Plan Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      {RESEARCH_SECTIONS.map((s) => (
                        <div key={s.title} className="flex items-center gap-2">
                          {researchNotes[s.title]?.trim() ? (
                            <CheckCircle2 size={12} className="text-green-500" />
                          ) : (
                            <Circle size={12} className="text-slate-300" />
                          )}
                          <span className="text-xs text-slate-600">{s.title}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!sessionStarted && (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-orange-200">
          <div className="p-4 bg-orange-50 rounded-full mb-4">
            <Flame size={32} className="text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Ready to get grilled?</h2>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            Enter your topic above and hit <strong>Grill Me</strong> to surface every question you haven't thought of yet —
            or <strong>Auto Research</strong> to open a structured research canvas.
          </p>
        </div>
      )}
    </div>
  );
};

export default BrainstormingResearch;
