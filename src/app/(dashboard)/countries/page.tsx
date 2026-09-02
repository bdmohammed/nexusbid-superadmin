//@ts-nocheck
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, ShieldAlert } from 'lucide-react';

import type { ActivityItem } from '@/components/countries/CountryActivityTimeline';
import { CountriesListView } from '@/components/countries/CountriesListView';
import { CountriesReviewsView } from '@/components/countries/CountriesReviewsView';
import { CountriesStatsView } from '@/components/countries/CountriesStatsView';
import { CountryActivityTimeline } from '@/components/countries/CountryActivityTimeline';
import { CreateChangeRequestModal } from '@/components/countries/CreateChangeRequestModal';
import { ReviewRequestModal } from '@/components/countries/ReviewRequestModal';
import { countriesApi } from '@/features/country';
import { usePermissions } from '@/hooks/usePermissions';

function CountriesPageContent() {
  const { hasPermission, isInitializing } = usePermissions();
  const searchParams = useSearchParams();
  const router = useRouter();

  const canViewCountries =
    hasPermission('country.view') ||
    hasPermission('state.view') ||
    hasPermission('state.manage') ||
    hasPermission('rbac.manage');

  const currentTab = (searchParams.get('tab') as 'stats' | 'list' | 'reviews') || 'stats';

  // Modals & Drawers state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalConfig, setCreateModalConfig] = useState<{
    targetType: 'COUNTRY' | 'STATE';
    countryId: string;
    stateId?: string;
    action: 'ACTIVATE' | 'DEACTIVATE';
    countryName?: string;
    stateName?: string;
  }>({
    targetType: 'COUNTRY',
    countryId: '',
    action: 'DEACTIVATE',
  });

  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Timeline Drawer state
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [timelineTitle, setTimelineTitle] = useState({
    countryName: '',
    stateName: '',
  });
  const [timelineActivities, setTimelineActivities] = useState<ActivityItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const handleTabChange = (tab: 'stats' | 'list' | 'reviews') => {
    router.push(`/countries?tab=${tab}`);
  };

  const handleOpenCreateModal = (
    targetType: 'COUNTRY' | 'STATE' = 'COUNTRY',
    countryId = '',
    stateId = '',
    action: 'ACTIVATE' | 'DEACTIVATE' = 'DEACTIVATE',
    countryName = '',
    stateName = '',
  ) => {
    setCreateModalConfig({
      targetType,
      countryId,
      stateId,
      action,
      countryName,
      stateName,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenReviewModal = (requestId: string) => {
    setActiveReviewId(requestId);
    setIsReviewModalOpen(true);
  };

  const handleOpenTimeline = async (
    countryId: string,
    stateId?: string,
    countryName = '',
    stateName = '',
  ) => {
    setTimelineTitle({ countryName, stateName });
    setIsTimelineOpen(true);
    setLoadingTimeline(true);

    try {
      const { data } = await countriesApi.getTimeline(countryId, stateId);
      if (data.success && data.data) {
        setTimelineActivities(data.data);
      }
    } catch (err) {
      console.error('Failed to load timeline', err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-text-light">Loading geography governance...</p>
      </div>
    );
  }

  if (!canViewCountries) {
    return (
      <div className="p-8 rounded-3xl border border-rose-500/30 bg-rose-500/5 text-center space-y-3 animate-fade-in my-6 max-w-7xl mx-auto">
        <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-text">Country & Geography Access Restricted</h2>
        <p className="text-xs text-text-light max-w-md mx-auto">
          Your account does not have permission (
          <code className="bg-background px-1.5 py-0.5 rounded border border-border text-rose-600 dark:text-rose-400 font-mono">
            country.view
          </code>
          ) to access the country master governance dashboard. Please contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Tab Views */}
      {currentTab === 'stats' && (
        <CountriesStatsView
          onOpenCreateModal={() => handleOpenCreateModal()}
          onSelectTab={handleTabChange}
        />
      )}

      {currentTab === 'list' && (
        <CountriesListView
          onOpenTimeline={handleOpenTimeline}
          onProposeAction={handleOpenCreateModal}
          onOpenReview={handleOpenReviewModal}
          onOpenCreateModal={() => handleOpenCreateModal()}
        />
      )}

      {currentTab === 'reviews' && (
        <CountriesReviewsView onOpenReviewModal={handleOpenReviewModal} />
      )}

      {/* Create Change Request Modal */}
      <CreateChangeRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          handleTabChange('reviews');
        }}
        initialTargetType={createModalConfig.targetType}
        initialCountryId={createModalConfig.countryId}
        initialStateId={createModalConfig.stateId}
        initialAction={createModalConfig.action}
        countryName={createModalConfig.countryName}
        stateName={createModalConfig.stateName}
      />

      {/* Review Ticket Modal */}
      <ReviewRequestModal
        requestId={activeReviewId}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setActiveReviewId(null);
        }}
        onSuccess={() => {
          setIsReviewModalOpen(false);
          setActiveReviewId(null);
          handleTabChange('reviews');
        }}
      />

      {/* Audit Activity Drawer */}
      {isTimelineOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl h-full">
            <CountryActivityTimeline
              countryName={timelineTitle.countryName}
              stateName={timelineTitle.stateName}
              activities={timelineActivities}
              onClose={() => setIsTimelineOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CountriesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-text-light">Loading Countries...</div>}>
      <CountriesPageContent />
    </Suspense>
  );
}
