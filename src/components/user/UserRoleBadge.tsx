import { cn } from "@/lib/tailwind/utils";

export interface UserRoleBadgeProps {
  role: string;
}

export default function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const roleClasses: Record<string, string> = {
    "Super Admin": "bg-purple-100 text-purple-700 border border-purple-300",
    Admin: "bg-indigo-100 text-indigo-700 border border-indigo-300",
    Manager: "bg-blue-100 text-blue-700 border border-blue-300",
    Vendor: "bg-green-100 text-green-700 border border-green-300",
    Buyer: "bg-orange-100 text-orange-700 border border-orange-300",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        roleClasses[role] || "bg-gray-100 text-gray-700 border border-gray-300",
      )}
    >
      {role}
    </span>
  );
}
