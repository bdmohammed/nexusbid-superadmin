"use client";

import { useRouter } from "next/navigation";
import StatusBadge from "@/components/common/StatusBadge";
import type { Tender } from "@/types";
import TenderActionMenu from "./TenderActionMenu";

export interface TenderRowProps {
  tender: Tender;
  onDuplicate?: (tender: Tender) => void;
  onPublish?: (tender: Tender) => void;
  onArchive?: (tender: Tender) => void;
  onDelete?: (tender: Tender) => void;
}

function formatCurrency(amount: number | null) {
  if (amount === null) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDeadlineColor(deadline: string | null) {
  if (!deadline) return "text-text";
  const today = new Date();
  const end = new Date(deadline);
  const diff = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff < 0) return "text-red-600";
  if (diff <= 7) return "text-orange-600";
  return "text-text";
}

export default function TenderRow({
  tender,
  onDuplicate,
  onPublish,
  onArchive,
  onDelete,
}: TenderRowProps) {
  const router = useRouter();
  const version = tender.activeVersion;

  return (
    <tr className="border-b border-border transition hover:bg-background">
      {/* Checkbox */}
      <td className="px-5 py-5">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border accent-primary"
        />
      </td>

      {/* Tender */}
      <td className="px-5 py-5">
        <div>
          <h4 className="font-semibold text-text">{version?.title ?? "No Title"}</h4>
          <p className="mt-1 text-sm text-text-light">#{tender.referenceNo}</p>
        </div>
      </td>

      {/* Category */}
      <td className="px-5 py-5">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {version?.category?.name ?? "General"}
        </span>
      </td>

      {/* Status */}
      <td className="px-5 py-5">
        <StatusBadge status={tender.publicationStatus.toLowerCase()} />
      </td>

      {/* Participants */}
      <td className="px-5 py-5">
        <span className="font-medium">0</span>
        <p className="text-sm text-text-light">Bidders</p>
      </td>

      {/* Deadline */}
      <td className="px-5 py-5">
        <div className={getDeadlineColor(version?.closingDate ?? null)}>
          {version?.closingDate
            ? new Date(version.closingDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A"}
        </div>
        <p className="text-sm text-text-light">{version?.state?.name ?? "National"}</p>
      </td>

      {/* Budget */}
      <td className="px-5 py-5 font-semibold">
        {formatCurrency(version?.estimatedBudget ?? null)}
      </td>

      {/* Action */}
      <td className="px-5 py-5 text-center">
        <TenderActionMenu
          tender={tender}
          onView={() => router.push(`/tenders/${tender.id}`)}
          onEdit={() => router.push(`/tenders/${tender.id}`)}
          onDuplicate={onDuplicate}
          onPublish={onPublish}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}
