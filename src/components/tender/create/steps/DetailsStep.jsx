"use client";

import { useFormContext } from "react-hook-form";


import Select from "@/components/common/Select";
import Input from "@/components/ui/Input";

export default function DetailsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-8">

      {/* Heading */}

      <div>
        <h2 className="text-xl font-semibold">
          Tender Details
        </h2>

        <p className="mt-1 text-sm text-text-light">
          Configure tender schedule, bidding rules and commercial information.
        </p>
      </div>

      {/* Dates */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Opening Date
            <span className="text-red-500"> *</span>
          </label>

          <Input
            type="datetime-local"
            {...register("openingDate", {
              required: "Opening date is required.",
            })}
          />

          {errors.openingDate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.openingDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Closing Date
            <span className="text-red-500"> *</span>
          </label>

          <Input
            type="datetime-local"
            {...register("closingDate", {
              required: "Closing date is required.",
            })}
          />

          {errors.closingDate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.closingDate.message}
            </p>
          )}
        </div>

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

          <Input
            type="number"
            placeholder="90"
            {...register("bidValidity")}
          />
        </div>

      </div>

      {/* EMD */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Earnest Money Deposit (EMD)
          </label>

          <Input
            type="number"
            placeholder="50000"
            {...register("emdAmount")}
          />
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

            <option value="">
              Select Payment Terms
            </option>

            <option>
              100% After Completion
            </option>

            <option>
              Monthly Billing
            </option>

            <option>
              Milestone Based
            </option>

            <option>
              Advance + Milestone
            </option>

          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Priority
          </label>

          <Select {...register("priority")}>

            <option>
              Low
            </option>

            <option>
              Medium
            </option>

            <option>
              High
            </option>

            <option>
              Critical
            </option>

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

            <option>
              Technical
            </option>

            <option>
              Financial
            </option>

            <option>
              QCBS
            </option>

            <option>
              L1
            </option>

          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Tender Visibility
          </label>

          <Select {...register("visibility")}>

            <option>
              Public
            </option>

            <option>
              Private
            </option>

            <option>
              Internal
            </option>

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
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Special conditions..."
          {...register("specialConditions")}
        />

      </div>

    </div>
  );
}