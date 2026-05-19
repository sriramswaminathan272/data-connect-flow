import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  BarChart2,
  Megaphone,
  Palette,
  TrendingUp,
  ChevronRight,
  Edit3,
  Zap,
  Search,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { CapabilityCard, Persona, UserContext } from '@/types/artisan';
import { PERSONA_LABELS } from '@/lib/artisan-store';
import { cn } from '@/lib/utils';

const PERSONA_ICONS: Record<Persona, React.FC<{ className?: string }>> = {
  pm: ({ className }) => <Activity className={className} />,
  analyst: ({ className }) => <BarChart2 className={className} />,
  marketing: ({ className }) => <Megaphone className={className} />,
  designer: ({ className }) => <Palette className={className} />,
  sales: ({ className }) => <TrendingUp className={className} />,
};

const CTA_ICONS = {
  connect: <Zap className="w-3.5 h-3.5" />,
  try: <Play className="w-3.5 h-3.5" />,
  start: <ChevronRight className="w-3.5 h-3.5" />,
  check: <CheckCircle2 className="w-3.5 h-3.5" />,
};

const PERSONA_OPTIONS: Array<{ value: Persona; label: string }> = [
  { value: 'pm', label: 'Product Manager' },
  { value: 'analyst', label: 'Data Analyst' },
  { value: 'marketing', label: 'Marketing Manager' },
  { value: 'designer', label: 'Designer' },
  { value: 'sales', label: 'Sales / Business' },
];

interface PersonalizationStageProps {
  context: Pick<UserContext, 'persona' | 'name' | 'capabilityCards' | 'discoveredTools' | 'interviewAnswers'>;
  onPersonaCorrect: (persona: Persona) => void;
  onComplete: () => void;
}

export default function PersonalizationStage({ context, onPersonaCorrect, onComplete }: PersonalizationStageProps) {
  const [showPersonaCorrector, setShowPersonaCorrector] = useState(false);
  const { persona, capabilityCards } = context;

  if (!persona) return null;

  const PersonaIcon = PERSONA_ICONS[persona];
  const personaLabel = PERSONA_LABELS[persona];

  const toolCount = context.discoveredTools.filter((t) => t.confidence !== 'low').length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">
          Here's what Artisan can do for you.
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Based on what you told us and {toolCount > 0 ? `${toolCount} tools we found across your sources` : 'what we found across your sources'}.
        </p>

        {/* Inferred persona */}
        <div className="inline-flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200">
            <PersonaIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">{personaLabel}</span>
            <Badge className="text-xs bg-amber-100 text-amber-700 border-0 px-1.5 ml-0.5">Inferred</Badge>
          </div>
          <button
            onClick={() => setShowPersonaCorrector(!showPersonaCorrector)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
          >
            <Edit3 className="w-3 h-3" />
            {showPersonaCorrector ? 'Cancel' : 'Not right?'}
          </button>
        </div>

        {showPersonaCorrector && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {PERSONA_OPTIONS.filter((o) => o.value !== persona).map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onPersonaCorrect(option.value);
                  setShowPersonaCorrector(false);
                }}
                className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:border-indigo-400 hover:text-indigo-700 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Capability cards */}
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {capabilityCards.map((card) => (
          <CapabilityCardComponent key={card.id} card={card} />
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-slate-400 max-w-sm">
          Every card above references something from your tools or your answers — nothing is generic. Cards update as you use Artisan.
        </p>
        <Button
          onClick={onComplete}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shrink-0"
          size="lg"
        >
          Start using Artisan
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function CapabilityCardComponent({ card }: { card: CapabilityCard }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all group">
      {/* Tool tags */}
      {card.toolsReferenced.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.toolsReferenced.slice(0, 2).map((tool) => (
            <span key={tool} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500">
              {tool}
            </span>
          ))}
          {card.projectReferenced && (
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">
              {card.projectReferenced.slice(0, 20)}{card.projectReferenced.length > 20 ? '…' : ''}
            </span>
          )}
        </div>
      )}

      <h3 className="font-semibold text-slate-900 text-sm mb-2 leading-snug">{card.title}</h3>

      <p className={cn('text-xs text-slate-500 leading-relaxed mb-4', !expanded && 'line-clamp-3')}>
        {card.description}
      </p>

      {card.description.length > 150 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-400 hover:text-slate-600 mb-3 -mt-2"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      <button className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 group-hover:gap-2 transition-all">
        {CTA_ICONS[card.ctaType]}
        {card.ctaLabel}
      </button>
    </div>
  );
}
