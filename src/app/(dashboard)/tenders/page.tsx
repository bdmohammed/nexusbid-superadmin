'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart2, Plus, TableProperties } from 'lucide-react';

import type { Tender } from '@/types';
import { TendersListView } from '@/components/tender/TendersListView';
import { TendersStatsView } from '@/components/tender/TendersStatsView';
import Button from '@/components/ui/Button';
import { tenderApi } from '@/features/tenders';

function TendersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');

  // Tab State: "stats" | "list"
  const [activeTab, setActiveTab] = useState<'stats' | 'list'>(
    viewParam && ['stats', 'list'].includes(viewParam) ? (viewParam as any) : 'stats',
  );

  useEffect(() => {
    if (viewParam && ['stats', 'list'].includes(viewParam)) {
      setActiveTab(viewParam as any);
    }
  }, [viewParam]);

  const handleTabChange = (tab: 'stats' | 'list') => {
    setActiveTab(tab);
    router.push(`/tenders?view=${tab}`, { scroll: false });
  };

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load backend data
  const fetchTenders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tenderApi.adminList();
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setTenders(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to connect to local database engine, using rich memory seed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  const handleRefreshClick = async () => {
    setRefreshing(true);
    await fetchTenders();
    setRefreshing(false);
  };

  const totalBudgetSum = tenders.reduce(
    (sum, t) => sum + (t.activeVersion?.estimatedBudget ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header Navigation Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Procurement Tenders</h1>
          <p className="mt-1 text-text-light">
            Central Command for tender creation, approvals, versions comparator, and evaluations.
          </p>
        </div>

        <Button leftIcon={Plus} onClick={() => router.push('/tenders/create')}>
          Create Tender Wizard
        </Button>
      </div>

      {/* Main View Tabs (Stats / List) */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => handleTabChange('stats')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition duration-200 ${
            activeTab === 'stats'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-light hover:bg-surface hover:text-text'
          }`}
        >
          <BarChart2 size={18} />
          <span>Tenders Stats</span>
        </button>
        <button
          onClick={() => handleTabChange('list')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition duration-200 ${
            activeTab === 'list'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-light hover:bg-surface hover:text-text'
          }`}
        >
          <TableProperties size={18} />
          <span>Tenders List</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20">
            {tenders.length}
          </span>
        </button>
      </div>

      {/* Part 1: Stats View */}
      {activeTab === 'stats' && (
        <TendersStatsView tenders={tenders} totalBudgetSum={totalBudgetSum} />
      )}

      {/* Part 2: List View (AG Grid) */}
      {activeTab === 'list' && (
        <TendersListView
          tenders={tenders}
          loading={loading}
          refreshing={refreshing}
          onRefresh={handleRefreshClick}
        />
      )}
    </div>
  );
}

export default function TendersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-text-light">Loading tenders...</div>}>
      <TendersPageContent />
    </Suspense>
  );
}
