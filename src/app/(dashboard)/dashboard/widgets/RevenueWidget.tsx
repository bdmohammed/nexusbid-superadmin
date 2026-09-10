'use client';

import { ArrowUpRight, DollarSign, TrendingUp, Users } from 'lucide-react';

import { useDashboardStore } from '@/store/useDashboardStore';

export default function RevenueWidget() {
  const snapshot = useDashboardStore((state) => state.snapshot);

  /**
   * Prefer realtime data.
   * Fallback to initial query until SSE arrives.
   */
  const revenue = snapshot?.revenue;

  if (!revenue) {
    return (
      <div className="flex h-full items-center justify-center animate-pulse text-sm italic text-text-light">
        Fetching subscription financials...
      </div>
    );
  }

  const { mrr, arr, averagePlanValue, growthThisMonth } = revenue;

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-text-light">
          <DollarSign className="h-4.5 w-4.5 text-primary" />
          Financial & Subscriptions
        </h3>

        <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
          <TrendingUp className="h-3 w-3" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/50 bg-background p-4">
          <div className="text-xs font-semibold text-text-light">
            Monthly Recurring Revenue (MRR)
          </div>

          <div className="mt-1 text-2xl font-black text-text">
            ₹
            {mrr.toLocaleString('en-IN', {
              maximumFractionDigits: 0,
            })}
          </div>

          <div className="mt-1.5 flex items-center gap-0.5 text-[10px] font-bold text-emerald-500">
            <ArrowUpRight className="h-3 w-3" />
            +8.2% this month
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background p-4">
          <div className="text-xs font-semibold text-text-light">
            Annual Recurring Revenue (ARR)
          </div>

          <div className="mt-1 text-2xl font-black text-text">
            ₹
            {arr.toLocaleString('en-IN', {
              maximumFractionDigits: 0,
            })}
          </div>

          <div className="mt-1.5 text-[10px] text-text-light">Projected annualized run rate</div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background p-4">
          <div className="text-xs font-semibold text-text-light">Average Plan Value</div>

          <div className="mt-1 text-xl font-bold text-text">
            ₹
            {averagePlanValue.toLocaleString('en-IN', {
              maximumFractionDigits: 2,
            })}
          </div>

          <div className="mt-1.5 text-[10px] text-text-light">Per subscription average</div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background p-4">
          <div className="mt-1 flex items-center gap-1.5 text-xl font-bold text-text">
            <Users className="h-4.5 w-4.5 text-primary" />
            {growthThisMonth}
          </div>

          <div className="mt-1.5 text-[10px] text-text-light">Registered since 1st of month</div>
        </div>
      </div>
    </div>
  );
}
