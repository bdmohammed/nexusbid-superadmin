//@ts-nocheck
'use client';

import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { type ColDef, type GetContextMenuItemsParams, themeQuartz } from 'ag-grid-community';
import {
  AllCommunityModule,
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  IntegratedChartsModule,
  MasterDetailModule,
  MultiFilterModule,
  PivotModule,
  RichSelectModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  RowNumbersModule,
  SetFilterModule,
  SideBarModule,
  SparklinesModule,
  StatusBarModule,
  TreeDataModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import dayjs from 'dayjs';
import { Plus, RefreshCw, Search } from 'lucide-react';

import type { BackendSubscription } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import { useThemeStore } from '@/store';

const CommunityModule = [
  AllCommunityModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  MasterDetailModule,
  ColumnMenuModule,
  ContextMenuModule,
  MultiFilterModule,
  CellSelectionModule,
  RichSelectModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule,
  TreeDataModule,
  PivotModule,
  RowNumbersModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
  SparklinesModule.with(AgChartsEnterpriseModule),
];

const AgGridReactMemo = memo(AgGridReact);

interface SubscriptionsListViewProps {
  data: BackendSubscription[];
  loading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
  search: string;
  onSearchChange: (val: string) => void;
}

export default function SubscriptionsListView({
  data,
  loading,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onRefresh,
  search,
  onSearchChange,
}: SubscriptionsListViewProps) {
  const router = useRouter();
  const gridRef = useRef<AgGridReact>(null);
  const theme = useThemeStore((s) => s.theme);

  const themeMode = useMemo(
    () =>
      themeQuartz.withParams({
        backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
        foregroundColor: theme === 'dark' ? '#F8FAFC' : '#0F172A',
        headerBackgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC',
        rowHoverColor: theme === 'dark' ? '#1E293B80' : '#F1F5F980',
        borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
      }),
    [theme],
  );

  const columnDefs = useMemo<ColDef<BackendSubscription>[]>(
    () => [
      {
        headerName: 'Invoice / ID',
        field: 'id',
        minWidth: 160,
        cellRenderer: (params: any) => {
          if (!params.data?.id) return null;
          const invoice = `SUB-${params.data.id.slice(0, 8).toUpperCase()}`;
          return (
            <div className="flex flex-col justify-center h-full">
              <span className="font-bold text-xs text-[#003EC7] dark:text-blue-400 font-mono">
                {invoice}
              </span>
              <span className="text-[10px] text-[var(--muted)] truncate">{params.data.id}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Customer / Subscriber',
        field: 'user.name',
        minWidth: 220,
        flex: 1,
        cellRenderer: (params: any) => {
          const sub = params.data as BackendSubscription;
          if (!sub) return null;
          const name = sub.user?.name || 'Customer';
          const email = sub.user?.email || 'N/A';
          const company = sub.user?.companyName || 'Personal';

          return (
            <div className="flex items-center gap-3 py-1">
              <div className="w-8 h-8 rounded-full bg-[#003EC7]/10 text-[#003EC7] font-bold text-xs flex items-center justify-center shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col truncate">
                <span className="font-semibold text-xs text-[var(--foreground)] truncate">
                  {company !== 'Personal' ? company : name}
                </span>
                <span className="text-[11px] text-[var(--muted)] truncate">{email}</span>
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Plan Tier',
        field: 'planVersion.name',
        minWidth: 180,
        cellRenderer: (params: any) => {
          const sub = params.data as BackendSubscription;
          if (!sub) return null;
          const planName =
            sub.planVersion?.name || sub.plan?.activeVersion?.name || 'Standard Plan';
          const planType =
            sub.planVersion?.planType || sub.plan?.activeVersion?.planType || 'all-access';

          return (
            <div className="flex flex-col justify-center h-full">
              <span className="font-semibold text-xs text-[var(--foreground)]">{planName}</span>
              <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">
                {planType}
              </span>
            </div>
          );
        },
      },
      {
        headerName: 'Amount',
        field: 'planVersion.priceCents',
        minWidth: 120,
        cellRenderer: (params: any) => {
          const sub = params.data as BackendSubscription;
          if (!sub) return '$0.00';
          const cents = sub.planVersion?.priceCents || sub.plan?.activeVersion?.priceCents || 0;
          const formatted = (cents / 100).toLocaleString('en-US', {
            style: 'currency',
            currency: sub.planVersion?.currency || 'USD',
            maximumFractionDigits: 0,
          });

          return <span className="font-bold text-xs text-[var(--foreground)]">{formatted}</span>;
        },
      },
      {
        headerName: 'Status',
        field: 'status',
        minWidth: 130,
        cellRenderer: (params: any) => {
          const status = params.value || 'inactive';
          let badgeStatus = 'Inactive';
          if (status === 'active') badgeStatus = 'Active';
          else if (status === 'pending') badgeStatus = 'Pending';
          else if (status === 'cancelled') badgeStatus = 'Closed';
          else if (status === 'past_due') badgeStatus = 'Warning';

          return (
            <div className="flex items-center h-full">
              <StatusBadge status={badgeStatus} />
            </div>
          );
        },
      },
      {
        headerName: 'Start Date',
        field: 'startDate',
        minWidth: 140,
        cellRenderer: (params: any) => {
          if (!params.value) return 'N/A';
          return (
            <span className="text-xs text-[var(--muted)]">
              {dayjs(params.value).format('MMM DD, YYYY')}
            </span>
          );
        },
      },
      {
        headerName: 'Renewal / End',
        field: 'endDate',
        minWidth: 140,
        cellRenderer: (params: any) => {
          if (!params.value) return 'N/A';
          return (
            <span className="text-xs text-[var(--muted)]">
              {dayjs(params.value).format('MMM DD, YYYY')}
            </span>
          );
        },
      },
      {
        headerName: 'Actions',
        colId: 'actions',
        minWidth: 110,
        pinned: 'right',
        cellRenderer: (params: any) => {
          const sub = params.data as BackendSubscription;
          if (!sub) return null;
          return (
            <div className="flex items-center justify-end h-full">
              <Button
                variant="outline"
                size="sm"
                className="text-xs py-1 px-2.5 h-7 font-semibold"
                onClick={() => router.push(`/subscriptions/${sub.id}`)}
              >
                Manage
              </Button>
            </div>
          );
        },
      },
    ],
    [router],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    [],
  );

  const getContextMenuItems = useCallback(
    (params: GetContextMenuItemsParams) => {
      const sub = params.node?.data as BackendSubscription;
      if (!sub) return [];

      return [
        {
          name: `View Subscription (${sub.id.slice(0, 8)})`,
          action: () => router.push(`/subscriptions/${sub.id}`),
          icon: '<span className="ag-icon ag-icon-eye"></span>',
        },
        'copy',
        'export',
      ];
    },
    [router],
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="relative flex-1 w-full sm:w-auto max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search subscriptions by user, company, or ID..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:ring-2 focus:ring-[#003EC7]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={onRefresh}
              className="text-xs py-2"
            >
              Refresh
            </Button>
          )}

          <Button
            leftIcon={Plus}
            size="sm"
            onClick={() => router.push('/subscriptions/create')}
            className="text-xs py-2"
          >
            Create Plan
          </Button>
        </div>
      </div>

      {/* AG Grid Table Container */}
      <div className="w-full h-[600px] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xs relative bg-[var(--surface)]">
        {loading && (
          <div className="absolute inset-0 z-20 bg-[var(--surface)]/80 backdrop-blur-xs flex items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-bold text-[#003EC7]">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading Subscriptions...
            </div>
          </div>
        )}

        <AgGridReactMemo
          ref={gridRef}
          modules={CommunityModule}
          theme={themeMode}
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getContextMenuItems={getContextMenuItems}
          animateRows={true}
          rowSelection="single"
          pagination={false}
          className="w-full h-full"
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-[var(--muted)] px-2">
        <span>
          Showing <strong className="text-[var(--foreground)]">{data.length}</strong> of{' '}
          <strong className="text-[var(--foreground)]">{totalCount}</strong> subscriptions
        </span>

        {totalCount > pageSize && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="text-xs py-1 px-3"
            >
              Previous
            </Button>
            <span className="font-semibold text-[var(--foreground)]">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page * pageSize >= totalCount}
              onClick={() => onPageChange(page + 1)}
              className="text-xs py-1 px-3"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
