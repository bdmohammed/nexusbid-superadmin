'use client';

import React from 'react';

import type { WidgetDefinition } from '@/features/dashboard/types';

interface WidgetCardProps {
  item: WidgetDefinition;
  index: number;
  totalItems: number;
  isEditMode: boolean;
  onMoveWidget: (index: number, direction: 'up' | 'down') => void;
  onChangeWidgetWidth: (index: number, width: number) => void;
  onToggleWidgetHide: (index: number) => void;
  onToggleWidgetCollapse: (index: number) => void;
  children: React.ReactNode;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  item,
  index,
  totalItems,
  isEditMode,
  onMoveWidget,
  onChangeWidgetWidth,
  onToggleWidgetHide,
  onToggleWidgetCollapse,
  children,
}) => {
  if (item.defaultLayout.hidden && !isEditMode) return null;

  // Determine Tailwind grid-column width classes based on customization parameters
  const gridColSpan =
    item.defaultLayout.w === 1
      ? 'md:col-span-2'
      : item.defaultLayout.w === 2
        ? 'md:col-span-3'
        : 'md:col-span-6';

  return (
    <div
      className={`rounded-2xl border bg-surface shadow-xs overflow-hidden flex flex-col justify-between transition-all duration-300 ${gridColSpan} ${
        item.defaultLayout.hidden ? 'opacity-45 border-dashed border-red-500/50' : 'border-border'
      }`}
    >
      {/* Header with edit tools overlay */}
      {isEditMode && (
        <div className="p-2 border-b border-border bg-background flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-text-light">{item.title}</span>
          <div className="flex items-center gap-1.5">
            {/* Position shift */}
            <button
              onClick={() => onMoveWidget(index, 'up')}
              disabled={index === 0}
              className="p-1 rounded text-text-light hover:bg-border disabled:opacity-30 text-[10px] cursor-pointer"
            >
              ◀
            </button>
            <button
              onClick={() => onMoveWidget(index, 'down')}
              disabled={index === totalItems - 1}
              className="p-1 rounded text-text-light hover:bg-border disabled:opacity-30 text-[10px] cursor-pointer"
            >
              ▶
            </button>

            {/* Width adjustment */}
            <select
              value={item.defaultLayout.w}
              onChange={(e) => onChangeWidgetWidth(index, parseInt(e.target.value, 10))}
              className="text-[10px] bg-surface border border-border rounded px-1 py-0.5 outline-none cursor-pointer"
            >
              <option value={1}>1/3 Width</option>
              <option value={2}>1/2 Width</option>
              <option value={3}>Full Width</option>
            </select>

            {/* Hide toggle */}
            <button
              onClick={() => onToggleWidgetHide(index)}
              className={`text-[10px] px-1.5 py-0.5 rounded border cursor-pointer ${
                item.defaultLayout.hidden
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'bg-border text-text'
              }`}
            >
              {item.defaultLayout.hidden ? 'Show' : 'Hide'}
            </button>

            {/* Collapse toggle */}
            <button
              onClick={() => onToggleWidgetCollapse(index)}
              className="text-[10px] px-1.5 py-0.5 rounded bg-border text-text cursor-pointer"
            >
              {item.defaultLayout.collapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>
        </div>
      )}

      {/* Widget Body */}
      {!item.defaultLayout.collapsed && <div className="flex-1">{children}</div>}
    </div>
  );
};
