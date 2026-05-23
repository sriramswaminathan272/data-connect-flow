import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, ChevronRight, SkipForward, Sparkles, CheckCircle2 } from 'lucide-react';
import { InterviewAnswer, DiscoveredTool } from '@/types/artisan';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question: string;
  subtext?: string;
  type: 'text' | 'chips' | 'choice';
  placeholder?: string;
  options?: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 'responsibilities',
    question: 'Walk me through your week.',
    subtext: 'What are the 2–3 things you're most responsible for getting done?',
    type: 'text',
    placeholder: 'e.g. I manage our product roadmap, run weekly sprint reviews, and keep stakeholders aligned on what we're building and why...',
  },
  {
    id: 'tools',
    question: 'What tools do you live in every day?',
    subtext: 'Start with the ones you open first. We've pre-filled what we detected — remove any you don't use.',
    type: 'chips',
    placeholder: 'Add a tool...',
  },
  {
    id: 'wish',
    question: 'What's one thing you do every week that you wish you never had to touch again?',
    subtext: 'The more specific the better. A workflow, a report, a meeting — anything.',
    type: 'text',
    placeholder: 'e.g. Writing the weekly status update, chasing people for updates, re-pulling the same dashboard every Monday...',
  },
  {
    id: 'activeProject',
    question: 'What's the one project that's most top-of-mind right now?',
    subtext: 'The thing you'd open first if you had 30 uninterrupted minutes.',
    type: 'text',
    placeholder: 'e.g. We're launching a new pricing page next sprint and I'm the DRI. Or: I need to deliver a campaign performance report by Friday...',
  },
  {
    id: 'workStyle',
    question: 'Last one — how do you mostly work?',
    subtext: 'This helps Artisan know when to surface deep-work capabilities vs. coordination ones.',
    type: 'choice',
    options: [
      'Mostly heads-down, deep work',
      'Lots of collaboration and coordination',
      'A mix — both modes depending on the day',
    ],
  },
];

function isMetaAnswer(text: string): boolean {
  const lower = text.toLowerCase();
  if (lower.includes('onboarding')) return true;
  if (lower.includes('this interview')) return true;
  if (lower.includes('this form')) return true;
  if (lower.includes('this questionnaire')) return true;
  if (lower.includes('these questions')) return true;
  if (lower.includes('this survey')) return true;
  if (lower.includes('filling out forms')) return true;
  if (lower.includes('filling in forms')) return true;
  if (lower.includes('explain myself')) return true;
  if (lower.includes('setup process')) return true;
  if (lower.includes('this setup')) return true;
  if (lower.includes('answering questions')) return true;
  if (lower.includes('forms like this')) return true;
  if (lower.includes('this kind of') && lower.includes('question')) return true;
  if (lower.includes('this') && lower.includes('interview')) return true;
  return false;
}

// ─── Genie Moment Overlay ──────────────────────────────────────────────────────

interface GenieMomentProps {
  wishText: string;
  discoveredTools: DiscoveredTool[];
  onDone: () => void;
}

function GenieMoment({ wishText, discoveredTools, onDone }: GenieMomentProps) {
  const [phase, setPhase] = useState<'working' | 'done'>('working');
  const toolCount = discoveredTools.filter((t) => t.confidence !== 'low').length;

  const autoSources = [
    toolCount > 0 ? `Found ${toolCount} tools from your integrations` : 'Scanned your connected integrations',
    'Detected active projects from Drive',
    'Inferred work patterns from your tool usage',
    'Skipping the rest of this interview',
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('done'), 1800);
    const t2 = setTimeout(() => onDone(), 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4">
        {phase === 'working' && (
          <div className="flex flex-col items-center gap-4 text-center animate-in fade-in duration-300">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl border-2 border-indigo-400 animate-ping opacity-30" />
            </div>
            <div>
              <p className="text-white text-xl font-semibold">Okay.</p>
              <p className="text-indigo-300 text-lg mt-0.5">Working on it.</p>
            </div>
            <div className="flex gap-1 mt-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center gap-5 text-center animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white text-2xl font-semibold">Fixed it.</p>
              <p className="text-slate-400 text-sm mt-1.5 max-w-[260px] leading-relaxed">
                I already have everything I need. You won't have to answer this again.
              </p>
            </div>
            <div className="w-full bg-slate-900 rounded-xl p-4 text-left space-y-2.5">
              {autoSources.map((source, i) => (
                <div
                  key={source}
                  className="flex items-center gap-2.5 text-sm text-slate-300 animate-in fade-in duration-300"
                  style={{ animationDelay: `${i * 180}ms` }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{source}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface InterviewStageProps {
  discoveredTools: DiscoveredTool[];
  onComplete: (answers: InterviewAnswer[]) => void;
}

export default function InterviewStage({ discoveredTools, onComplete }: InterviewStageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [textValue, setTextValue] = useState('');
  const [chips, setChips] = useState<string[]>(() =>
    discoveredTools.filter((t) => t.confidence !== 'low').map((t) => t.name)
  );
  const [chipInput, setChipInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [genieActive, setGenieActive] = useState(false);
  const [genieAnswers, setGenieAnswers] = useState<InterviewAnswer[] | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentQuestion = QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === QUESTIONS.length - 1;

  useEffect(() => {
    setTextValue('');
    setSelectedOption(null);
    if (currentQuestion.type === 'text' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentIndex]);

  const canAdvance = () => {
    if (currentQuestion.type === 'text') return true;
    if (currentQuestion.type === 'chips') return chips.length > 0;
    if (currentQuestion.type === 'choice') return selectedOption !== null;
    return false;
  };

  const buildAnswer = (): InterviewAnswer => {
    if (currentQuestion.type === 'chips') {
      return { questionId: currentQuestion.id, verbatim: chips.join(', '), selectedChips: chips };
    }
    if (currentQuestion.type === 'choice') {
      return { questionId: currentQuestion.id, verbatim: selectedOption || '', selectedOption: selectedOption || undefined };
    }
    return { questionId: currentQuestion.id, verbatim: textValue };
  };

  const triggerGenie = (collectedAnswers: InterviewAnswer[]) => {
    const remaining = QUESTIONS.slice(currentIndex + 1);
    const autoFilled: InterviewAnswer[] = remaining.map((q) => {
      if (q.type === 'choice') {
        return { questionId: q.id, verbatim: 'A mix — both modes depending on the day', selectedOption: 'A mix — both modes depending on the day' };
      }
      return { questionId: q.id, verbatim: '' };
    });
    setGenieAnswers([...collectedAnswers, ...autoFilled]);
    setGenieActive(true);
  };

  const handleNext = () => {
    const answer = buildAnswer();
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion.id === 'wish' && isMetaAnswer(textValue)) {
      triggerGenie(newAnswers);
      return;
    }

    if (isLastQuestion) {
      onComplete(newAnswers);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    const newAnswers = [...answers, { questionId: currentQuestion.id, verbatim: '' }];
    setAnswers(newAnswers);
    if (isLastQuestion) {
      onComplete(newAnswers);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const addChip = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !chips.includes(trimmed)) {
      setChips((prev) => [...prev, trimmed]);
    }
    setChipInput('');
  };

  const removeChip = (chip: string) => {
    setChips((prev) => prev.filter((c) => c !== chip));
  };

  return (
    <>
      {genieActive && genieAnswers && (
        <GenieMoment
          wishText={answers.find((a) => a.questionId === 'wish')?.verbatim || ''}
          discoveredTools={discoveredTools}
          onDone={() => onComplete(genieAnswers)}
        />
      )}

      <div className="max-w-lg mx-auto">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i < currentIndex ? 'bg-indigo-500' : i === currentIndex ? 'bg-indigo-300' : 'bg-slate-200'
              )}
            />
          ))}
          <span className="text-xs text-slate-400 shrink-0 ml-1">
            {currentIndex + 1} / {QUESTIONS.length}
          </span>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">{currentQuestion.question}</h2>
          {currentQuestion.subtext && (
            <p className="text-sm text-slate-500">{currentQuestion.subtext}</p>
          )}
        </div>

        {/* Answer area */}
        <div className="mb-6">
          {currentQuestion.type === 'text' && (
            <Textarea
              ref={textareaRef}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="min-h-[120px] resize-none border-slate-300 focus:border-indigo-400 focus:ring-indigo-400/20 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleNext();
              }}
            />
          )}

          {currentQuestion.type === 'chips' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 min-h-[48px] p-3 rounded-lg border border-slate-300 bg-white">
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium"
                  >
                    {chip}
                    <button onClick={() => removeChip(chip)} className="hover:text-indigo-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {chips.length === 0 && (
                  <span className="text-xs text-slate-400 self-center">No tools yet — add them below</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={chipInput}
                  onChange={(e) => setChipInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addChip(chipInput);
                    }
                  }}
                  placeholder="Add a tool... (press Enter)"
                  className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-400 bg-white"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addChip(chipInput)}
                  disabled={!chipInput.trim()}
                  className="h-9"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {discoveredTools.filter((t) => t.confidence === 'low').length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">Also detected (lower confidence) — add if relevant:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {discoveredTools
                      .filter((t) => t.confidence === 'low' && !chips.includes(t.name))
                      .map((t) => (
                        <button
                          key={t.name}
                          onClick={() => setChips((prev) => [...prev, t.name])}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed border-slate-300 text-slate-500 text-xs hover:border-indigo-300 hover:text-indigo-600"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          {t.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentQuestion.type === 'choice' && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedOption(option)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
                    selectedOption === option
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-900 font-medium'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>

          <Button
            onClick={handleNext}
            disabled={!canAdvance() && currentQuestion.type !== 'text'}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
          >
            {isLastQuestion ? 'See what Artisan can do →' : 'Next'}
            {!isLastQuestion && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {currentQuestion.type === 'text' && (
          <p className="text-xs text-slate-400 text-right mt-2">⌘ + Enter to continue</p>
        )}
      </div>
    </>
  );
}
