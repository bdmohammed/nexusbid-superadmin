import { cn } from "@/lib/tailwind/utils";

export interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700 border border-green-300",
    Draft: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    Inactive: "bg-red-100 text-red-700 border border-red-300",
    Archived: "bg-gray-100 text-gray-600 border border-gray-300",
    Published: "bg-blue-100 text-blue-700 border border-blue-300",
    Pending: "bg-purple-100 text-purple-700 border border-purple-300",
    Closed: "bg-gray-100 text-gray-700 border border-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        styles[status] || "bg-gray-100 text-gray-600 border border-gray-300",
      )}
    >
      {status}
    </span>
  );
}
