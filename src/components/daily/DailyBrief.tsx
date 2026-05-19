import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  ChevronDown,
  ChevronRight,
  Info,
  Activity,
  BarChart2,
  Megaphone,
  Palette,
  TrendingUp,
  ExternalLink,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Task, TaskState, ConfidenceLevel, CapabilityCard, DailyDelta, Persona } from '@/types/artisan';
import { cn } from '@/lib/utils';

const TASK_STATE_CONFIG: Record<TaskState, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  detected: {
    label: 'Detected',
    color: 'bg-yellow-100 text-yellow-800',
    icon: ({ className }) => <AlertCircle className={className} />,
  },
  active: {
    label: 'Active',
    color: 'bg-blue-100 text-blue-800',
    icon: ({ className }) => <Activity className={className} />,
  },
  awaiting: {
    label: 'Awaiting review',
    color: 'bg-purple-100 text-purple-800',
    icon: ({ className }) => <Clock className={className} />,
  },
  closed: {
    label: 'Closed',
    color: 'bg-slate-100 text-slate-500',
    icon: ({ className }) => <CheckCircle2 className={className} />,
  },
};

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { label: string; color: string; dot: string }> = {
  verified: { label: 'Verified', color: 'text-emerald-600', dot: 'bg-emerald-500' },
  inferred: { label: 'Inferred', color: 'text-amber-600', dot: 'bg-amber-500' },
  suggested: { label: 'Suggested', color: 'text-blue-600', dot: 'bg-blue-400' },
};

const PERSONA_ICONS: Record<Persona, React.FC<{ className?: string }>> = {
  pm: ({ className }) => <Activity className={className} />,
  analyst: ({ className }) => <BarChart2 className={className} />,
  marketing: ({ className }) => <Megaphone className={className} />,
  designer: ({ className }) => <Palette className={className} />,
  sales: ({ className }) => <TrendingUp className={className} />,
};

const DELTA_ICONS = {
  mention: <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />,
  update: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />,
  deadline: <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />,
  new: <Zap className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />,
};

function formatDate() {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface DailyBriefProps {
  name: string;
  persona: Persona;
  tasks: Task[];
  capabilityCards: CapabilityCard[];
  deltas: DailyDelta[];
  onTaskAction: (taskId: string, action: string) => void;
  onTaskConfirm: (taskId: string) => void;
  onTaskDismiss: (taskId: string) => void;
}

export default function DailyBrief({
  name,
  persona,
  tasks,
  capabilityCards,
  deltas,
  onTaskAction,
  onTaskConfirm,
  onTaskDismiss,
}: DailyBriefProps) {
  const [deltaExpanded, setDeltaExpanded] = useState(true);
  const [reviewingCard, setReviewingCard] = useState<string | null>(null);
  const displayName = name || 'there';

  const activeTasks = tasks.filter((t) => t.state !== 'closed');
  const awaitingTasks = tasks.filter((t) => t.state === 'awaiting');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Morning header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {getGreeting()}{name ? `, ${name}` : ''}.
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{formatDate()}</p>
        </div>
        {awaitingTasks.length > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-medium text-purple-700">
            <Clock className="w-3.5 h-3.5" />
            {awaitingTasks.length} item{awaitingTasks.length > 1 ? 's' : ''} awaiting your review
          </div>
        )}
      </div>

      {/* Since yesterday */}
      {deltas.length > 0 && (
        <Collapsible open={deltaExpanded} onOpenChange={setDeltaExpanded}>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-slate-700">Since yesterday</span>
                <span className="text-xs text-slate-400">{deltas.length} update{deltas.length > 1 ? 's' : ''}</span>
              </div>
              {deltaExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
                {deltas.map((delta, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {DELTA_ICONS[delta.type]}
                    <div className="min-w-0">
                      <span className="text-sm text-slate-700">{delta.text}</span>
                      <span className="text-xs text-slate-400 ml-2">· {delta.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 text-sm">Today's priorities</h2>
            <span className="text-xs text-slate-400">{activeTasks.length} active</span>
          </div>

          {activeTasks.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-300">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No active tasks — you're clear.</p>
            </div>
          ) : (
            activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onAction={onTaskAction}
                onConfirm={onTaskConfirm}
                onDismiss={onTaskDismiss}
                isReviewing={reviewingCard === task.id}
                onReviewToggle={() => setReviewingCard(reviewingCard === task.id ? null : task.id)}
              />
            ))
          )}
        </div>

        {/* Capability cards */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-slate-900 text-sm">What Artisan can do</h2>
          </div>
          {capabilityCards.slice(0, 3).map((card) => (
            <MiniCapabilityCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onAction,
  onConfirm,
  onDismiss,
  isReviewing,
  onReviewToggle,
}: {
  task: Task;
  onAction: (id: string, action: string) => void;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
  isReviewing: boolean;
  onReviewToggle: () => void;
}) {
  const stateConfig = TASK_STATE_CONFIG[task.state];
  const confidenceConfig = CONFIDENCE_CONFIG[task.trustMarker.confidence];
  const StateIcon = stateConfig.icon;

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-4 transition-all',
        task.state === 'awaiting' ? 'border-purple-200 bg-purple-50/30' : 'border-slate-200',
        task.state === 'detected' && 'border-yellow-200 bg-yellow-50/30'
      )}
    >
      {/* State + project */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', stateConfig.color)}>
            <StateIcon className="w-3 h-3" />
            {stateConfig.label}
          </span>
          {task.project && (
            <span className="text-xs text-slate-500">{task.project}</span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-medium text-slate-900 text-sm mb-2 leading-snug">{task.title}</h3>

      {/* AI output preview for awaiting tasks */}
      {task.state === 'awaiting' && task.aiOutput && (
        <div className="mb-3 p-2.5 rounded-lg bg-white border border-purple-200 text-xs text-slate-600 italic">
          {task.aiOutput}
        </div>
      )}

      {/* Trust marker — Level 1 (always shown) */}
      <div className="flex items-start gap-1.5 mb-3">
        <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', confidenceConfig.dot)} />
        <div className="min-w-0">
          <span className="text-xs text-slate-500">
            Source: <span className="font-medium text-slate-600">{task.trustMarker.source}</span>
            {task.trustMarker.timestamp && (
              <span className="text-slate-400"> · {task.trustMarker.timestamp}</span>
            )}
          </span>
          {/* Level 2 — shown when not verified */}
          {task.trustMarker.confidence !== 'verified' && (
            <div className={cn('text-xs mt-0.5', confidenceConfig.color)}>
              <Info className="w-3 h-3 inline mr-0.5" />
              {confidenceConfig.label}: {task.trustMarker.detail}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {task.state === 'detected' ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3"
            onClick={() => onConfirm(task.id)}
          >
            Confirm task
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-slate-500 hover:text-slate-700"
            onClick={() => onDismiss(task.id)}
          >
            Dismiss
          </Button>
        </div>
      ) : task.state === 'awaiting' ? (
        <div className="space-y-2">
          {/* Level 3 review gate */}
          <div className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg p-2.5">
            <Sparkles className="w-3 h-3 inline mr-1 text-indigo-500" />
            Artisan produced output — review before using it.
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3"
              onClick={() => onAction(task.id, task.cta?.action || 'review')}
            >
              {task.cta?.label || 'Review'}
            </Button>
            <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600">
              <ThumbsUp className="w-3 h-3" /> Looks good
            </button>
            <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500">
              <ThumbsDown className="w-3 h-3" /> Needs work
            </button>
          </div>
        </div>
      ) : (
        task.cta && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-700"
            onClick={() => onAction(task.id, task.cta!.action)}
          >
            {task.cta.label}
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        )
      )}
    </div>
  );
}

function MiniCapabilityCard({ card }: { card: CapabilityCard }) {
  return (
    <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer group">
      {card.toolsReferenced.length > 0 && (
        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 mb-2 inline-block">
          {card.toolsReferenced[0]}
        </span>
      )}
      <h4 className="text-sm font-medium text-slate-900 leading-snug mb-1">{card.title}</h4>
      <p className="text-xs text-slate-500 line-clamp-2 mb-2">{card.description}</p>
      <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium group-hover:gap-1.5 transition-all">
        <Zap className="w-3 h-3" />
        {card.ctaLabel}
      </div>
    </div>
  );
}
