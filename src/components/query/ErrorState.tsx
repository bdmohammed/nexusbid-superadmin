import { AlertCircle, RefreshCw } from "lucide-react";

import type { AppError } from "@/lib/errors";
import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: AppError | Error | null;
  icon?: ReactNode;
  retry?: () => void;
  actions?: ReactNode;
}

export default function ErrorState({
  title = "Something went wrong",
  description,
  error,
  icon,
  retry,
  actions,
}: ErrorStateProps) {
  const displayDescription =
    description ||
    error?.message ||
    "An unexpected error occurred while loading this data.";

  return (
    <div className="w-full p-8 md:p-10 my-4 bg-[var(--surface-secondary)] border border-red-500/10 rounded-2xl relative overflow-hidden text-center flex flex-col items-center justify-center">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500 opacity-5 blur-2xl rounded-full"></div>

      <div className="relative z-10 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl mb-4">
        {icon || <AlertCircle className="w-8 h-8" />}
      </div>

      <h3 className="relative z-10 text-xl font-bold text-[var(--foreground)]">
        {title}
      </h3>
      <p className="relative z-10 mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
        {displayDescription}
      </p>

      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3">
        {retry && (
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 py-2 px-4 bg-[#003EC7] hover:bg-[#002fad] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-hover-spin" />
            Try Again
          </button>
        )}
        {actions}
      </div>
    </div>
  );
}
