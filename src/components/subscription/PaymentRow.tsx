import StatusBadge from "@/components/common/StatusBadge";
import type { PaymentHistory } from "@/types";

export interface PaymentRowProps {
  payment: PaymentHistory;
}

export default function PaymentRow({ payment }: PaymentRowProps) {
  return (
    <tr className="border-b border-border transition hover:bg-background">
      <td className="px-6 py-4">
        <div>
          <h4 className="font-semibold text-text">{payment.invoice}</h4>
          <p className="mt-1 text-xs text-text-light">Invoice ID</p>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
            {payment.companyShort}
          </div>

          <div>
            <h4 className="font-medium">{payment.company}</h4>
            <p className="text-xs text-text-light">{payment.plan}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 font-semibold">{payment.amount}</td>

      <td className="px-6 py-4">
        <StatusBadge status={payment.status} />
      </td>

      <td className="px-6 py-4 text-text-light">{payment.date}</td>
    </tr>
  );
}
