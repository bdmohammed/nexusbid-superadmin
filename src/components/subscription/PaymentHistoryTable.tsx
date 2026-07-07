"use client";

import { useState } from "react";
import Pagination from "@/components/common/Pagination";
import type { PaymentHistory } from "@/types";
import PaymentRow from "./PaymentRow";

export interface PaymentHistoryTableProps {
  data: PaymentHistory[];
}

export default function PaymentHistoryTable({
  data,
}: PaymentHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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
            {paginatedData.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={data.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
