import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Integration, InterviewAnswer, Persona, OnboardingStage } from '@/types/artisan';
import ConnectStage from '@/components/onboarding/ConnectStage';
import InterviewStage from '@/components/onboarding/InterviewStage';
import PersonalizationStage from '@/components/onboarding/PersonalizationStage';
import {
  saveContext,
  inferPersona,
  generateCapabilityCards,
  generateHeroCard,
  INTEGRATION_SCAN_RESULTS,
} from '@/lib/artisan-store';
import { HeroCard } from '@/types/artisan';

const STAGE_LABELS: Record<OnboardingStage, string> = {
  connect: 'Connect',
  interview: 'Interview',
  personalization: 'Personalize',
};

const STAGES: OnboardingStage[] = ['connect', 'interview', 'personalization'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<OnboardingStage>('connect');
  const [connectedIntegrations, setConnectedIntegrations] = useState<
    Array<Pick<Integration, 'id' | 'name' | 'toolsFound' | 'projectsFound'>>
  >([]);
  const [discoveredTools, setDiscoveredTools] = useState<ReturnType<typeof buildDiscoveredTools>>([]);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [capabilityCards, setCapabilityCards] = useState<ReturnType<typeof generateCapabilityCards>>([]);
  const [heroCard, setHeroCard] = useState<HeroCard | null>(null);
  const [savedInterviewAnswers, setSavedInterviewAnswers] = useState<InterviewAnswer[]>([]);

  function buildDiscoveredTools(integrations: typeof connectedIntegrations) {
    const seen = new Set<string>();
    return integrations.flatMap((int) =>
      (INTEGRATION_SCAN_RESULTS[int.id]?.tools || []).filter((t) => {
        if (seen.has(t.name)) return false;
        seen.add(t.name);
        return true;
      })
    );
  }

  const handleConnectComplete = (connected: typeof connectedIntegrations) => {
    const tools = buildDiscoveredTools(connected);
    setConnectedIntegrations(connected);
    setDiscoveredTools(tools);
    saveContext({ connectedIntegrations: connected, discoveredTools: tools, onboardingStage: 'interview' });
    setStage('interview');
  };

  const handleInterviewComplete = (answers: InterviewAnswer[]) => {
    const toolNames = discoveredTools
      .filter((t) => t.confidence !== 'low')
      .map((t) => t.name);

    const answersWithChips = answers.find((a) => a.questionId === 'tools');
    const allToolNames = [...new Set([...toolNames, ...(answersWithChips?.selectedChips || [])])];

    const inferred = inferPersona(answers, allToolNames);
    const ctx = { persona: inferred, discoveredTools, interviewAnswers: answers, activeProjects: [] };
    const cards = generateCapabilityCards(ctx);
    const hero = generateHeroCard(ctx);

    setPersona(inferred);
    setCapabilityCards(cards);
    setHeroCard(hero);
    setSavedInterviewAnswers(answers);
    saveContext({
      interviewAnswers: answers,
      persona: inferred,
      personaConfidence: 'inferred',
      capabilityCards: cards,
      onboardingStage: 'personalization',
    });
    setStage('personalization');
  };

  const handlePersonaCorrect = (corrected: Persona) => {
    const ctx = { persona: corrected, discoveredTools, interviewAnswers: savedInterviewAnswers, activeProjects: [] };
    const newCards = generateCapabilityCards(ctx);
    const newHero = generateHeroCard(ctx);
    setPersona(corrected);
    setCapabilityCards(newCards);
    setHeroCard(newHero);
    saveContext({ persona: corrected, personaConfidence: 'corrected', capabilityCards: newCards });
  };

  const handleOnboardingComplete = () => {
    saveContext({ onboardingComplete: true });
    navigate('/artisan');
  };

  const currentStageIndex = STAGES.indexOf(stage);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-lg">Artisan</span>
        </div>

        {/* Stage indicator */}
        <div className="flex items-center gap-1">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  i < currentStageIndex
                    ? 'bg-indigo-100 text-indigo-600'
                    : i === currentStageIndex
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400'
                )}
              >
                <span>{i + 1}</span>
                <span className="hidden sm:inline">{STAGE_LABELS[s]}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div className={cn('w-6 h-px', i < currentStageIndex ? 'bg-indigo-300' : 'bg-slate-200')} />
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {stage === 'connect' && (
            <ConnectStage onComplete={handleConnectComplete} />
          )}

          {stage === 'interview' && (
            <InterviewStage
              discoveredTools={discoveredTools}
              onComplete={handleInterviewComplete}
            />
          )}

          {stage === 'personalization' && persona && (
            <PersonalizationStage
              context={{
                persona,
                name: '',
                capabilityCards,
                discoveredTools,
                interviewAnswers: savedInterviewAnswers,
              }}
              heroCard={heroCard}
              onPersonaCorrect={handlePersonaCorrect}
              onComplete={handleOnboardingComplete}
            />
          )}
        </div>
      </main>
    </div>
  );
}
