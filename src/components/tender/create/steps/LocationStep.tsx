"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import Select from "@/components/common/Select";
import Input from "@/components/ui/Input";
import { useCountries, useStates } from "@/features/country/api/queries";

export default function LocationStep() {
  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  const selectedCountry = watch("country");

  const { data: countries = [], isLoading: isLoadingCountries } =
    useCountries();
  const { data: states = [], isLoading: isLoadingStates } = useStates(
    selectedCountry ? { country: selectedCountry } : undefined,
  );

  // Default select first country when countries load
  useEffect(() => {
    if (countries.length > 0 && !getValues("country")) {
      setValue("country", countries[0].countryName, { shouldValidate: true });
    }
  }, [countries, getValues, setValue]);

  // Default select first state when states load
  useEffect(() => {
    if (states.length > 0 && !getValues("state")) {
      setValue("state", states[0].id, { shouldValidate: true });
    }
  }, [states, getValues, setValue]);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-semibold">Project Location</h2>
        <p className="mt-1 text-sm text-text-light">
          Enter the Google place metadata and address where this tender project
          will be executed.
        </p>
      </div>

      {/* Country & State */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Country <span className="text-red-500">*</span>
          </label>

          <Select
            className="w-full"
            disabled={isLoadingCountries}
            {...register("country", {
              required: "Country is required.",
            })}
          >
            <option value="">
              {isLoadingCountries ? "Loading Countries..." : "Select Country"}
            </option>
            {countries.map((c) => (
              <option key={c.countryId} value={c.countryName}>
                {c.countryName}
              </option>
            ))}
          </Select>

          {errors.country && (
            <p className="mt-1 text-sm text-red-500">
              {errors.country.message as string}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            State <span className="text-red-500">*</span>
          </label>

          <Select
            className="w-full"
            disabled={!selectedCountry || isLoadingStates}
            {...register("state", {
              required: "State is required.",
            })}
          >
            <option value="">
              {!selectedCountry
                ? "Select Country First"
                : isLoadingStates
                  ? "Loading States..."
                  : "Select State"}
            </option>
            {states?.map((st: any) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.code})
              </option>
            ))}
          </Select>

          {errors.state && (
            <p className="mt-1 text-sm text-red-500">
              {errors.state.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Project Address <span className="text-red-500">*</span>
        </label>

        <textarea
          rows={3}
          placeholder="Enter complete project address..."
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 text-text font-normal leading-normal"
          {...register("address", {
            required: "Project address is required.",
          })}
        />

        {errors.address && (
          <p className="mt-1 text-sm text-red-500">
            {errors.address.message as string}
          </p>
        )}
      </div>

      {/* Google placeId and formattedAddress */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Google Maps Place ID
          </label>
          <Input
            placeholder="e.g. ChIJzTg1CwG2j4ARHM5mRz6gL-g"
            {...register("placeId")}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Google Maps Formatted Address
          </label>
          <Input
            placeholder="e.g. 1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA"
            {...register("formattedAddress")}
          />
        </div>
      </div>

      {/* Contact Person */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Contact Person
          </label>
          <Input placeholder="John Smith" {...register("contactPerson")} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Contact Number
          </label>
          <Input placeholder="+1 555 0199" {...register("contactNumber")} />
        </div>
      </div>

      {/* Site Visit */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Site Visit Required
          </label>

          <Select {...register("siteVisit")}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Google Maps Public Web Link
          </label>
          <Input
            placeholder="https://maps.google.com/..."
            {...register("mapLink")}
          />
        </div>
      </div>
    </div>
  );
}
