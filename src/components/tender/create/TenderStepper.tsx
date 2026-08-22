"use client";

import { cn } from "@/lib/tailwind/utils";

export interface TenderStepperProps {
  steps: string[];
  currentStep: number;
}

export default function TenderStepper({
  steps,
  currentStep,
}: TenderStepperProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between px-8 py-8">
        {steps.map((step, index) => {
          const active = index === currentStep;
          const completed = index < currentStep;

          return (
            <div key={step} className="flex flex-1 items-center">
              {/* Step */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                    completed && "border-primary bg-primary text-white",
                    active && "border-primary bg-primary text-white",
                    !completed &&
                      !active &&
                      "border-border bg-background text-text-light",
                  )}
                >
                  {completed ? "✓" : index + 1}
                </div>

                <span
                  className={cn(
                    "mt-3 text-sm font-medium",
                    active ? "text-primary" : "text-text-light",
                  )}
                >
                  {step}
                </span>
              </div>

              {/* Line */}
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    "mx-5 h-[2px] flex-1",
                    completed ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
