"use client";

import { useFormContext } from "react-hook-form";

export default function DocumentsStep() {
  const { register } = useFormContext();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Tender Documents</h2>
        <p className="mt-2 text-text-light">
          Upload all required files before publishing.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium">Tender Document *</label>
          <input
            type="file"
            {...register("tenderDocument")}
            className="block w-full rounded-xl border border-border p-3 text-text"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">BOQ File</label>
          <input
            type="file"
            {...register("boqDocument")}
            className="block w-full rounded-xl border border-border p-3 text-text"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Technical Specification
          </label>
          <input
            type="file"
            {...register("technicalDocument")}
            className="block w-full rounded-xl border border-border p-3 text-text"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Drawings</label>
          <input
            type="file"
            {...register("drawings")}
            className="block w-full rounded-xl border border-border p-3 text-text"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">NIT Document</label>
          <input
            type="file"
            {...register("nitDocument")}
            className="block w-full rounded-xl border border-border p-3 text-text"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Terms & Conditions</label>
          <input
            type="file"
            {...register("termsDocument")}
            className="block w-full rounded-xl border border-border p-3 text-text"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block font-medium">Additional Documents</label>
        <input
          multiple
          type="file"
          {...register("additionalDocuments")}
          className="block w-full rounded-xl border border-border p-3 text-text"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">Internal Notes</label>
        <textarea
          rows={5}
          {...register("internalNotes")}
          className="w-full rounded-xl border border-border p-4 text-text font-normal leading-normal"
        />
      </div>
    </div>
  );
}
