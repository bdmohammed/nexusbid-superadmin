import { cn } from "@/lib/tailwind/utils";
import type { UserStatus } from "@/types";

export interface UserStatusBadgeProps {
  status: UserStatus;
}

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const statusClasses: Record<UserStatus, string> = {
    Active: "bg-green-100 text-green-700 border border-green-300",
    Pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    Suspended: "bg-red-100 text-red-700 border border-red-300",
    Inactive: "bg-gray-100 text-gray-700 border border-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        statusClasses[status] ||
        "bg-gray-100 text-gray-700 border border-gray-300",
      )}
    >
      {status}
    </span>
  );
}
