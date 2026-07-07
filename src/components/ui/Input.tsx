import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/tailwind/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-text">{label}</label>
      )}

      <input
        className={cn(
          "w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none transition",
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
          className,
        )}
        {...props}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
