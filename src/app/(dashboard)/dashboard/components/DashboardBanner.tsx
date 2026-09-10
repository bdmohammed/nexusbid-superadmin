'use client';

import { Settings2, Sparkles } from 'lucide-react';

import { useDashboardStore } from '@/store/useDashboardStore';

interface DashboardBannerProps {
  greetingText: string;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  canCustomize?: boolean;
}

const connections = {
  connected: {
    label: 'Live Feed Connected',
    className: 'bg-emerald-500/10 text-emerald-600',
    dot: 'bg-emerald-500',
    animate: 'animate-ping',
  },

  connecting: {
    label: 'Connecting...',
    className: 'bg-blue-500/10 text-blue-600',
    dot: 'bg-blue-500',
    animate: 'animate-pulse',
  },

  reconnecting: {
    label: 'Reconnecting...',
    className: 'bg-amber-500/10 text-amber-600',
    dot: 'bg-amber-500',
    animate: 'animate-pulse',
  },

  disconnected: {
    label: 'Disconnected',
    className: 'bg-red-500/10 text-red-600',
    dot: 'bg-red-500',
    animate: '',
  },
};
export function DashboardBanner({
  greetingText,
  isEditMode,
  onToggleEditMode,
  canCustomize = true,
}: DashboardBannerProps) {
  const connectionStatus = useDashboardStore((state) => state.connectionStatus);
  const connection = connections[connectionStatus];
  return (
    <div className="flex flex-col justify-between gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-6 md:flex-row md:items-center">
      <div className="space-y-1.5">
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-text">
          <Sparkles className="h-6 w-6 animate-pulse text-primary" />
          {greetingText}!
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${connection.className}`}
        >
          <span className={`h-2 w-2 rounded-full ${connection.dot} ${connection.animate}`} />

          {connection.label}
        </span>

        {canCustomize && (
          <button
            onClick={onToggleEditMode}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              isEditMode
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-text hover:bg-border/30'
            }`}
          >
            <Settings2 className="h-4 w-4" />

            {isEditMode ? 'Exit Customizer' : 'Customize Grid'}
          </button>
        )}
      </div>
    </div>
  );
}
