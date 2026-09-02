'use client';

import { ArrowUpRight, DollarSign, TrendingUp, Users } from 'lucide-react';

import { useDashboardRevenue } from '@/features/dashboard/api/queries';

export default function RevenueWidget() {
  const { data, isLoading } = useDashboardRevenue();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-light italic animate-pulse">
        Fetching subscription financials...
      </div>
    );
  }

  const mrr = data?.mrr ?? 0;
  const arr = data?.arr ?? 0;
  const avg = data?.averagePlanValue ?? 0;
  const growth = data?.growthThisMonth ?? 0;

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-light flex items-center gap-1.5">
          <DollarSign className="h-4.5 w-4.5 text-primary" />
          Financial & Subscriptions
        </h3>
        <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background rounded-2xl p-4 border border-border/50">
          <div className="text-xs font-semibold text-text-light">
            Monthly Recurring Revenue (MRR)
          </div>
          <div className="text-2xl font-black mt-1 text-text">
            ₹{mrr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3" /> +8.2% this month
          </div>
        </div>

        <div className="bg-background rounded-2xl p-4 border border-border/50">
          <div className="text-xs font-semibold text-text-light">
            Annual Recurring Revenue (ARR)
          </div>
          <div className="text-2xl font-black mt-1 text-text">
            ₹{arr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-text-light mt-1.5">Projected annualized run rate</div>
        </div>

        <div className="bg-background rounded-2xl p-4 border border-border/50">
          <div className="text-xs font-semibold text-text-light">Average Plan Value</div>
          <div className="text-xl font-bold mt-1 text-text">
            ₹{avg.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-text-light mt-1.5">Per subscription average</div>
        </div>

        <div className="bg-background rounded-2xl p-4 border border-border/50">
          <div className="text-xs font-semibold text-text-light">New Subscriptions</div>
          <div className="text-xl font-bold mt-1 text-text flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-primary" />
            {growth}
          </div>
          <div className="text-[10px] text-text-light mt-1.5">Registered since 1st of month</div>
        </div>
      </div>
    </div>
  );
}
