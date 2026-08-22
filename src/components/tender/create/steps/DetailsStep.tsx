"use client";

import { AlertCircle, ArrowRight,Calendar, Clock } from "lucide-react";
import { useFormContext } from "react-hook-form";

import Select from "@/components/common/Select";
import Input from "@/components/ui/Input";

export default function DetailsStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const openingDate = watch("openingDate");
  const closingDate = watch("closingDate");

  const toLocalISOString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const setOpeningPreset = (preset: "today" | "tomorrow" | "next-week") => {
    const d = new Date();
    if (preset === "today") {
      d.setHours(d.getHours() + 1, 0, 0, 0);
    } else if (preset === "tomorrow") {
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
    } else if (preset === "next-week") {
      d.setDate(d.getDate() + 7);
      d.setHours(9, 0, 0, 0);
    }
    setValue("openingDate", toLocalISOString(d), { shouldValidate: true });
  };

  const setClosingPreset = (days: number) => {
    const baseDate = openingDate ? new Date(openingDate) : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    baseDate.setHours(17, 0, 0, 0);
    setValue("closingDate", toLocalISOString(baseDate), {
      shouldValidate: true,
    });
  };

  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  };

  const getBiddingWindowText = () => {
    if (!openingDate || !closingDate) return null;
    const start = new Date(openingDate);
    const end = new Date(closingDate);
    const diffMs = end.getTime() - start.getTime();
    if (isNaN(diffMs)) return null;

    if (diffMs <= 0) {
      return {
        isError: true,
        text: "Closing date must be after the opening date.",
      };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    let timeText = "";
    if (diffDays > 0) {
      timeText += `${diffDays} day${diffDays > 1 ? "s" : ""}`;
    }
    if (diffHours > 0) {
      if (timeText) timeText += ", ";
      timeText += `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    }
    if (!timeText) {
      timeText = "less than an hour";
    }

    return { isError: false, text: `Bidding window: ${timeText}` };
  };

  const windowInfo = getBiddingWindowText();

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-semibold">Tender Details</h2>
        <p className="mt-1 text-sm text-text-light">
          Configure tender schedule, bidding rules and commercial information.
        </p>
      </div>

      {/* Dates Section Container */}
      <div className="rounded-2xl border border-border bg-background p-6 space-y-6">
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
          <Calendar className="h-4.5 w-4.5" />
          Tender Scheduling Calendar
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Opening Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text">
                Opening Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setOpeningPreset("today")}
                  className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text hover:border-primary/40 hover:bg-primary/5 transition font-medium"
                >
                  +1 Hr
                </button>
                <button
                  type="button"
                  onClick={() => setOpeningPreset("tomorrow")}
                  className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text hover:border-primary/40 hover:bg-primary/5 transition font-medium"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setOpeningPreset("next-week")}
                  className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text hover:border-primary/40 hover:bg-primary/5 transition font-medium"
                >
                  Next Week
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-text"
                {...register("openingDate", {
                  required: "Opening date is required.",
                })}
              />
            </div>

            {openingDate && (
              <p className="text-[11px] text-text-light flex items-center gap-1">
                <Clock size={12} className="text-primary" />
                {formatFriendlyDate(openingDate)}
              </p>
            )}

            {errors.openingDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.openingDate.message as string}
              </p>
            )}
          </div>

          {/* Closing Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text">
                Closing Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setClosingPreset(15)}
                  className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text hover:border-primary/40 hover:bg-primary/5 transition font-medium"
                >
                  15 Days
                </button>
                <button
                  type="button"
                  onClick={() => setClosingPreset(30)}
                  className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text hover:border-primary/40 hover:bg-primary/5 transition font-medium"
                >
                  30 Days
                </button>
                <button
                  type="button"
                  onClick={() => setClosingPreset(60)}
                  className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text hover:border-primary/40 hover:bg-primary/5 transition font-medium"
                >
                  60 Days
                </button>
                <button
                  type="button"
                  onClick={() => setClosingPreset(90)}
                  className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text hover:border-primary/40 hover:bg-primary/5 transition font-medium"
                >
                  90 Days
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-text"
                {...register("closingDate", {
                  required: "Closing date is required.",
                  validate: (val) => {
                    if (!openingDate) return true;
                    return (
                      new Date(val).getTime() >
                        new Date(openingDate).getTime() ||
                      "Closing date must be after the opening date."
                    );
                  },
                })}
              />
            </div>

            {closingDate && (
              <p className="text-[11px] text-text-light flex items-center gap-1">
                <Clock size={12} className="text-primary" />
                {formatFriendlyDate(closingDate)}
              </p>
            )}

            {errors.closingDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.closingDate.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic calculation banner */}
        {windowInfo && (
          <div
            className={`flex items-start gap-2.5 p-4 rounded-xl border transition-all duration-300 ${
              windowInfo.isError
                ? "bg-red-50/50 border-red-200/50 text-red-700 dark:bg-red-950/10 dark:border-red-900/30 dark:text-red-400"
                : "bg-green-50/50 border-green-200/50 text-green-700 dark:bg-green-950/10 dark:border-green-900/30 dark:text-green-400"
            }`}
          >
            {windowInfo.isError ? (
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            ) : (
              <ArrowRight className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {windowInfo.isError
                  ? "Scheduling Conflict"
                  : "Schedule Timeline"}
              </p>
              <p className="text-sm mt-0.5 font-medium">{windowInfo.text}</p>
            </div>
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Project Duration (Days)
          </label>

          <Input
            type="number"
            placeholder="180"
            {...register("projectDuration")}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Bid Validity (Days)
          </label>

          <Input type="number" placeholder="90" {...register("bidValidity")} />
        </div>
      </div>

      {/* EMD */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Earnest Money Deposit (EMD)
          </label>

          <Input type="number" placeholder="50000" {...register("emdAmount")} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Security Deposit (%)
          </label>

          <Input
            type="number"
            placeholder="5"
            {...register("securityDeposit")}
          />
        </div>
      </div>

      {/* Payment & Priority */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Payment Terms
          </label>

          <Select {...register("paymentTerms")}>
            <option value="">Select Payment Terms</option>
            <option value="100% After Completion">100% After Completion</option>
            <option value="Monthly Billing">Monthly Billing</option>
            <option value="Milestone Based">Milestone Based</option>
            <option value="Advance + Milestone">Advance + Milestone</option>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Priority</label>

          <Select {...register("priority")}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </Select>
        </div>
      </div>

      {/* Bid Type */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Bid Evaluation
          </label>

          <Select {...register("evaluationMethod")}>
            <option value="Technical">Technical</option>
            <option value="Financial">Financial</option>
            <option value="QCBS">QCBS</option>
            <option value="L1">L1</option>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Tender Visibility
          </label>

          <Select {...register("visibility")}>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
            <option value="Internal">Internal</option>
          </Select>
        </div>
      </div>

      {/* Eligibility */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Eligibility Criteria
        </label>

        <textarea
          rows={5}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 text-text font-normal leading-normal"
          placeholder="Enter eligibility criteria..."
          {...register("eligibility")}
        />
      </div>

      {/* Special Conditions */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Special Conditions
        </label>

        <textarea
          rows={5}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 text-text font-normal leading-normal"
          placeholder="Special conditions..."
          {...register("specialConditions")}
        />
      </div>
    </div>
  );
}
