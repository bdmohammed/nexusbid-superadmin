import { Inbox } from 'lucide-react';

import type { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export default function EmptyState({
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  icon,
  actions,
}: EmptyStateProps) {
  return (
    <div className="w-full p-8 md:p-10 my-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-2xl relative overflow-hidden text-center flex flex-col items-center justify-center">
      <div className="relative z-10 p-4 bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] rounded-xl mb-4">
        {icon || <Inbox className="w-8 h-8" />}
      </div>

      <h3 className="relative z-10 text-xl font-bold text-[var(--foreground)]">{title}</h3>
      <p className="relative z-10 mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
        {description}
      </p>

      {actions && (
        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
