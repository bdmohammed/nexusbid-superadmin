"use client";

import { MoreVertical } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { monthlySales } from "@/data/dashboardData";

export default function MonthlySales() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monthly Sales</h2>
          <p className="mt-1 text-sm text-text-light">
            Sales performance for the current year.
          </p>
        </div>

        <button className="rounded-lg p-2 transition hover:bg-background">
          <MoreVertical size={20} className="text-text-light" />
        </button>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlySales} barCategoryGap={24}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--border)"
            />

            <XAxis dataKey="month" tickLine={false} axisLine={false} />

            <YAxis tickLine={false} axisLine={false} />

            <Tooltip cursor={{ fill: "rgba(0,0,0,.03)" }} />

            <Bar
              dataKey="sales"
              fill="#4F46E5"
              radius={[8, 8, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
