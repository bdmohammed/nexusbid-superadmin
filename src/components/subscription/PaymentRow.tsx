import type { BackendSubscription } from "@/types";
import StatusBadge from "@/components/common/StatusBadge";

export interface PaymentRowProps {
  subscription: BackendSubscription;
}

export default function PaymentRow({ subscription }: PaymentRowProps) {
  const invoice = `SUB-${subscription.id.slice(0, 8).toUpperCase()}`;
  const company =
    subscription.user?.companyName || subscription.user?.name || "Personal";
  const companyShort =
    company
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PE";
  const plan =
    subscription.planVersion?.name ||
    subscription.plan?.activeVersion?.name ||
    "Standard Plan";
  const amount = `$${((subscription.planVersion?.priceCents || 0) / 100).toFixed(2)}`;

  // Status mapping
  let status = "Inactive";
  if (subscription.status === "active") {
    status = "Active";
  } else if (subscription.status === "pending") {
    status = "Pending";
  } else if (subscription.status === "cancelled") {
    status = "Closed";
  }

  const dateStr = new Date(subscription.startDate).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <tr className="border-b border-border transition hover:bg-background">
      <td className="px-6 py-4">
        <div>
          <h4 className="font-semibold text-text">{invoice}</h4>
          <p className="mt-1 text-xs text-text-light">Invoice ID</p>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
            {companyShort}
          </div>

          <div>
            <h4 className="font-medium">{company}</h4>
            <p className="text-xs text-text-light">{plan}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 font-semibold">{amount}</td>

      <td className="px-6 py-4">
        <StatusBadge status={status} />
      </td>

      <td className="px-6 py-4 text-text-light">{dateStr}</td>
    </tr>
  );
}
