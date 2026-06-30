"use client";

import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { MoreVertical } from "lucide-react";

export default function MonthlyTarget() {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">

      <div className="flex items-center justify-between p-6">

        <div>

          <h2 className="text-2xl font-bold">
            Monthly Target
          </h2>

          <p className="mt-1 text-text-light">
            Target you've set for this month.
          </p>

        </div>

        <MoreVertical
          className="text-text-light"
          size={20}
        />

      </div>

      <div className="mx-auto h-72 w-72">

        <CircularProgressbar
          value={76}
          text="76%"
        />

      </div>

      <div className="px-8 text-center">

        <p className="text-lg font-semibold">
          You earned ₹3,28,000 this month
        </p>

        <p className="mt-2 text-text-light">
          Excellent growth compared to last month.
        </p>

      </div>

      <div className="mt-8 grid grid-cols-3 border-t border-border">

        <div className="p-5 text-center">

          <p className="text-sm text-text-light">
            Target
          </p>

          <h3 className="mt-2 text-xl font-bold">
            ₹20L
          </h3>

        </div>

        <div className="border-x border-border p-5 text-center">

          <p className="text-sm text-text-light">
            Revenue
          </p>

          <h3 className="mt-2 text-xl font-bold text-green-600">
            ₹18L
          </h3>

        </div>

        <div className="p-5 text-center">

          <p className="text-sm text-text-light">
            Today
          </p>

          <h3 className="mt-2 text-xl font-bold">
            ₹1.8L
          </h3>

        </div>

      </div>

    </div>
  );
}