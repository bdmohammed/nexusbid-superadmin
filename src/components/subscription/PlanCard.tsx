"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import { cn } from "@/lib/tailwind/utils";
import type { SubscriptionPlan } from "@/types";
import PlanActionMenu from "./PlanActionMenu";

export interface PlanCardProps {
  plan: SubscriptionPlan;
}

export default function PlanCard({ plan }: PlanCardProps) {
  const [deletePlan, setDeletePlan] = useState<SubscriptionPlan | null>(null);

  function handleDelete() {
    console.log("Delete Plan :", deletePlan);
    setDeletePlan(null);
  }

  return (
    <>
      <div
        className={cn(
          "relative rounded-2xl border bg-surface p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
          plan.featured
            ? "border-primary ring-2 ring-primary/10"
            : "border-border",
        )}
      >
        {/* Action Menu */}
        <PlanActionMenu
          plan={plan}
          onEdit={(p) => console.log("Edit", p)}
          onDuplicate={(p) => console.log("Duplicate", p)}
          onFeature={(p) => console.log("Feature", p)}
          onDisable={(p) => console.log("Disable", p)}
          onDelete={setDeletePlan}
        />

        {/* Most Popular */}
        {plan.featured && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">
              {plan.badge}
            </span>
          </div>
        )}

        {/* Plan Name */}
        <div className="mt-2">
          <h3 className="text-2xl font-bold text-text">{plan.name}</h3>

          <p className="mt-2 text-sm text-text-light">{plan.subtitle}</p>
        </div>

        {/* Price */}
        <div className="mt-8 flex items-end gap-1">
          <span className="text-5xl font-bold text-text">{plan.price}</span>

          {plan.duration && (
            <span className="pb-2 text-base text-text-light">
              {plan.duration}
            </span>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 space-y-4">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <CheckCircle2 size={20} className="shrink-0 text-primary" />
              <span className="text-sm text-text">{feature}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-text-light">
                Included Features
              </p>
              <h4 className="mt-1 text-lg font-semibold">
                {plan.features.length}
              </h4>
            </div>

            <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Active
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!deletePlan}
        onClose={() => setDeletePlan(null)}
        onConfirm={handleDelete}
        title="Delete Subscription Plan"
        message={`Are you sure you want to delete "${deletePlan?.name}"? This action cannot be undone.`}
        confirmText="Delete Plan"
      />
    </>
  );
}
