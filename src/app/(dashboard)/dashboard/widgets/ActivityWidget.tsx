'use client';

import { Clock, History } from 'lucide-react';

import { useDashboardRecentActivity } from '@/features/dashboard/api/queries';

/**
 *
 * @deprecated
 */
export default function ActivityWidget() {
  const { data: activities = [], isLoading } = useDashboardRecentActivity();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-light italic animate-pulse">
        Assembling activity stream...
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-light flex items-center gap-1.5">
          <History className="h-4.5 w-4.5 text-primary" />
          Recent Activity Timeline
        </h3>
      </div>

      <div className="relative pl-4 border-l border-border/70 space-y-4 mt-2">
        {activities.map((act) => (
          <div key={act.id} className="relative text-xs">
            {/* Timeline node */}
            <span className="absolute -left-[20.5px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-surface"></span>

            <div className="flex items-center gap-1.5 text-text-light text-[10px] mb-0.5">
              <Clock className="h-3 w-3" />
              <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-text font-medium leading-relaxed">{act.description}</p>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-text-light italic text-center py-4">
            No recent activity logs found.
          </div>
        )}
      </div>
    </div>
  );
}
