"use client";

import React from "react";
import { Undo, Check } from "lucide-react";

interface CustomizerBarProps {
  onResetLayout: () => void;
  onSaveLayout: () => void;
  saving: boolean;
}

export const CustomizerBar: React.FC<CustomizerBarProps> = ({
  onResetLayout,
  onSaveLayout,
  saving,
}) => {
  return (
    <div className="p-4 rounded-2xl border border-dashed border-primary/45 bg-primary/5 flex items-center justify-between gap-4 animate-fade-in">
      <div className="text-xs font-semibold text-text-light">
        Customizer mode active: drag/order widgets, adjust width sizes, or hide columns.
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onResetLayout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-border bg-surface text-text hover:bg-border/40 transition cursor-pointer"
        >
          <Undo className="h-3.5 w-3.5" />
          Reset Defaults
        </button>
        <button
          onClick={onSaveLayout}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-dark shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save Layout"}
        </button>
      </div>
    </div>
  );
};
