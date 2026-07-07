"use client";

import { Copy, EyeOff, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SubscriptionPlan } from "@/types";

export interface PlanActionMenuProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onDuplicate: (plan: SubscriptionPlan) => void;
  onFeature: (plan: SubscriptionPlan) => void;
  onDisable: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
}

export default function PlanActionMenu({
  plan,
  onEdit,
  onDuplicate,
  onFeature,
  onDisable,
  onDelete,
}: PlanActionMenuProps) {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div ref={ref} className="absolute right-5 top-5">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 transition hover:bg-background"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          <button
            onClick={() => {
              onEdit(plan);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-background"
          >
            <Pencil size={16} />
            Edit Plan
          </button>

          <button
            onClick={() => {
              onDuplicate(plan);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-background"
          >
            <Copy size={16} />
            Duplicate Plan
          </button>

          <button
            onClick={() => {
              onFeature(plan);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-background"
          >
            <Star size={16} />
            Make Featured
          </button>

          <button
            onClick={() => {
              onDisable(plan);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-background"
          >
            <EyeOff size={16} />
            Disable Plan
          </button>

          <div className="border-t border-border" />

          <button
            onClick={() => {
              onDelete(plan);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
            Delete Plan
          </button>
        </div>
      )}
    </div>
  );
}
