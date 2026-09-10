'use client';

import { Check, Undo } from 'lucide-react';

interface CustomizerBarProps {
  onResetLayout: () => void;
  onSaveLayout: () => void;
  saving: boolean;
  hasUnsavedChanges: boolean;
}

export function CustomizerBar({
  onResetLayout,
  onSaveLayout,
  saving,
  hasUnsavedChanges,
}: CustomizerBarProps) {
  const disabled = saving || !hasUnsavedChanges;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-primary/45 bg-primary/5 p-4 animate-fade-in">
      <div className="text-xs font-semibold text-text-light">
        Customizer mode active: reorder widgets, resize them, or hide widgets.
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onResetLayout}
          disabled={disabled}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text transition hover:bg-border/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Undo className="h-3.5 w-3.5" />
          Reset Defaults
        </button>

        <button
          type="button"
          onClick={onSaveLayout}
          disabled={disabled}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {saving ? 'Saving...' : 'Save Layout'}
        </button>
      </div>
    </div>
  );
}
