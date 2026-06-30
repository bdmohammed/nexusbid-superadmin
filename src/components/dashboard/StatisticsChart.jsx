"use client";

import { useState } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
 YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { CalendarDays } from "lucide-react";
import { statisticsData } from "@/data/dashboardData";


export default function StatisticsChart() {
  const [period, setPeriod] = useState("Monthly");

  const tabs = [
    "Monthly",
    "Quarterly",
    "Annually",
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h2 className="text-2xl font-bold">
            Statistics
          </h2>

          <p className="mt-1 text-text-light">
            Target you've set for each month.
          </p>

        </div>

        <div className="flex flex-wrap items-center gap-3">

          <div className="flex rounded-xl bg-background p-1">

            {tabs?.map((tab) => (

              <button
                key={tab}
                onClick={() => setPeriod(tab)}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
                  period === tab
                    ? "bg-surface shadow text-text"
                    : "text-text-light"
                }`}
              >
                {tab}
              </button>

            ))}

          </div>

          <button className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2">

            <CalendarDays size={18} />

            Jun 24 - Jun 30

          </button>

        </div>

      </div>

      {/* Chart */}

      <div className="h-[420px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <AreaChart
            data={statisticsData}
          >

            <defs>

              <linearGradient
                id="sales"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#4F46E5"
                  stopOpacity={0.35}
                />

                <stop
                  offset="95%"
                  stopColor="#4F46E5"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="revenue"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#93C5FD"
                  stopOpacity={0.3}
                />

                <stop
                  offset="95%"
                  stopColor="#93C5FD"
                  stopOpacity={0}
                />
              </linearGradient>

            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="var(--border)"
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="sales"
              stroke="#4F46E5"
              strokeWidth={3}
              fill="url(#sales)"
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#93C5FD"
              strokeWidth={3}
              fill="url(#revenue)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}