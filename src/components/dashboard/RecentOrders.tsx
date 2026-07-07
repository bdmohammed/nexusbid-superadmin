"use client";

import { Filter } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import Button from "@/components/ui/Button";
import { recentOrders } from "@/data/dashboardData";

export default function RecentOrders() {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-6">
        <div>
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <p className="mt-1 text-text-light">Latest purchases</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" leftIcon={Filter}>
            Filter
          </Button>

          <Button variant="outline">See All</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-4 text-left">Product</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-left">Price</th>
              <th className="px-6 py-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {recentOrders.map((item) => (
              <tr
                key={item.id}
                className="border-t border-border hover:bg-background"
              >
                <td className="px-6 py-5">
                  <h4 className="font-semibold">{item.product}</h4>
                  <p className="text-sm text-text-light">{item.variants}</p>
                </td>

                <td className="px-6 py-5">{item.category}</td>

                <td className="px-6 py-5 font-semibold">{item.price}</td>

                <td className="px-6 py-5">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
