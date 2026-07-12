"use client";

import Pagination from "@/components/common/Pagination";
import type { BackendSubscription } from "@/types";
import PaymentRow from "./PaymentRow";

export interface PaymentHistoryTableProps {
  data: BackendSubscription[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export default function PaymentHistoryTable({
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  loading,
}: PaymentHistoryTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent Payments</h2>
            <p className="mt-1 text-sm text-text-light">
              Latest subscription invoices
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Invoice
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Company
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-border">
                  <td className="px-6 py-4"><div className="h-4 w-20 bg-border rounded" /></td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-border rounded mb-1" />
                    <div className="h-3 w-20 bg-border rounded" />
                  </td>
                  <td className="px-6 py-4"><div className="h-4 w-12 bg-border rounded" /></td>
                  <td className="px-6 py-4"><div className="h-6 w-16 bg-border rounded-full" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-border rounded" /></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-text-light text-sm font-semibold">
                  No subscription records found.
                </td>
              </tr>
            ) : (
              data.map((subscription) => (
                <PaymentRow key={subscription.id} subscription={subscription} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalItems={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
