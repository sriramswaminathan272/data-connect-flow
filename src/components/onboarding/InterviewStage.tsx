import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ChevronRight, SkipForward } from 'lucide-react';
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
    id: 'painPoint',
    question: 'What's the biggest bottleneck in your current workflow?',
    subtext: 'The thing that eats time you'd rather spend elsewhere.',
    type: 'text',
    placeholder: 'e.g. I spend too much time in status meetings that could be async updates. Or: Getting context from 4 different tools before I can answer a simple question...',
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
    if (currentQuestion.type === 'text') return true; // skip allowed
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

  const handleNext = () => {
    const answer = buildAnswer();
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

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
  );
}
