"use client";

import Button from "@/components/ui/Button";

export default function TenderNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
}) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-6 shadow-sm">
      {/* Save Draft */}

      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          // TODO:
          // Save Draft API
          console.log("Draft Saved");
        }}
      >
        Save as Draft
      </Button>

      {/* Navigation */}

      <div className="flex items-center gap-3">
        {!isFirst && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
          >
            Previous
          </Button>
        )}

        {isLast ? (
          <Button type="submit">
            Create Tender
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}