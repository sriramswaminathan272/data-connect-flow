import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Settings } from 'lucide-react';
import DailyBrief from '@/components/daily/DailyBrief';
import { getContext, saveContext, generateDemoTasks, PERSONA_LABELS } from '@/lib/artisan-store';
import { Task, Persona } from '@/types/artisan';
import { useToast } from '@/hooks/use-toast';

export default function ArtisanDaily() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const ctx = getContext();

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (ctx.tasks && ctx.tasks.length > 0) return ctx.tasks;
    if (ctx.persona) {
      return generateDemoTasks(ctx.persona, ctx.name).tasks;
    }
    return [];
  });

  const [deltas] = useState(() => {
    if (ctx.dailyDeltas && ctx.dailyDeltas.length > 0) return ctx.dailyDeltas;
    if (ctx.persona) {
      return generateDemoTasks(ctx.persona, ctx.name).deltas;
    }
    return [];
  });

  useEffect(() => {
    if (!ctx.onboardingComplete) {
      navigate('/onboarding');
    }
  }, []);

  const handleTaskAction = (taskId: string, action: string) => {
    toast({
      title: 'Action triggered',
      description: `Running: ${action}`,
    });
  };

  const handleTaskConfirm = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, state: 'active' as const } : t))
    );
    toast({
      title: 'Task confirmed',
      description: 'Added to your active priorities.',
    });
  };

  const handleTaskDismiss = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, state: 'closed' as const } : t))
    );
    toast({
      description: 'Task dismissed.',
    });
  };

  const handleReset = () => {
    navigate('/onboarding');
  };

  if (!ctx.onboardingComplete || !ctx.persona) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-slate-900">Artisan</span>
          {ctx.persona && (
            <span className="hidden sm:inline text-xs text-slate-400 ml-1">
              · {PERSONA_LABELS[ctx.persona]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-slate-500 gap-1.5"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-slate-500 gap-1.5"
            onClick={handleReset}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset onboarding</span>
          </Button>
        </div>
      </div>

      {/* Daily brief */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <DailyBrief
          name={ctx.name}
          persona={ctx.persona as Persona}
          tasks={tasks}
          capabilityCards={ctx.capabilityCards}
          deltas={deltas}
          onTaskAction={handleTaskAction}
          onTaskConfirm={handleTaskConfirm}
          onTaskDismiss={handleTaskDismiss}
        />
      </div>
    </div>
  );
}
