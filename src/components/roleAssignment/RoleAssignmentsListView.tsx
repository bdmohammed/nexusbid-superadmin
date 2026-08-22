//@ts-nocheck
"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import {
  AllCommunityModule,
  type ColDef,themeQuartz,GridOptions,
  GridReadyEvent,
  SideBarDef} from "ag-grid-community";
import {
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
} from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dayjs from "dayjs";
import { Plus } from "lucide-react";

import type { UserRoleAssignment } from "@/features/rbac/types";
import { getRoleAssignmentColumnDefs } from "@/components/roleAssignment/columnDefs";
import Button from "@/components/ui/Button";
import { Toolbar } from "@/components/ui/Toolbar";
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
  PivotModule,
  RowNumbersModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
  SparklinesModule.with(AgChartsEnterpriseModule),
];

const IS_SSR = typeof window === "undefined";

const staticGridOptions: GridOptions = {
  columnTypes: {
    date: {
      width: 200,
      enableRowGroup: true,
      cellClass: "v-align",
      valueFormatter: ({ value }) =>
        value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "—",
    },
  },
  statusBar: {
    statusPanels: [
      {
        statusPanel: "agTotalAndFilteredRowCountComponent",
        key: "totalAndFilter",
        align: "left",
      },
      { statusPanel: "agSelectedRowCountComponent", align: "left" },
      { statusPanel: "agAggregationComponent", align: "right" },
    ],
  },
  cellSelection: {
    enableHeaderHighlight: true,
    handle: {
      mode: "fill",
    },
  },
};

const AgGridReactMemo = memo(AgGridReact);

interface RoleAssignmentsListViewProps {
  assignments: UserRoleAssignment[];
  loading: boolean;
  onOpenDrawer: () => void;
  onDeleteAssignment: (id: string) => void;
  onViewDetails: (assignment: UserRoleAssignment) => void;
  onSubmitForReview: (assignment: UserRoleAssignment) => void;
  onApproveAssignment: (assignment: UserRoleAssignment) => void;
  onRejectAssignment: (assignment: UserRoleAssignment) => void;
  currentUserId?: string;
}

export default function RoleAssignmentsListView({
  assignments,
  loading,
  onOpenDrawer,
  onDeleteAssignment,
  onViewDetails,
  onSubmitForReview,
  onApproveAssignment,
  onRejectAssignment,
  currentUserId,
}: RoleAssignmentsListViewProps) {
  const { theme } = useThemeStore();
  const themeClass =
    theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine";
  const gridRef = useRef<AgGridReact<any>>(null);

  // AG Grid Column Definitions
  const columnDefs = useMemo(
    () =>
      getRoleAssignmentColumnDefs(
        onDeleteAssignment,
        onViewDetails,
        onSubmitForReview,
        onApproveAssignment,
        onRejectAssignment,
        currentUserId,
      ),
    [
      onDeleteAssignment,
      onViewDetails,
      onSubmitForReview,
      onApproveAssignment,
      onRejectAssignment,
      currentUserId,
    ],
  );

  const onGridReady = useCallback((event: GridReadyEvent) => {
    if (!IS_SSR && document.documentElement.clientWidth <= 1024) {
      event.api.closeToolPanel();
    }
  }, []);

  const [isSmall] = useState(() =>
    IS_SSR
      ? false
      : document.documentElement.clientHeight <= 415 ||
        document.documentElement.clientWidth < 768,
  );

  const sideBar = useMemo<SideBarDef>(
    () => ({
      toolPanels: ["columns", "filters"],
      position: "right",
      defaultToolPanel: "columns",
      hiddenByDefault: isSmall,
    }),
    [isSmall],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      minWidth: 50,
      editable: false,
      filter: true,
      floatingFilter: !isSmall,
      enableCellChangeFlash: true,
    }),
    [isSmall],
  );

  return (
    <div className="space-y-4">
      <div className="relative flex h-dvh min-h-[calc(100dvh-var(--layout-grid-header-height))] w-full flex-col">
        <div className="flex items-center justify-between gap-4 pr-6">
          <div className="flex-1">
            <Toolbar gridRef={gridRef} />
          </div>
          <Button leftIcon={Plus} onClick={onOpenDrawer}>
            Assign Role to User
          </Button>
        </div>

        {/* Table Area */}
        <section className="flex flex-1 overflow-hidden">
          <div
            id="rolesGrid"
            className={`flex-1 overflow-hidden h-full rounded-[20px] border border-slate-900/10 bg-white/70 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${themeClass}`}
          >
            <AgGridReactMemo
              theme={themeQuartz}
              ref={gridRef}
              rowData={assignments}
              modules={CommunityModule}
              gridOptions={staticGridOptions}
              columnDefs={columnDefs as any}
              loading={loading}
              defaultColDef={defaultColDef}
              sideBar={sideBar}
              rowGroupPanelShow={isSmall ? undefined : "always"}
              onGridReady={onGridReady}
              pagination
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
