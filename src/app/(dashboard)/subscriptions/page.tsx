"use client";

import { Plus, CreditCard } from "lucide-react";
import { type ChangeEvent, useMemo, useState } from "react";
import TableToolbar from "@/components/common/TableToolbar";
import PaymentHistoryTable from "@/components/subscription/PaymentHistoryTable";
import PricingPlans from "@/components/subscription/PricingPlans";
import SubscriptionStats from "@/components/subscription/SubscriptionStats";
import Button from "@/components/ui/Button";
import paymentHistory from "@/data/paymentHistory";
import { usePermissions } from "@/hooks/usePermissions";
import PremiumFeatureUpsell from "@/components/common/PremiumFeatureUpsell";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState("");

  const canView = hasPermission("subscription.view") || hasPermission("billing.view");

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredPayments = useMemo(() => {
    return paymentHistory.filter((item) =>
      [item.invoice, item.company, item.plan, item.status]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [search]);

  if (!canView) {
    return (
      <PremiumFeatureUpsell
        title="Billing & Subscriptions"
        description="View corporate payment invoices, update subscription tiers, review transaction tables, and control plan seat details."
        moduleName="Billing & Subscriptions"
        icon={CreditCard}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="mt-1 text-text-light">
            Manage subscription plans, billing and payment history.
          </p>
        </div>

        <Button leftIcon={Plus} onClick={() => router.push("/subscriptions/create")}>Create Plan</Button>
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

      <PaymentHistoryTable data={filteredPayments} />
    </div>
  );
}
