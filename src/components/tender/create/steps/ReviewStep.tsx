"use client";

import { useFormContext } from "react-hook-form";

export default function ReviewStep() {
  const { getValues } = useFormContext();
  const data = getValues();

  return (
    <div className="space-y-8">
      {" "}
      <div>
        <h2 className="text-2xl font-semibold">Review Tender</h2>
        <p className="text-text-light mt-2">
          Please verify all details before publishing.
        </p>
      </div>
      <div className="rounded-xl border border-border p-6">
        <h3 className="font-semibold text-lg mb-5">Basic Information</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <Item title="Tender Title" value={data.title} />
          <Item title="Reference" value={data.referenceNumber} />
          <Item title="Category" value={data.category} />
          <Item title="Sub Category" value={data.subCategory} />
          <Item
            title="Budget"
            value={`${data.currency} ${data.budgetMin} - ${data.budgetMax}`}
          />
          <Item title="Tender Type" value={data.tenderType} />
        </div>
      </div>
      <div className="rounded-xl border border-border p-6">
        <h3 className="font-semibold text-lg mb-5">Location</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <Item title="Country" value={data.country} />
          <Item title="State" value={data.state} />
          <Item title="City" value={data.city} />
          <Item title="Address" value={data.address} />
          <Item title="Contact Person" value={data.contactPerson} />
          <Item title="Contact Number" value={data.contactNumber} />
        </div>
      </div>
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
