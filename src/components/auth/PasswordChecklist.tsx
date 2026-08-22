import React from "react";
import { Check } from "lucide-react";

interface PasswordChecklistProps {
  password?: string;
  isTouched?: boolean;
  isDirty?: boolean;
  isSubmitted?: boolean;
}

const requirements = [
  {
    id: "length",
    label: "At least 8 characters",
    check: (val: string) => val.length >= 8,
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter",
    check: (val: string) => /[A-Z]/.test(val),
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter",
    check: (val: string) => /[a-z]/.test(val),
  },
  {
    id: "number",
    label: "At least one number",
    check: (val: string) => /[0-9]/.test(val),
  },
  {
    id: "special",
    label: "At least one special character",
    check: (val: string) => /[^A-Za-z0-9]/.test(val),
  },
];

export const PasswordChecklist = React.memo(
  ({
    password = "",
    isTouched = false,
    isDirty = false,
    isSubmitted = false,
  }: PasswordChecklistProps) => {
    if (!isDirty && !isTouched && !isSubmitted) return null;

    return (
      <div className="mt-3 p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg space-y-2">
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
          Password Requirements
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {requirements.map((req) => {
            const isSatisfied = req.check(password);
            return (
              <div
                key={req.id}
                className="flex items-center gap-2 text-xs transition-all duration-200"
              >
                <div
                  className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all ${
                    isSatisfied
                      ? "bg-green-500/20 border-green-500 text-green-500"
                      : "bg-transparent border-[var(--border)] text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span
                  className={
                    isSatisfied
                      ? "text-[var(--foreground)] font-medium"
                      : "text-[var(--muted)]"
                  }
                >
                  {req.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

PasswordChecklist.displayName = "PasswordChecklist";
