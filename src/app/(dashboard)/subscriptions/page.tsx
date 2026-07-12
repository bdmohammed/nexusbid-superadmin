"use client";

import { Plus, CreditCard } from "lucide-react";
import { type ChangeEvent, useMemo, useState } from "react";
import TableToolbar from "@/components/common/TableToolbar";
import PaymentHistoryTable from "@/components/subscription/PaymentHistoryTable";
import PricingPlans from "@/components/subscription/PricingPlans";
import SubscriptionStats from "@/components/subscription/SubscriptionStats";
import Button from "@/components/ui/Button";
import { usePermissions } from "@/hooks/usePermissions";
import PremiumFeatureUpsell from "@/components/common/PremiumFeatureUpsell";
import { useRouter } from "next/navigation";
import {
  useAdminPlans,
  useAdminSubscriptions,
  useAdminUserStats,
  useAdminRevenueStats,
} from "@/features/subscriptions/api/queries";

export default function SubscriptionPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const canView = hasPermission("subscription.view") || hasPermission("billing.view");

  const { data: plansData, isLoading: plansLoading } = useAdminPlans();
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useAdminSubscriptions(page, limit);
  const { data: userStats, isLoading: userStatsLoading } = useAdminUserStats();
  const { data: revenueStats, isLoading: revenueStatsLoading } = useAdminRevenueStats();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const filteredSubscriptions = useMemo(() => {
    const list = subscriptionsData?.data || [];
    if (!search) return list;
    return list.filter((sub) => {
      const company = sub.user?.companyName || sub.user?.name || "Personal";
      const planName = sub.planVersion?.name || sub.plan?.activeVersion?.name || "Standard Plan";
      const invoice = `SUB-${sub.id.slice(0, 8).toUpperCase()}`;
      return [invoice, company, planName, sub.status]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [subscriptionsData, search]);

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
      <SubscriptionStats 
        userStats={userStats}
        revenueStats={revenueStats}
        loading={userStatsLoading || revenueStatsLoading}
      />

      {/* Pricing */}
      <PricingPlans 
        plans={plansData || []}
        loading={plansLoading}
      />

      {/* Payment History */}
      <TableToolbar
        search={search}
        total={filteredSubscriptions.length}
        name="payment"
        placeholder="Search invoice, company..."
        handleSearch={handleSearch}
      />

      <PaymentHistoryTable 
        data={filteredSubscriptions}
        totalCount={subscriptionsData?.meta?.total || 0}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        loading={subscriptionsLoading}
      />
    </div>
  );
}
