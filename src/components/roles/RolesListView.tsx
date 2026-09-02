//@ts-nocheck
'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import type {
  GetContextMenuItemsParams,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  SideBarDef} from 'ag-grid-community';
import {
  AllCommunityModule,
  type ColDef,  themeQuartz} from 'ag-grid-community';
import {
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  ExcelExportModule,
  IntegratedChartsModule,
  MasterDetailModule,
  MultiFilterModule,
  NewFiltersToolPanelModule,
  PivotModule,
  RichSelectModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  RowNumbersModule,
  SetFilterModule,
  SideBarModule,
  SparklinesModule,
  StatusBarModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import dayjs from 'dayjs';
import { Key, Plus, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';

import type { Role } from '@/features/rbac/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Toolbar } from '@/components/ui/Toolbar';
import { useThemeStore } from '@/store/theme.store';

const AgGridReactMemo = memo(AgGridReact);

const CommunityModule = [
  AllCommunityModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  NewFiltersToolPanelModule,
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
  PivotModule,
  RowNumbersModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
  SparklinesModule.with(AgChartsEnterpriseModule),
];

const IS_SSR = typeof window === 'undefined';

const staticGridOptions: GridOptions = {
  columnTypes: {
    date: {
      width: 200,
      enableRowGroup: true,
      cellClass: 'v-align',
      valueFormatter: ({ value }) => (value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : '—'),
    },
  },
  statusBar: {
    statusPanels: [
      {
        statusPanel: 'agTotalAndFilteredRowCountComponent',
        key: 'totalAndFilter',
        align: 'left',
      },
      { statusPanel: 'agSelectedRowCountComponent', align: 'left' },
      { statusPanel: 'agAggregationComponent', align: 'right' },
    ],
  },
  cellSelection: {
    enableHeaderHighlight: true,
    handle: {
      mode: 'fill',
    },
  },
  rowSelection: {
    mode: 'multiRow',
  },
  initialGroupOrderComparator: ({ nodeA, nodeB }) => {
    const aKey = nodeA.key || '';
    const bKey = nodeB.key || '';
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  },
  enableRtl: IS_SSR ? false : /[?&]rtl=true/.test(window.location.search),
  pivotPanelShow: 'always',
  enableCharts: true,
  undoRedoCellEditing: true,
  undoRedoCellEditingLimit: 50,
  rowNumbers: true,
  enableFilterHandlers: true,
  rowDragManaged: true,
  rowDragMultiRow: true,
  pagination: true,
  paginationPageSize: 20,
  paginationPageSizeSelector: [10, 20, 50, 100],
  loadingOverlayComponent: () => (
    <div className="ag-overlay-loading-center" role="presentation">
      <div aria-live="polite" aria-atomic="true">
        Loading governance roles...
      </div>
    </div>
  ),
};

interface RolesListViewProps {
  roles: Role[];
  loading: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (role: Role) => void;
  onOpenView: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onOpenAssign: (role: Role) => void;
  onViewHistory: (role: Role) => void;
  onCompareVersions: (role: Role) => void;
  onDeleteRole: (id: string) => void;
  onRefresh?: () => void | Promise<void>;
}

export const RolesListView: React.FC<RolesListViewProps> = ({
  roles,
  loading,
  onOpenCreate,
  onOpenEdit,
  onOpenView,
  onDuplicate,
  onOpenAssign,
  onViewHistory,
  onCompareVersions,
  onDeleteRole,
  onRefresh,
}) => {
  const gridRef = useRef<AgGridReact>(null as any);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.refreshCells({ force: true });
    }
  }, [roles]);

  const handleRefreshClick = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      if (gridRef.current?.api) {
        gridRef.current.api.refreshCells({ force: true });
      }
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };
  const currentTheme = useThemeStore((state) => state.theme);
  const darkMode = currentTheme === 'dark';
  const themeClass = darkMode ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';

  const [isSmall] = useState(() =>
    IS_SSR
      ? false
      : document.documentElement.clientHeight <= 415 || document.documentElement.clientWidth < 768,
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      minWidth: 100,
      flex: 1,
      resizable: true,
      editable: false,
      filter: true,
      floatingFilter: !isSmall,
      enableCellChangeFlash: true,
    }),
    [isSmall],
  );

  const sideBar = useMemo<SideBarDef>(
    () => ({
      toolPanels: ['columns', 'filters'],
      position: 'right',
      defaultToolPanel: 'columns',
      hiddenByDefault: isSmall,
    }),
    [isSmall],
  );

  const onGridReady = useCallback((event: GridReadyEvent) => {
    if (!IS_SSR && document.documentElement.clientWidth <= 1024) {
      event.api.closeToolPanel();
    }
    setTimeout(() => {
      event.api.sizeColumnsToFit();
    }, 100);
  }, []);

  const getContextMenuItems = useCallback(
    (params: GetContextMenuItemsParams<Role>) => {
      const role = params.node?.data;
      if (!role) return [];

      return [
        {
          name: 'View Role',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
          action: () => onOpenView(role),
        },
        {
          name:
            (role as any).versionStatus === 'APPROVED' ||
            (role as any).versionStatus === 'PUBLISHED'
              ? 'Create New Revision'
              : 'Edit Draft',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
          disabled: role.isSystemRole,
          action: () => {
            if (role.isSystemRole) {
              toast.error('System roles are read-only and cannot be modified.');
              return;
            }
            onOpenEdit(role);
          },
        },
        {
          name: 'Duplicate',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
          action: () => onDuplicate(role),
        },
        {
          name: 'Assign Users',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>',
          disabled: role.status !== 'ACTIVE',
          action: () => {
            if (role.status !== 'ACTIVE') {
              toast.error(
                'Assign Users is disabled: This role is currently inactive or draft. It must be APPROVED and ACTIVE before it can be assigned to users.',
              );
              return;
            }
            onOpenAssign(role);
          },
        },
        {
          name: 'View Audit Log',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
          action: () => onViewHistory(role),
        },
        {
          name: 'Compare Versions (Diff)',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>',
          action: () => onCompareVersions(role),
        },
        'separator',
        {
          name: 'Archive Role',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
          disabled: role.isSystemRole,
          action: () => {
            if (role.isSystemRole) {
              toast.error(
                'Archive is disabled: System roles are read-only and cannot be deleted or archived.',
              );
              return;
            }
            onDeleteRole(role.id);
          },
        },
        'separator',
        'copy',
        'copyWithHeaders',
        'export',
      ];
    },
    [onOpenView, onOpenEdit, onDuplicate, onOpenAssign, onViewHistory, onDeleteRole],
  );

  const columnDefs: ColDef<Role>[] = useMemo(
    () => [
      {
        rowDrag: true,
        field: 'name',
        headerName: 'Role Name',
        width: 220,
        enableRowGroup: true,
        cellClass: 'v-align',
        cellRenderer: (params: ICellRendererParams<Role>) => {
          const r = params.data;
          if (!r) return null;
          return (
            <div className="flex items-center h-full">
              <span className="font-bold text-text truncate">{r.name}</span>
            </div>
          );
        },
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 280,
        enableRowGroup: true,
        cellClass: 'v-align',
        cellRenderer: (params: ICellRendererParams<Role>) => {
          const r = params.data;
          if (!r) return null;
          const replacesMatch = r.description?.match(/\[ReplacesRole:\s*([0-9a-fA-F-]+)\]/);
          const cleanDesc =
            r.description?.replace(/\[ReplacesRole:\s*([0-9a-fA-F-]+)\]/, '').trim() || '';
          return (
            <div className="flex items-center gap-2 h-full truncate text-xs text-text-light">
              <span className="truncate">{cleanDesc || 'No description'}</span>
              {replacesMatch && (
                <span className="shrink-0 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  🔄 Replaces
                </span>
              )}
            </div>
          );
        },
      },
      {
        field: 'version',
        headerName: 'Active Version',
        width: 150,
        enableRowGroup: true,
        cellClass: 'v-align',
        cellRenderer: (params: ICellRendererParams<Role>) => {
          const r = params.data as any;
          if (!r) return null;
          const vStatus = r.versionStatus;
          const label = r.version ? `v${r.version}` : 'v1.0';
          const tag =
            vStatus === 'DRAFT'
              ? ' (Draft)'
              : vStatus === 'PENDING_REVIEW' || vStatus === 'IN_REVIEW' || vStatus === 'SUBMITTED'
                ? ' (In Review)'
                : '';
          return (
            <div className="flex items-center h-full text-xs font-semibold text-text">
              {label}
              {tag && <span className="text-text-light font-normal text-[11px] ml-1">{tag}</span>}
            </div>
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        enableRowGroup: true,
        cellClass: 'v-align',
        cellRenderer: (params: ICellRendererParams<Role>) => {
          const r = params.data as any;
          if (!r) return null;
          const vStatus = r.versionStatus;
          if (vStatus === 'PENDING_REVIEW' || vStatus === 'SUBMITTED' || vStatus === 'IN_REVIEW') {
            return (
              <div className="flex items-center h-full">
                <Badge color="purple">IN REVIEW</Badge>
              </div>
            );
          }
          if (vStatus === 'DRAFT') {
            return (
              <div className="flex items-center h-full">
                <Badge color="yellow">DRAFT</Badge>
              </div>
            );
          }
          if (vStatus === 'APPROVED' || r.status === 'ACTIVE') {
            return (
              <div className="flex items-center h-full">
                <Badge color="green">ACTIVE</Badge>
              </div>
            );
          }
          if (vStatus === 'REJECTED') {
            return (
              <div className="flex items-center h-full">
                <Badge color="red">REJECTED</Badge>
              </div>
            );
          }
          return (
            <div className="flex items-center h-full">
              <Badge color={r.status === 'DISABLED' ? 'yellow' : 'red'}>
                {r.status === 'DISABLED' ? 'DRAFT' : r.status}
              </Badge>
            </div>
          );
        },
      },
      {
        field: 'isSystemRole',
        headerName: 'Is System Role',
        width: 140,
        enableRowGroup: true,
        cellClass: 'v-align',
        cellRenderer: (params: ICellRendererParams<Role>) => {
          const r = params.data;
          if (!r) return null;
          return (
            <div className="flex items-center h-full">
              <Badge color={r.isSystemRole ? 'purple' : 'gray'}>
                {r.isSystemRole ? 'Yes' : 'No'}
              </Badge>
            </div>
          );
        },
      },
      {
        field: 'isDefaultRole',
        headerName: 'Is Default Role',
        width: 140,
        enableRowGroup: true,
        cellClass: 'v-align',
        cellRenderer: (params: ICellRendererParams<Role>) => {
          const r = params.data;
          if (!r) return null;
          return (
            <div className="flex items-center h-full">
              <Badge color={r.isDefaultRole ? 'indigo' : 'gray'}>
                {r.isDefaultRole ? 'Yes' : 'No'}
              </Badge>
            </div>
          );
        },
      },
      {
        field: 'permissions',
        headerName: 'Permission Modules',
        width: 260,
        enableRowGroup: true,
        cellClass: 'v-align',
        cellRenderer: (params: ICellRendererParams<Role>) => {
          const r = params.data;
          if (!r) return null;
          if (r.slug === 'super-admin') {
            return (
              <div className="flex items-center h-full text-xs font-bold text-primary">
                <Key className="h-3.5 w-3.5 mr-1" /> All Privileges
              </div>
            );
          }
          const perms = r.permissions || [];
          if (perms.length === 0) {
            return <span className="text-xs text-text-light italic">No permissions</span>;
          }

          // Extract unique module names from permission keys (e.g. "countries:read" -> "Countries")
          const moduleNames = Array.from(
            new Set(
              perms.map((p: string) => {
                const prefix = (p || '').split(/[:.]/)[0] || p;
                return prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
              }),
            ),
          );

          const displayModules = moduleNames.slice(0, 3);
          const remainingModules = moduleNames.length - 3;

          return (
            <div className="flex items-center gap-1.5 h-full overflow-hidden text-xs">
              {displayModules.map((m, idx) => (
                <span
                  key={idx}
                  className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md text-[11px] font-semibold truncate max-w-[110px]"
                >
                  {m}
                </span>
              ))}
              {remainingModules > 0 && (
                <span className="text-[10px] font-bold text-text-light bg-border/60 px-1.5 py-0.5 rounded-md">
                  +{remainingModules}
                </span>
              )}
            </div>
          );
        },
      },
      {
        field: 'createdByUser',
        headerName: 'Created By',
        width: 180,
        enableRowGroup: true,
        cellClass: 'v-align',
        cellRenderer: (params: ICellRendererParams<Role>) => {
          const r = params.data;
          if (!r) return null;
          const user = r.createdByUser;
          if (!user) {
            return <span className="text-xs text-text-light italic">System</span>;
          }
          return (
            <div className="flex flex-col justify-center h-full text-xs">
              <span className="font-semibold text-text truncate">{user.name || 'Unknown'}</span>
              <span className="text-[10px] text-text-light truncate">{user.email}</span>
            </div>
          );
        },
      },
      {
        field: 'userCount',
        headerName: 'Used By',
        width: 130,
        enableRowGroup: true,
        cellClass: 'v-align',
        cellRenderer: (params: ICellRendererParams<Role>) => {
          const r = params.data;
          if (!r) return null;
          const count = r.userCount ?? 0;
          return (
            <div className="flex items-center h-full">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Users className="h-3.5 w-3.5" />
                {count} {count === 1 ? 'User' : 'Users'}
              </span>
            </div>
          );
        },
      },
      {
        field: 'createdAt',
        headerName: 'Created At',
        width: 170,
        enableRowGroup: true,
        cellClass: 'v-align',
        cellRenderer: (params: ICellRendererParams<Role>) => {
          const r = params.data;
          if (!r) return null;
          return (
            <div className="flex items-center h-full text-xs text-text-light">
              {r.createdAt ? dayjs(r.createdAt).format('DD MMM YYYY, hh:mm A') : '—'}
            </div>
          );
        },
      },
      {
        field: 'updatedAt',
        headerName: 'Updated At',
        width: 170,
        enableRowGroup: true,
        cellClass: 'v-align',
        cellRenderer: (params: ICellRendererParams<Role>) => {
          const r = params.data;
          if (!r) return null;
          return (
            <div className="flex items-center h-full text-xs text-text-light">
              {r.updatedAt ? dayjs(r.updatedAt).format('DD MMM YYYY, hh:mm A') : '—'}
            </div>
          );
        },
      },
    ],
    [],
  );

  const getRowId = useCallback((params: any) => {
    return params.data?.id || params.data?.roleId || params.data?.name;
  }, []);

  return (
    <div className="space-y-4 w-full flex flex-col">
      {/* Grid Container */}
      <div className="relative flex flex-col w-full h-[calc(100vh-210px)] min-h-[600px]">
        <div className="flex items-center justify-between gap-4 pb-2 shrink-0">
          <div className="flex-1 min-w-0">
            <Toolbar gridRef={gridRef} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              leftIcon={RefreshCw}
              onClick={handleRefreshClick}
              disabled={refreshing || loading}
              className={`shrink-0 text-xs ${refreshing ? 'opacity-75' : ''}`}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button leftIcon={Plus} onClick={onOpenCreate} className="shrink-0 text-xs">
              Create Role Draft
            </Button>
          </div>
        </div>

        <section className="flex flex-1 min-h-[520px] h-full w-full overflow-hidden">
          <div
            id="rolesGrid"
            className={`w-full h-full min-h-[520px] flex-1 rounded-[20px] border border-border bg-surface shadow-md ${themeClass}`}
          >
            <AgGridReactMemo
              theme={themeQuartz}
              ref={gridRef}
              rowData={roles}
              getRowId={getRowId}
              modules={CommunityModule}
              gridOptions={staticGridOptions}
              columnDefs={columnDefs as any}
              loading={loading}
              defaultColDef={defaultColDef}
              sideBar={sideBar}
              rowGroupPanelShow={isSmall ? undefined : 'always'}
              onGridReady={onGridReady}
              getContextMenuItems={getContextMenuItems}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
