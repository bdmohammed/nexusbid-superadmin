"use client";

import React, { useMemo, useCallback, useRef, memo } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/common/StatusBadge";
import type { Tender } from "@/types";
import { Toolbar } from "@/components/ui/Toolbar";
import { AgGridReact } from "ag-grid-react";
import {
  type ColDef,
  type GetContextMenuItemsParams,
  themeQuartz,
} from "ag-grid-community";
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
} from "ag-grid-enterprise";
import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import { useThemeStore } from "@/store";
import dayjs from "dayjs";

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

// Helper function to normalize both Tender and TenderVersion response shapes
function resolveTenderRow(data: any) {
  if (!data) return null;

  // Case 1: Row is a TenderVersion object (returned from /api/v1/tenders/admin)
  if (data.tender || data.version !== undefined || data.title) {
    const parentTender = data.tender || {};
    return {
      id: parentTender.id || data.tenderId || data.id,
      versionId: data.id,
      referenceNo: parentTender.referenceNo || data.referenceNo || "TDR-DRAFT",
      publicationStatus:
        parentTender.publicationStatus ||
        data.publicationStatus ||
        "UNPUBLISHED",
      biddingStatus:
        parentTender.biddingStatus || data.biddingStatus || "NOT_OPEN",
      processStatus:
        parentTender.processStatus || data.processStatus || "PRE_BIDDING",
      lifecycleStatus: parentTender.status || "ACTIVE",
      versionNumber: data.version ?? 1,
      versionStatus: data.status || "DRAFT",
      title: data.title || "Untitled Tender",
      description: data.description || "",
      department: data.department || data.category?.name || "General",
      categoryName: data.category?.name || data.department || "General",
      stateName: data.state?.name || "All States",
      stateCode: data.state?.code || "National",
      estimatedBudget: data.estimatedBudget ?? 0,
      currency: data.currency || "USD",
      closingDate: data.closingDate || null,
      openingDate: data.openingDate || null,
      priority: data.priority || "Medium",
    };
  }

  // Case 2: Row is a Tender object with activeVersion
  const ver = data.activeVersion || {};
  return {
    id: data.id,
    versionId: ver.id || data.activeVersionId,
    referenceNo: data.referenceNo || "TDR-DRAFT",
    publicationStatus: data.publicationStatus || "UNPUBLISHED",
    biddingStatus: data.biddingStatus || "NOT_OPEN",
    processStatus: data.processStatus || "PRE_BIDDING",
    lifecycleStatus: data.status || "ACTIVE",
    versionNumber: ver.version ?? 1,
    versionStatus: ver.status || "DRAFT",
    title: ver.title || data.title || "Untitled Tender",
    description: ver.description || "",
    department: ver.department || ver.category?.name || "General",
    categoryName: ver.category?.name || ver.department || "General",
    stateName: ver.state?.name || "All States",
    stateCode: ver.state?.code || "National",
    estimatedBudget: ver.estimatedBudget ?? 0,
    currency: ver.currency || "USD",
    closingDate: ver.closingDate || null,
    openingDate: ver.openingDate || null,
    priority: ver.priority || "Medium",
  };
}

interface TendersListViewProps {
  tenders: Tender[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const TendersListView: React.FC<TendersListViewProps> = ({
  tenders,
  loading = false,
  refreshing = false,
  onRefresh,
}) => {
  const router = useRouter();
  const { theme } = useThemeStore();
  const themeClass =
    theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine";
  const gridRef = useRef<AgGridReact>(null as any);

  // Context menu for AG Grid
  const getContextMenuItems = useCallback(
    (params: GetContextMenuItemsParams) => {
      const row = resolveTenderRow(params.node?.data);
      if (!row) return ["copy", "copyWithHeaders", "separator", "export"];

      return [
        {
          name: "Inspect Tender Details",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
          action: () => router.push(`/tenders/${row.id}`),
        },
        "separator",
        "copy",
        "copyWithHeaders",
        "separator",
        "export",
      ];
    },
    [router],
  );

  // Column definitions for AG Grid
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Reference & Version",
        valueGetter: (params) => resolveTenderRow(params.data)?.referenceNo,
        width: 180,
        cellRenderer: (params: any) => {
          const row = resolveTenderRow(params.data);
          if (!row) return null;
          return (
            <div>
              <span className="font-mono text-sm font-bold text-primary">
                {row.referenceNo}
              </span>
              <div className="text-xs text-text-light">
                v{row.versionNumber} ({row.versionStatus.toLowerCase()})
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Title & Department",
        valueGetter: (params) => resolveTenderRow(params.data)?.title,
        width: 300,
        cellRenderer: (params: any) => {
          const row = resolveTenderRow(params.data);
          if (!row) return null;
          return (
            <div className="max-w-md py-1">
              <h4 className="font-semibold text-text text-sm line-clamp-1">
                {row.title}
              </h4>
              <p className="text-xs text-text-light line-clamp-1">
                {row.department}
              </p>
            </div>
          );
        },
      },
      {
        headerName: "Category & State",
        valueGetter: (params) => resolveTenderRow(params.data)?.categoryName,
        width: 200,
        cellRenderer: (params: any) => {
          const row = resolveTenderRow(params.data);
          if (!row) return null;
          return (
            <div>
              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {row.categoryName}
              </span>
              <div className="text-xs text-text-light mt-0.5">
                State: {row.stateName} ({row.stateCode})
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Timelines",
        valueGetter: (params) => resolveTenderRow(params.data)?.closingDate,
        width: 180,
        cellRenderer: (params: any) => {
          const row = resolveTenderRow(params.data);
          if (!row) return null;
          const daysRemaining = row.closingDate
            ? Math.max(
                0,
                Math.ceil(
                  (new Date(row.closingDate).getTime() - new Date().getTime()) /
                    (1000 * 3600 * 24),
                ),
              )
            : 0;
          return (
            <div>
              <div className="text-xs text-text-light">
                Closing:{" "}
                <span className="font-medium text-text">
                  {row.closingDate
                    ? dayjs(row.closingDate).format("DD MMM YYYY")
                    : "N/A"}
                </span>
              </div>
              <div className="text-xs text-text-light mt-0.5">
                Remaining:{" "}
                <span className="font-semibold text-primary">
                  {daysRemaining} days
                </span>
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Publication",
        valueGetter: (params) =>
          resolveTenderRow(params.data)?.publicationStatus,
        width: 150,
        cellRenderer: (params: any) => {
          const row = resolveTenderRow(params.data);
          return (
            <StatusBadge status={row?.publicationStatus || "UNPUBLISHED"} />
          );
        },
      },
      {
        headerName: "Bidding Gate",
        valueGetter: (params) => resolveTenderRow(params.data)?.biddingStatus,
        width: 140,
        cellRenderer: (params: any) => {
          const row = resolveTenderRow(params.data);
          return <StatusBadge status={row?.biddingStatus || "NOT_OPEN"} />;
        },
      },
      {
        headerName: "Process Stage",
        valueGetter: (params) => resolveTenderRow(params.data)?.processStatus,
        width: 160,
        cellRenderer: (params: any) => {
          const row = resolveTenderRow(params.data);
          return <StatusBadge status={row?.processStatus || "PRE_BIDDING"} />;
        },
      },
      {
        headerName: "Estimated Budget",
        valueGetter: (params) => resolveTenderRow(params.data)?.estimatedBudget,
        width: 170,
        cellRenderer: (params: any) => {
          const row = resolveTenderRow(params.data);
          const val = row?.estimatedBudget ?? 0;
          return (
            <span className="font-bold text-text text-sm">
              $
              {val.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
        },
      },
      {
        headerName: "Actions",
        width: 120,
        cellRenderer: (params: any) => {
          const row = resolveTenderRow(params.data);
          return (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e: any) => {
                e.stopPropagation();
                if (row?.id) router.push(`/tenders/${row.id}`);
              }}
            >
              Inspect
            </Button>
          );
        },
      },
    ],
    [router],
  );

  return (
    <div className="space-y-4 w-full flex flex-col">
      {/* Toolbar & Actions */}
      <div className="flex items-center justify-between gap-4 pb-2 shrink-0">
        <div className="flex-1 min-w-0">
          <Toolbar gridRef={gridRef} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <Button
              variant="outline"
              leftIcon={RefreshCw}
              onClick={onRefresh}
              disabled={refreshing || loading}
              className={`shrink-0 text-xs ${refreshing ? "opacity-75" : ""}`}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          )}
          <Button
            leftIcon={Plus}
            onClick={() => router.push("/tenders/create")}
            className="shrink-0 text-xs"
          >
            Create Tender Wizard
          </Button>
        </div>
      </div>

      {/* Tenders AG Grid Table */}
      <div
        id="tendersGrid"
        className={`h-[600px] w-full rounded-[20px] border border-border bg-surface shadow-sm overflow-hidden ${themeClass}`}
      >
        <AgGridReactMemo
          theme={themeQuartz}
          ref={gridRef}
          rowData={tenders}
          modules={CommunityModule}
          columnDefs={columnDefs as any}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          loading={loading}
          sideBar={{
            toolPanels: ["columns", "filters"],
            defaultToolPanel: "",
          }}
          getContextMenuItems={getContextMenuItems}
          onRowClicked={(params) => {
            const row = resolveTenderRow(params.data);
            if (row?.id) router.push(`/tenders/${row.id}`);
          }}
          pagination
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
        />
      </div>
    </div>
  );
};
