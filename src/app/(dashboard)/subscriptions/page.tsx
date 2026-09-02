'use client';

import { type ChangeEvent, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Plus } from 'lucide-react';

import PremiumFeatureUpsell from '@/components/common/PremiumFeatureUpsell';
import TableToolbar from '@/components/common/TableToolbar';
import PaymentHistoryTable from '@/components/subscription/PaymentHistoryTable';
import PricingPlans from '@/components/subscription/PricingPlans';
import SubscriptionStats from '@/components/subscription/SubscriptionStats';
import Button from '@/components/ui/Button';
import {
  useAdminPlans,
  useAdminRevenueStats,
  useAdminSubscriptions,
  useAdminUserStats,
} from '@/features/subscriptions/api/queries';
import { usePermissions } from '@/hooks/usePermissions';

type ViewTab = 'stats' | 'plan-list' | 'payment-list';

function SubscriptionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions();

  const viewParam = searchParams.get('view');
  let activeTab: ViewTab = 'stats';
  if (viewParam === 'plan-list') {
    activeTab = 'plan-list';
  } else if (viewParam === 'payment-list' || viewParam === 'list') {
    activeTab = 'payment-list';
  }

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const canView = hasPermission('subscription.view') || hasPermission('billing.view');

  const { data: plansData, isLoading: plansLoading, refetch: refetchPlans } = useAdminPlans();
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useAdminSubscriptions(
    page,
    limit,
  );
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
      const company = sub.user?.companyName || sub.user?.name || 'Personal';
      const planName = sub.planVersion?.name || sub.plan?.activeVersion?.name || 'Standard Plan';
      const invoice = `SUB-${sub.id.slice(0, 8).toUpperCase()}`;
      return [invoice, company, planName, sub.status, sub.user?.email]
        .filter(Boolean)
        .join(' ')
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
      {/* View 1: Subscriptions Stats */}
      {activeTab === 'stats' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <SubscriptionStats
            userStats={userStats}
            revenueStats={revenueStats}
            loading={userStatsLoading || revenueStatsLoading}
          />
        </div>
      )}

      {/* View 2: Plans Tier List */}
      {activeTab === 'plan-list' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <Button leftIcon={Plus} onClick={() => router.push('/subscriptions/create')}>
            Create Plan
          </Button>
          <PricingPlans plans={plansData || []} loading={plansLoading} onRefresh={refetchPlans} />
        </div>
      )}

      {/* View 3: Recent Payments AG Grid List */}
      {activeTab === 'payment-list' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <TableToolbar
            search={search}
            total={filteredSubscriptions.length}
            name="payment"
            placeholder="Search invoice, company, email..."
            handleSearch={handleSearch}
          />

          <PaymentHistoryTable
            data={filteredSubscriptions}
            totalCount={subscriptionsData?.meta?.total || filteredSubscriptions.length}
            page={page}
            pageSize={limit}
            onPageChange={setPage}
            loading={subscriptionsLoading}
          />
        </div>
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-text-light">Loading Subscription Dashboard...</div>
      }
    >
      <SubscriptionPageContent />
    </Suspense>
  );
}
