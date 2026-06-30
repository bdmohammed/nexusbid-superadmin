"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import TableToolbar from "@/components/common/TableToolbar";
import SubscriptionStats from "@/components/subscription/SubscriptionStats";
import PricingPlans from "@/components/subscription/PricingPlans";
import PaymentHistoryTable from "@/components/subscription/PaymentHistoryTable";
import paymentHistory from "@/data/paymentHistory";

export default function SubscriptionPage() {
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredPayments = useMemo(() => {
    return paymentHistory.filter((item) =>
      [
        item.invoice,
        item.company,
        item.plan,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Subscription Management
          </h1>

          <p className="mt-1 text-text-light">
            Manage subscription plans, billing and payment history.
          </p>
        </div>

        <Button leftIcon={Plus}>
          Create Plan
        </Button>
      </div>

      {/* KPI */}
      <SubscriptionStats />

      {/* Pricing */}
      <PricingPlans />

      {/* Payment History */}
      <TableToolbar
        search={search}
        total={filteredPayments.length}
        name="payment"
        placeholder="Search invoice, company..."
        handleSearch={handleSearch}
      />

      <PaymentHistoryTable
        data={filteredPayments}
      />
    </div>
  );
}