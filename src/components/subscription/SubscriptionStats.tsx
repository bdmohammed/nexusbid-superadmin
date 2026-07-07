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

export default function SubscriptionStats() {
  // Generate random stats and trends for sparklines
  const kpis: StatCardProps[] = useMemo(() => [
    {
      title: "Total Revenue",
      value: "$142,850.00",
      trend: "+14.3%",
      trendType: "success",
      subText: "vs last month (+$18k)",
      icon: DollarSign,
      chartData: [{ value: 400 }, { value: 480 }, { value: 460 }, { value: 550 }, { value: 610 }, { value: 720 }],
    },
    {
      title: "MRR",
      value: "$11,904.16",
      trend: "+8.2%",
      trendType: "success",
      subText: "vs last month",
      icon: Activity,
      chartData: [{ value: 100 }, { value: 110 }, { value: 105 }, { value: 115 }, { value: 120 }, { value: 130 }],
    },
    {
      title: "ARR",
      value: "$142,850.00",
      trend: "+15.6%",
      trendType: "success",
      subText: "vs last year",
      icon: DollarSign,
      chartData: [{ value: 80 }, { value: 95 }, { value: 110 }, { value: 105 }, { value: 130 }, { value: 142 }],
    },
    {
      title: "Active Subscriptions",
      value: "1,248",
      trend: "+12.1%",
      trendType: "success",
      subText: "145 new joins this month",
      icon: Users,
      chartData: [{ value: 1000 }, { value: 1050 }, { value: 1100 }, { value: 1150 }, { value: 1200 }, { value: 1248 }],
    },
    {
      title: "New This Month",
      value: "164",
      trend: "+24.0%",
      trendType: "success",
      subText: "vs 132 last month",
      icon: Calendar,
      chartData: [{ value: 12 }, { value: 15 }, { value: 20 }, { value: 18 }, { value: 22 }, { value: 30 }],
    },
    {
      title: "Renewals This Month",
      value: "92%",
      trend: "+1.2%",
      trendType: "success",
      subText: "Target: > 90%",
      icon: Clock,
      chartData: [{ value: 88 }, { value: 89 }, { value: 90 }, { value: 90 }, { value: 91 }, { value: 92 }],
    },
    {
      title: "Expired",
      value: "38",
      trend: "-4.2%",
      trendType: "success", // decline in expired = success
      subText: "Fewer losses than May",
      icon: AlertCircle,
      chartData: [{ value: 50 }, { value: 45 }, { value: 48 }, { value: 42 }, { value: 39 }, { value: 38 }],
    },
    {
      title: "Trial Users",
      value: "412",
      trend: "+18.5%",
      trendType: "success",
      subText: "Conversion rate: 24.3%",
      icon: Users,
      chartData: [{ value: 320 }, { value: 340 }, { value: 330 }, { value: 370 }, { value: 390 }, { value: 412 }],
    },
    {
      title: "Churn Rate",
      value: "2.4%",
      trend: "-0.8%",
      trendType: "success",
      subText: "Industry benchmark: 3%",
      icon: TrendingDown,
      chartData: [{ value: 3.5 }, { value: 3.2 }, { value: 3.0 }, { value: 2.8 }, { value: 2.6 }, { value: 2.4 }],
    },
    {
      title: "ARPU",
      value: "$114.46",
      trend: "+3.2%",
      trendType: "success",
      subText: "Average monthly spend",
      icon: DollarSign,
      chartData: [{ value: 108 }, { value: 110 }, { value: 109 }, { value: 112 }, { value: 113 }, { value: 114 }],
    },
    {
      title: "Lifetime Value (LTV)",
      value: "$2,060.00",
      trend: "+4.5%",
      trendType: "success",
      subText: "Based on churn lifespan",
      icon: Award,
      chartData: [{ value: 1900 }, { value: 1950 }, { value: 1980 }, { value: 2000 }, { value: 2020 }, { value: 2060 }],
    },
    {
      title: "Failed Payments",
      value: "14",
      trend: "+12.0%",
      trendType: "danger",
      subText: "Dunning retries active",
      icon: AlertCircle,
      chartData: [{ value: 8 }, { value: 10 }, { value: 9 }, { value: 11 }, { value: 12 }, { value: 14 }],
    },
  ], []);

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {kpis.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
