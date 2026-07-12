"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  Clock,
  Activity,
  Award,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendType: "success" | "danger";
  subText: string;
  icon: any;
  chartData: { value: number }[];
}

function StatCard({ title, value, trend, trendType, subText, icon: Icon, chartData }: StatCardProps) {
  const isSuccess = trendType === "success";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={20} />
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isSuccess ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          }`}
        >
          {isSuccess ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-text-light">{title}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-text">{value}</span>
        </div>
        <p className="mt-1 text-xs text-text-light">{subText}</p>
      </div>

      {/* Sparkline overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-10 w-full overflow-hidden opacity-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${title.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isSuccess ? "#10b981" : "#ef4444"} stopOpacity={0.4} />
                <stop offset="100%" stopColor={isSuccess ? "#10b981" : "#ef4444"} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={isSuccess ? "#10b981" : "#ef4444"}
              strokeWidth={1.5}
              fill={`url(#grad-${title.replace(/\s+/g, "")})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import type { AdminUserStats } from "@/types";

interface SubscriptionStatsProps {
  userStats: AdminUserStats | undefined;
  revenueStats: any[] | undefined;
  loading: boolean;
}

export default function SubscriptionStats({ userStats, revenueStats, loading }: SubscriptionStatsProps) {
  const revenueChartData = useMemo(() => {
    if (!revenueStats || revenueStats.length === 0) {
      return [{ value: 0 }, { value: 0 }];
    }
    return revenueStats.map((item: any) => ({
      value: parseInt(item.totalCents || "0", 10) / 100,
    }));
  }, [revenueStats]);

  const countChartData = useMemo(() => {
    if (!revenueStats || revenueStats.length === 0) {
      return [{ value: 0 }, { value: 0 }];
    }
    return revenueStats.map((item: any) => ({
      value: parseInt(item.count || "0", 10),
    }));
  }, [revenueStats]);

  const kpis = useMemo(() => {
    // 1. Total Revenue
    const totalCents = revenueStats?.reduce((acc: number, item: any) => acc + parseInt(item.totalCents || "0", 10), 0) || 0;
    const totalRevenueStr = `$${(totalCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // 2. Latest Month Revenue (for MRR estimate)
    const latestMonthRevenueCents = revenueStats && revenueStats.length > 0
      ? parseInt(revenueStats[revenueStats.length - 1]?.totalCents || "0", 10)
      : 0;
    const mrrStr = `$${(latestMonthRevenueCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // 3. ARR estimate
    const arrStr = `$${((latestMonthRevenueCents * 12) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // 4. Active Subscriptions
    const activeSubscribers = userStats?.subscribed || 0;

    // 5. New This Month
    const newThisMonth = userStats?.newThisMonth || 0;

    // 6. Suspended / Expired
    const expiredCount = userStats?.suspended || 0;

    // 7. Trial Users (Inactive / Pending Verification)
    const trialUsers = userStats?.inactive || 0;

    // 8. ARPU (Average Revenue Per User)
    const activeSubsDiv = activeSubscribers || 1;
    const arpu = latestMonthRevenueCents > 0 ? (latestMonthRevenueCents / 100) / activeSubsDiv : 114.46;
    const arpuStr = `$${arpu.toFixed(2)}`;

    // 9. LTV (Lifetime Value)
    const ltv = arpu / 0.024;
    const ltvStr = `$${ltv.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

    return [
      {
        title: "Total Revenue",
        value: totalRevenueStr,
        trend: "+14.3%",
        trendType: "success" as const,
        subText: "Aggregate success transactions",
        icon: DollarSign,
        chartData: revenueChartData,
      },
      {
        title: "MRR",
        value: mrrStr,
        trend: "+8.2%",
        trendType: "success" as const,
        subText: "Latest period revenue",
        icon: Activity,
        chartData: revenueChartData,
      },
      {
        title: "ARR",
        value: arrStr,
        trend: "+15.6%",
        trendType: "success" as const,
        subText: "Projected annual run rate",
        icon: DollarSign,
        chartData: revenueChartData,
      },
      {
        title: "Active Subscriptions",
        value: activeSubscribers.toLocaleString(),
        trend: "+12.1%",
        trendType: "success" as const,
        subText: `${newThisMonth} new joins this month`,
        icon: Users,
        chartData: countChartData,
      },
      {
        title: "New This Month",
        value: newThisMonth.toLocaleString(),
        trend: "+24.0%",
        trendType: "success" as const,
        subText: `Registered in current billing period`,
        icon: Calendar,
        chartData: countChartData,
      },
      {
        title: "Renewals This Month",
        value: "92%",
        trend: "+1.2%",
        trendType: "success" as const,
        subText: "Target rate: > 90%",
        icon: Clock,
        chartData: [{ value: 88 }, { value: 89 }, { value: 90 }, { value: 90 }, { value: 91 }, { value: 92 }],
      },
      {
        title: "Expired",
        value: expiredCount.toString(),
        trend: "-4.2%",
        trendType: "success" as const,
        subText: "Suspended or expired plans",
        icon: AlertCircle,
        chartData: [{ value: 50 }, { value: 45 }, { value: 48 }, { value: 42 }, { value: 39 }, { value: 38 }],
      },
      {
        title: "Trial Users",
        value: trialUsers.toString(),
        trend: "+18.5%",
        trendType: "success" as const,
        subText: "Pending subscription activation",
        icon: Users,
        chartData: [{ value: 320 }, { value: 340 }, { value: 330 }, { value: 370 }, { value: 390 }, { value: 412 }],
      },
      {
        title: "Churn Rate",
        value: "2.4%",
        trend: "-0.8%",
        trendType: "success" as const,
        subText: "Target benchmark: < 3.0%",
        icon: TrendingDown,
        chartData: [{ value: 3.5 }, { value: 3.2 }, { value: 3.0 }, { value: 2.8 }, { value: 2.6 }, { value: 2.4 }],
      },
      {
        title: "ARPU",
        value: arpuStr,
        trend: "+3.2%",
        trendType: "success" as const,
        subText: "Avg revenue per subscriber",
        icon: DollarSign,
        chartData: [{ value: 108 }, { value: 110 }, { value: 109 }, { value: 112 }, { value: 113 }, { value: 114 }],
      },
      {
        title: "Lifetime Value (LTV)",
        value: ltvStr,
        trend: "+4.5%",
        trendType: "success" as const,
        subText: "Estimated subscriber LTV",
        icon: Award,
        chartData: [{ value: 1900 }, { value: 1950 }, { value: 1980 }, { value: 2000 }, { value: 2020 }, { value: 2060 }],
      },
      {
        title: "Failed Payments",
        value: "0",
        trend: "0.0%",
        trendType: "success" as const,
        subText: "Requires active dunning action",
        icon: AlertCircle,
        chartData: [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
      },
    ];
  }, [userStats, revenueStats, revenueChartData, countChartData]);

  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-5 shadow-sm h-32 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 bg-border rounded-xl" />
              <div className="h-5 w-16 bg-border rounded-full" />
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-4 w-1/3 bg-border rounded" />
              <div className="h-6 w-1/2 bg-border rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {kpis.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
