"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/tailwind/utils";

export interface PaginationProps {
  currentPage?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const DOTS = "...";

  const range = (start: number, end: number): number[] => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const getPaginationRange = (): (number | string)[] => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 2;

    const firstPage = 1;
    const lastPage = totalPages;

    if (!showLeftDots && showRightDots) {
      const leftRange = range(1, 3 + siblingCount * 2);

      return [...leftRange, DOTS, lastPage];
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = range(totalPages - (2 + siblingCount * 2), totalPages);

      return [firstPage, DOTS, ...rightRange];
    }

    if (showLeftDots && showRightDots) {
      const middleRange = range(leftSibling, rightSibling);

      return [firstPage, DOTS, ...middleRange, DOTS, lastPage];
    }

    return range(1, totalPages);
  };

  const pages = getPaginationRange();

  return (
    <div className="flex flex-col gap-4 border-t border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-text-light">
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
        <strong>{totalItems}</strong> entries
      </p>

      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface transition hover:bg-sidebar-hover disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        {pages.map((page, index) =>
          page === DOTS ? (
            <span
              key={`dots-${index}`}
              className="px-2 text-sm text-text-light"
            >
              ...
            </span>
          ) : (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(Number(page))}
              className={cn(
                "flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition",
                currentPage === page
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface hover:bg-sidebar-hover",
              )}
            >
              {page}
            </button>
          ),
        )}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface transition hover:bg-sidebar-hover disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
