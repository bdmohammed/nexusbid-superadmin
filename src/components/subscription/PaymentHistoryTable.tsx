//@ts-nocheck
"use client";

import React, { memo,useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import { type ColDef, themeQuartz } from "ag-grid-community";
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
import { AgGridReact } from "ag-grid-react";
import dayjs from "dayjs";

import type { BackendSubscription } from "@/types";
import StatusBadge from "@/components/common/StatusBadge";
import Button from "@/components/ui/Button";
import { useThemeStore } from "@/store/theme.store";

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

export interface PaymentHistoryTableProps {
  data: BackendSubscription[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export default function PaymentHistoryTable({
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  loading,
}: PaymentHistoryTableProps) {
  const router = useRouter();
  const gridRef = useRef<AgGridReact>(null);
  const theme = useThemeStore((s) => s.theme);

  const themeMode = useMemo(
    () =>
      themeQuartz.withParams({
        backgroundColor: theme === "dark" ? "#0F172A" : "#FFFFFF",
        foregroundColor: theme === "dark" ? "#F8FAFC" : "#0F172A",
        headerBackgroundColor: theme === "dark" ? "#1E293B" : "#F8FAFC",
        rowHoverColor: theme === "dark" ? "#1E293B80" : "#F1F5F980",
        borderColor: theme === "dark" ? "#334155" : "#E2E8F0",
      }),
    [theme],
  );

  const columnDefs = useMemo<ColDef<BackendSubscription>[]>(
    () => [
      {
        headerName: "Invoice / ID",
        field: "id",
        minWidth: 160,
        cellRenderer: (params: any) => {
          if (!params.data?.id) return null;
          const invoice = `SUB-${params.data.id.slice(0, 8).toUpperCase()}`;
          return (
            <div className="flex flex-col justify-center h-full">
              <span className="font-bold text-xs text-primary font-mono">
                {invoice}
              </span>
              <span className="text-[10px] text-text-light truncate">
                {params.data.id}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Company / Customer",
        field: "user.name",
        minWidth: 220,
        flex: 1,
        cellRenderer: (params: any) => {
          const sub = params.data as BackendSubscription;
          if (!sub) return null;
          const name = sub.user?.name || "Customer";
          const email = sub.user?.email || "N/A";
          const company = sub.user?.companyName || name;
          const companyShort =
            company
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "PE";

          return (
            <div className="flex items-center gap-3 py-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-xs text-primary shrink-0">
                {companyShort}
              </div>
              <div className="flex flex-col truncate">
                <span className="font-semibold text-xs text-text truncate">
                  {company}
                </span>
                <span className="text-[11px] text-text-light truncate">
                  {email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Plan Tier",
        field: "planVersion.name",
        minWidth: 160,
        cellRenderer: (params: any) => {
          const sub = params.data as BackendSubscription;
          if (!sub) return null;
          const planName =
            sub.planVersion?.name ||
            sub.plan?.activeVersion?.name ||
            "Standard Plan";
          return (
            <span className="font-medium text-xs text-text">{planName}</span>
          );
        },
      },
      {
        headerName: "Amount",
        field: "planVersion.priceCents",
        minWidth: 120,
        cellRenderer: (params: any) => {
          const sub = params.data as BackendSubscription;
          if (!sub) return "$0.00";
          const cents =
            sub.planVersion?.priceCents ||
            sub.plan?.activeVersion?.priceCents ||
            0;
          return (
            <span className="font-bold text-xs text-text">
              {`$${(cents / 100).toFixed(2)}`}
            </span>
          );
        },
      },
      {
        headerName: "Status",
        field: "status",
        minWidth: 130,
        cellRenderer: (params: any) => {
          const status = params.value || "inactive";
          let badgeStatus = "Inactive";
          if (status === "active") badgeStatus = "Active";
          else if (status === "pending") badgeStatus = "Pending";
          else if (status === "cancelled") badgeStatus = "Closed";
          else if (status === "past_due") badgeStatus = "Warning";

          return (
            <div className="flex items-center h-full">
              <StatusBadge status={badgeStatus} />
            </div>
          );
        },
      },
      {
        headerName: "Start Date",
        field: "startDate",
        minWidth: 140,
        cellRenderer: (params: any) => {
          if (!params.value) return "N/A";
          return (
            <span className="text-xs text-text-light">
              {dayjs(params.value).format("MMM DD, YYYY")}
            </span>
          );
        },
      },
      {
        headerName: "Actions",
        colId: "actions",
        minWidth: 110,
        pinned: "right",
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

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-xs space-y-4 p-5">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-text">Recent Payments</h2>
          <p className="mt-1 text-sm text-text-light">
            Latest subscription invoices and subscriber details
          </p>
        </div>
      </div>

      {/* AG Grid Container */}
      <div className="w-full h-[520px] rounded-xl border border-border overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-20 bg-surface/80 backdrop-blur-xs flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <svg
                className="animate-spin h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading Invoices...
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
          animateRows={true}
          rowSelection="single"
          pagination={false}
          className="w-full h-full"
        />
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-text-light pt-2">
        <span>
          Showing <strong className="text-text">{data.length}</strong> of{" "}
          <strong className="text-text">{totalCount}</strong> records
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
            <span className="font-semibold text-text">Page {page}</span>
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
