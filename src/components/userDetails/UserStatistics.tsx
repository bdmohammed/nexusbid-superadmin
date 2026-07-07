import { FileText, IndianRupee, LogIn, ShoppingBag } from "lucide-react";
import type { UserDetails } from "@/types";

export interface UserStatisticsProps {
  user: UserDetails;
}

const stats = (user: UserDetails) => [
  {
    title: "Purchases",
    value: user.totalPurchases,
    icon: ShoppingBag,
  },
  {
    title: "Total Spent",
    value: user.totalSpent,
    icon: IndianRupee,
  },
  {
    title: "Tenders Submitted",
    value: user.tendersSubmitted,
    icon: FileText,
  },
  {
    title: "Login Count",
    value: user.loginCount,
    icon: LogIn,
  },
];

export default function UserStatistics({ user }: UserStatisticsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {stats(user).map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-light">{item.title}</p>
                <h2 className="mt-2 text-3xl font-bold">{item.value}</h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
