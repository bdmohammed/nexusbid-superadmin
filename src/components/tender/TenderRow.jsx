"use client";

import { useRouter } from "next/navigation";

import StatusBadge from "@/components/common/StatusBadge";

import TenderActionMenu from "./TenderActionMenu";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDeadlineColor(deadline) {
  const today = new Date();

  const end = new Date(deadline);

  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

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
}) {
  const router = useRouter();

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
          <h4 className="font-semibold text-text">
            {tender.title}
          </h4>

          <p className="mt-1 text-sm text-text-light">
            #{tender.tenderId}
          </p>
        </div>
      </td>

      {/* Category */}
      <td className="px-5 py-5">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {tender.category}
        </span>
      </td>

      {/* Status */}
      <td className="px-5 py-5">
        <StatusBadge status={tender.status} />
      </td>

      {/* Participants */}
      <td className="px-5 py-5">
        <span className="font-medium">
          {tender.participants}
        </span>

        <p className="text-sm text-text-light">
          Bidders
        </p>
      </td>

      {/* Deadline */}
      <td className="px-5 py-5">
        <div className={getDeadlineColor(tender.deadline)}>
          {new Date(tender.deadline).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>

        <p className="text-sm text-text-light">
          {tender.location}
        </p>
      </td>

      {/* Budget */}
      <td className="px-5 py-5 font-semibold">
        {formatCurrency(tender.budget)}
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