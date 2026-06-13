import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Mail, FolderOpen, Sheet, MessageSquare } from 'lucide-react';
import { Integration } from '@/types/artisan';
import { INTEGRATION_SCAN_RESULTS } from '@/lib/artisan-store';
import { cn } from '@/lib/utils';

const INTEGRATION_META: Array<{
  id: Integration['id'];
  name: string;
  valueProp: string;
  Icon: React.FC<{ className?: string }>;
  color: string;
}> = [
  {
    id: 'gmail',
    name: 'Gmail',
    valueProp: 'Understand your priorities and tool stack',
    Icon: ({ className }) => <Mail className={className} />,
    color: 'text-red-500',
  },
  {
    id: 'drive',
    name: 'Google Drive',
    valueProp: 'Know which projects are active',
    Icon: ({ className }) => <FolderOpen className={className} />,
    color: 'text-yellow-500',
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    valueProp: 'Read the trackers your team lives in',
    Icon: ({ className }) => <Sheet className={className} />,
    color: 'text-emerald-500',
  },
  {
    id: 'slack',
    name: 'Slack',
    valueProp: 'Catch what matters in real time',
    Icon: ({ className }) => <MessageSquare className={className} />,
    color: 'text-purple-500',
  },
];

interface ConnectedState {
  toolsFound: number;
  projectsFound: number;
}

interface ConnectStageProps {
  onComplete: (connected: Array<Pick<Integration, 'id' | 'name' | 'toolsFound' | 'projectsFound'>>) => void;
}

export default function ConnectStage({ onComplete }: ConnectStageProps) {
  const [scanning, setScanning] = useState<Integration['id'] | null>(null);
  const [connected, setConnected] = useState<Map<Integration['id'], ConnectedState>>(new Map());
  const [scanProgress, setScanProgress] = useState<string>('');

  const handleConnect = useCallback(async (id: Integration['id'], name: string) => {
    if (connected.has(id) || scanning) return;
    setScanning(id);
    setScanProgress(`Connecting to ${name}...`);

    await new Promise((r) => setTimeout(r, 900));
    setScanProgress(`Reading your last 90 days of ${name}...`);

    await new Promise((r) => setTimeout(r, 1100));
    const result = INTEGRATION_SCAN_RESULTS[id];
    setScanProgress(`Found ${result.toolsFound} tools and ${result.projectsFound} active projects`);

    await new Promise((r) => setTimeout(r, 600));
    setConnected((prev) => new Map(prev).set(id, { toolsFound: result.toolsFound, projectsFound: result.projectsFound }));
    setScanning(null);
    setScanProgress('');
  }, [connected, scanning]);

  const handleContinue = () => {
    const connectedList = INTEGRATION_META
      .filter((m) => connected.has(m.id))
      .map((m) => ({
        id: m.id,
        name: m.name,
        toolsFound: connected.get(m.id)!.toolsFound,
        projectsFound: connected.get(m.id)!.projectsFound,
      }));
    onComplete(connectedList);
  };

  const anyConnected = connected.size > 0;

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">
          Artisan learns from where you already work.
        </h2>
        <p className="text-slate-500 text-sm">
          Connect at least one source to get started. You can add more any time.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {INTEGRATION_META.map(({ id, name, valueProp, Icon, color }) => {
          const isConnected = connected.has(id);
          const isScanning = scanning === id;
          const result = connected.get(id);

          return (
            <div
              key={id}
              className={cn(
                'flex items-center justify-between p-4 rounded-xl border bg-white transition-all',
                isConnected ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn('shrink-0', color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 text-sm">{name}</div>
                  <div className="text-xs text-slate-500 truncate">{valueProp}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                {isConnected && result && (
                  <div className="hidden sm:flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-0">
                      {result.toolsFound} tools
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 border-0">
                      {result.projectsFound} projects
                    </Badge>
                  </div>
                )}
                {isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isScanning ? (
                  <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 border-slate-300"
                    onClick={() => handleConnect(id, name)}
                    disabled={scanning !== null}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(scanning || scanProgress) && (
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 px-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>{scanProgress}</span>
        </div>
      )}

      {anyConnected && (
        <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <p className="text-xs text-indigo-700">
            <span className="font-medium">Privacy note: </span>
            Artisan scans for tool names and project counts only. No email content, message text, or file contents are stored or shown to you here.
          </p>
        </div>
      )}

      <Button
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        disabled={!anyConnected || scanning !== null}
        onClick={handleContinue}
      >
        {anyConnected ? `Continue with ${connected.size} source${connected.size > 1 ? 's' : ''} connected` : 'Connect at least one source to continue'}
      </Button>
    </div>
  );
}
