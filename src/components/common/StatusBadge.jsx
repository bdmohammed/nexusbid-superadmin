import { cn } from "@/lib/utils";

export default function StatusBadge({ status }) {
  const styles = {
    Active:
      "bg-green-100 text-green-700 border border-green-300",

    Draft:
      "bg-yellow-100 text-yellow-700 border border-yellow-300",

    Inactive:
      "bg-red-100 text-red-700 border border-red-300",

    Archived:
      "bg-gray-100 text-gray-600 border border-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}