// import { ChevronLeft, ChevronRight } from "lucide-react";

// export default function Pagination() {
//   return (
//     <div className="flex items-center justify-between border-t border-border px-6 py-4">

//       <p className="text-sm text-text-light">
//         Showing 1 to 10 of 24 entries
//       </p>

//       <div className="flex gap-2">

//         <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface hover:bg-sidebar-hover">
//           <ChevronLeft size={18} />
//         </button>

//         <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface hover:bg-sidebar-hover">
//           <ChevronRight size={18} />
//         </button>

//       </div>

//     </div>
//   );
// }

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;

  const endItem = Math.min(currentPage * pageSize, totalItems);

  function getPages() {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }

  return (
    <div className="flex flex-col gap-4 border-t border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-text-light">
        Showing <strong>{startItem}</strong> to{" "}
        <strong>{endItem}</strong> of{" "}
        <strong>{totalItems}</strong> entries
      </p>

      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface transition hover:bg-sidebar-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        {getPages().map((page, index) =>
          page === "..." ? (
            <span
              key={index}
              className="px-2 text-text-light"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border transition",
                currentPage === page
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface hover:bg-sidebar-hover"
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface transition hover:bg-sidebar-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}