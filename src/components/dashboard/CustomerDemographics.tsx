"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { tenderCategories } from "@/data/dashboardData";

export default function CustomerDemographics() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Tender Distribution</h2>
        <p className="mt-1 text-sm text-text-light">
          Active tenders by category
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={tenderCategories}
              dataKey="total"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={3}
            >
              {tenderCategories.map((item) => (
                <Cell key={item.id} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-5">
        {tenderCategories.map((item) => (
          <div key={item.id}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    background: item.color,
                  }}
                />
                <span className="font-medium">{item.name}</span>
              </div>

              <span className="text-sm text-text-light">{item.total}</span>
            </div>

            <div className="h-2 rounded-full bg-background">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${item.percentage}%`,
                  background: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
