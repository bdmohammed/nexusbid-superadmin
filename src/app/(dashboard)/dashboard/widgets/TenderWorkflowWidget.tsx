'use client';

import { AlertTriangle, Archive, CheckCircle2, FileText, FolderKanban, Send } from 'lucide-react';

import { useDashboardStore } from '@/store/useDashboardStore';

export default function TenderWorkflowWidget() {
  const tender = useDashboardStore((state) => state.snapshot?.tender);

  if (!tender) {
    return (
      <div className="flex h-full items-center justify-center animate-pulse text-sm italic text-text-light">
        Compiling procurement stats...
      </div>
    );
  }

  const stages = [
    {
      label: 'Draft',
      value: tender.DRAFT,
      icon: FileText,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Under Review',
      value: tender.UNDER_REVIEW,
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Published',
      value: tender.PUBLISHED,
      icon: Send,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Closing Today',
      value: tender.CLOSING_TODAY,
      icon: AlertTriangle,
      color: 'text-red-500 animate-pulse',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Awarded',
      value: tender.AWARDED,
      icon: CheckCircle2,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Archived',
      value: tender.ARCHIVED,
      icon: Archive,
      color: 'text-text-light',
      bg: 'bg-border/30',
    },
  ];

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-text-light">
          <FolderKanban className="h-4.5 w-4.5 text-primary" />
          Tender Workflow Lifecycle
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stages.map((stage) => {
          const Icon = stage.icon;

          return (
            <div
              key={stage.label}
              className="flex flex-col justify-between rounded-xl border border-border/50 bg-background p-3 transition hover:shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-text-light">{stage.label}</span>

                <span className={`rounded-md p-1 ${stage.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${stage.color}`} />
                </span>
              </div>

              <div className="mt-2 text-xl font-black text-text">{stage.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
