"use client";

import subscriptionPlans from "@/data/subscriptionPlans";
import PlanCard from "./PlanCard";

export default function PricingPlans() {
  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center gap-4">
        <h2 className="shrink-0 text-2xl font-bold text-text">
          Subscription Plans
        </h2>

        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {subscriptionPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
          />
        ))}
      </div>
    </section>
  );
}