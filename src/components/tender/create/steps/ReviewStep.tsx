"use client";

import { useFormContext } from "react-hook-form";
import { useCategories } from "@/features/categories/api/queries";
import { useStates } from "@/features/country/api/queries";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface ReviewStepProps {
  uploadedDocs?: any[];
}

export default function ReviewStep({ uploadedDocs = [] }: ReviewStepProps) {
  const { getValues } = useFormContext();
  const data = getValues();

  const { data: categoryData } = useCategories({
    status: "PUBLISHED",
    limit: 100,
  });
  const rawCategories = categoryData?.categories || [];
  const categories = rawCategories.filter((c: any) => c.status === "PUBLISHED");
  const { data: states = [] } = useStates(
    data.country ? { country: data.country } : undefined,
  );

  const categoryName =
    categories.find((c: any) => c.id === data.category)?.name || data.category;
  const stateName =
    states.find((s: any) => s.id === data.state)?.name || data.state;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Review & Submit for Governance</h2>
        <p className="text-text-light mt-2 text-sm">
          Verify all draft parameters and uploaded version documents before submitting for internal governance review. Assigned auditors/reviewers will approve or request changes prior to publication.
        </p>
      </div>

      {/* Basic Info */}
      <div className="rounded-xl border border-border p-6">
        <h3 className="font-semibold text-lg mb-5">Basic Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <Item title="Tender Title" value={data.title} />
          <Item title="Reference" value={data.referenceNumber} />
          <Item title="Category" value={categoryName} />
          <Item
            title="Budget"
            value={`${data.currency} ${data.budgetMin || "0"} - ${data.budgetMax || "0"}`}
          />
          <Item title="Tender Type" value={data.tenderType} />
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl border border-border p-6">
        <h3 className="font-semibold text-lg mb-5">Location</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <Item title="Country" value={data.country} />
          <Item title="State" value={stateName} />
          <Item title="City" value={data.city} />
          <Item title="Address" value={data.address} />
          <Item title="Contact Person" value={data.contactPerson} />
          <Item title="Contact Number" value={data.contactNumber} />
        </div>
      </div>

      {/* Tender Details */}
      <div className="rounded-xl border border-border p-6">
        <h3 className="font-semibold text-lg mb-5">Tender Details</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <Item title="Opening Date" value={data.openingDate} />
          <Item title="Closing Date" value={data.closingDate} />
          <Item title="Project Duration" value={data.projectDuration} />
          <Item title="Bid Validity" value={data.bidValidity} />
          <Item title="Priority" value={data.priority} />
          <Item title="Visibility" value={data.visibility} />
        </div>
      </div>

      {/* Uploaded Version Documents Summary */}
      <div className="rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Uploaded S3 Version Documents
          </h3>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={13} /> {uploadedDocs.length} Documents Registered
          </span>
        </div>

        {uploadedDocs.length === 0 ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              <strong>Warning:</strong> No documents have been uploaded to S3 yet. At least one document is required before publishing.
            </span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {uploadedDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl bg-background border border-border text-xs flex items-center justify-between"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-bold text-text truncate">
                    {doc.documentOriginalName || doc.originalName}
                  </p>
                  <p className="text-[10px] text-text-light">
                    {doc.documentType} • Direct S3 Upload
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0">
                  Registered
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ItemProps {
  title: string;
  value?: string | number | null;
}

function Item({ title, value }: ItemProps) {
  return (
    <div>
      <p className="text-sm text-text-light">{title}</p>
      <p className="mt-1 font-semibold">{value || "-"}</p>
    </div>
  );
}
