"use client";

import { useState } from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import Pagination from "@/components/common/Pagination";
import type { Tender } from "@/types";
import TenderRow from "./TenderRow";

export interface TenderTableProps {
  data: Tender[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function TenderTable({
  data,
  currentPage,
  pageSize,
  onPageChange,
}: TenderTableProps) {
  const [tenderToDelete, setTenderToDelete] = useState<Tender | null>(null);

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function handleDeleteConfirm() {
    console.log("Delete Tender :", tenderToDelete);
    setTenderToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-background">
              <tr className="border-b border-border">
                <th className="w-14 px-5 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Tender
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Category
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Participants
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Deadline
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Budget
                </th>
                <th className="w-20 px-5 py-4 text-center text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((tender) => (
                  <TenderRow
                    key={tender.id}
                    tender={tender}
                    onDuplicate={(t) => console.log("Duplicate", t)}
                    onPublish={(t) => console.log("Publish", t)}
                    onArchive={(t) => console.log("Archive", t)}
                    onDelete={setTenderToDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        No Tenders Found
                      </h3>
                      <p className="text-text-light">
                        There are no tenders matching your search.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={data.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </div>

      <ConfirmModal
        open={!!tenderToDelete}
        onClose={() => setTenderToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tender"
        message={`Are you sure you want to delete "${tenderToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Tender"
      />
    </>
  );
}
