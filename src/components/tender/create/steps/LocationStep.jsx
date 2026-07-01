"use client";

import { useFormContext } from "react-hook-form";


import Select from "@/components/common/Select";
import Input from "@/components/ui/Input";

export default function LocationStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-8">

      {/* Heading */}

      <div>
        <h2 className="text-xl font-semibold">
          Project Location
        </h2>

        <p className="mt-1 text-sm text-text-light">
          Enter the location where this tender will be executed.
        </p>
      </div>

      {/* Country & State */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Country <span className="text-red-500">*</span>
          </label>

          <Select
            {...register("country", {
              required: "Country is required.",
            })}
          >
            <option value="">
              Select Country
            </option>

            <option>India</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>UAE</option>
            <option>Singapore</option>
          </Select>

          {errors.country && (
            <p className="mt-1 text-sm text-red-500">
              {errors.country.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            State <span className="text-red-500">*</span>
          </label>

          <Input
            placeholder="Gujarat"
            {...register("state", {
              required: "State is required.",
            })}
          />

          {errors.state && (
            <p className="mt-1 text-sm text-red-500">
              {errors.state.message}
            </p>
          )}
        </div>

      </div>

      {/* City & Pin Code */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium">
            City <span className="text-red-500">*</span>
          </label>

          <Input
            placeholder="Surat"
            {...register("city", {
              required: "City is required.",
            })}
          />

          {errors.city && (
            <p className="mt-1 text-sm text-red-500">
              {errors.city.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Pin Code
          </label>

          <Input
            placeholder="395007"
            {...register("pinCode")}
          />
        </div>

      </div>

      {/* Address */}

      <div>

        <label className="mb-2 block text-sm font-medium">
          Project Address <span className="text-red-500">*</span>
        </label>

        <textarea
          rows={4}
          placeholder="Enter complete project address..."
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          {...register("address", {
            required: "Project address is required.",
          })}
        />

        {errors.address && (
          <p className="mt-1 text-sm text-red-500">
            {errors.address.message}
          </p>
        )}

      </div>

      {/* Contact Person */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm font-medium">
            Contact Person
          </label>

          <Input
            placeholder="John Smith"
            {...register("contactPerson")}
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium">
            Contact Number
          </label>

          <Input
            placeholder="+91 9876543210"
            {...register("contactNumber")}
          />

        </div>

      </div>

      {/* Site Visit */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm font-medium">
            Site Visit Required
          </label>

          <Select {...register("siteVisit")}>

            <option value="No">
              No
            </option>

            <option value="Yes">
              Yes
            </option>

          </Select>

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium">
            Google Map Link
          </label>

          <Input
            placeholder="https://maps.google.com/..."
            {...register("mapLink")}
          />

        </div>

      </div>

      {/* Coordinates */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm font-medium">
            Latitude
          </label>

          <Input
            placeholder="21.1702"
            {...register("latitude")}
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium">
            Longitude
          </label>

          <Input
            placeholder="72.8311"
            {...register("longitude")}
          />

        </div>

      </div>

    </div>
  );
}