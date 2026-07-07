"use client";

import { useState } from "react";
import type { Category } from "@/types";
import ConfirmModal from "../common/ConfirmModal";
import Pagination from "../common/Pagination";
import CategoryRow from "./CategoryRow";

export interface CategoryTableProps {
  data: Category[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function CategoryTable({
  data,
  currentPage,
  pageSize,
  onPageChange,
}: CategoryTableProps) {
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  function handleConfirmDelete() {
    console.log("Delete", categoryToDelete?.id);
    setCategoryToDelete(null);
  }

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-background">
            <tr className="border-b border-border">
              <th className="w-14 px-5 py-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border accent-primary"
                />
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Category
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Slug
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Description
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Created
              </th>
              <th className="w-20 px-5 py-4 text-center text-sm font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedData?.map((item) => (
              <CategoryRow
                key={item.id}
                category={item}
                onDeleteRequest={setCategoryToDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={data.length}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />

      <ConfirmModal
        open={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Category"
      />
    </div>
  );
}
