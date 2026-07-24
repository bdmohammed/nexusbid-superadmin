"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Globe,
  MapPin,
  FileText,
} from "lucide-react";
import { apiClient } from "@/lib/http";
import { useThemeStore } from "@/store/theme.store";
import { Toolbar } from "@/components/ui/Toolbar";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type GridOptions,
  type ICellRendererParams,
  type SideBarDef,
  type GetContextMenuItemsParams,
} from "ag-grid-community";
import {
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  ExcelExportModule,
  IntegratedChartsModule,
  MultiFilterModule,
  PivotModule,
  RichSelectModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule,
  TreeDataModule,
} from "ag-grid-enterprise";

ModuleRegistry.registerModules([
  AllCommunityModule,
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  ExcelExportModule,
  IntegratedChartsModule,
  MultiFilterModule,
  PivotModule,
  RichSelectModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule,
  TreeDataModule,
]);

interface StateEntity {
  id: string;
  countryId: string;
  code: string;
  name: string;
  slug: string;
  type: string;
  isActive: boolean;
  displayOrder: number;
  updatedAt?: string;
  createdAt?: string;
  publishedAt?: string | null;
  createdBy?: any;
  approvedBy?: any;
  version?: number;
  tenderCount?: number;
  workflowStatus: string;
  activeRequestId: string | null;
  activeRequestNumber: string | null;
}

interface CountryEntity {
  id: string;
  code: string;
  name: string;
  slug: string;
  type: string;
  isActive: boolean;
  displayOrder: number;
  updatedAt?: string;
  createdAt?: string;
  publishedAt?: string | null;
  createdBy?: any;
  approvedBy?: any;
  version?: number;
  tenderCount?: number;
  workflowStatus: string;
  activeRequestId: string | null;
  activeRequestNumber: string | null;
  states: StateEntity[];
}

interface FlatGeographyRow {
  path: string[];
  id: string;
  countryId: string;
  stateId?: string;
  name: string;
  code: string;
  type: string;
  isActive: boolean;
  version: number;
  tenderCount: number;
  createdAt: string;
  publishedAt: string | null;
  createdBy: string;
  approvedBy: string;
  activeRequestId: string | null;
  activeRequestNumber: string | null;
  isCountry: boolean;
  countryName: string;
  stateName?: string;
}

interface ListProps {
  onOpenTimeline: (
    countryId: string,
    stateId?: string,
    countryName?: string,
    stateName?: string
  ) => void;
  onProposeAction: (
    targetType: "COUNTRY" | "STATE",
    countryId: string,
    stateId?: string,
    action?: "ACTIVATE" | "DEACTIVATE",
    countryName?: string,
    stateName?: string
  ) => void;
  onOpenReview: (requestId: string) => void;
  onOpenCreateModal?: () => void;
}

const AgGridReactMemo = memo(AgGridReact);

const formatUser = (user: any) => {
  if (!user) return "System";
  if (typeof user === "string") return user;
  return user.fullName || user.name || user.email || "System";
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

export const CountriesListView: React.FC<ListProps> = ({
  onOpenTimeline,
  onProposeAction,
  onOpenReview,
  onOpenCreateModal,
}) => {
  const [countries, setCountries] = useState<CountryEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<any>(null);

  const themeMode = useThemeStore((state) => state.theme);
  const themeClass =
    themeMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>("/countries/hierarchy");
      if (res.data?.success) {
        setCountries(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch countries hierarchy", err);
    } finally {
      setLoading(false);
    }
  };

  const rowData = useMemo<FlatGeographyRow[]>(() => {
    const rows: FlatGeographyRow[] = [];
    countries.forEach((country) => {
      rows.push({
        path: [country.name],
        id: country.id,
        countryId: country.id,
        name: country.name,
        code: country.code,
        type: country.type ? country.type.toUpperCase() : "COUNTRY",
        isActive: country.isActive,
        version: country.version || 1,
        tenderCount: country.tenderCount || 0,
        createdAt: country.createdAt || country.updatedAt || new Date().toISOString(),
        publishedAt: country.publishedAt || null,
        createdBy: formatUser(country.createdBy),
        approvedBy: formatUser(country.approvedBy),
        activeRequestId: country.activeRequestId,
        activeRequestNumber: country.activeRequestNumber,
        isCountry: true,
        countryName: country.name,
      });
      country.states?.forEach((state) => {
        rows.push({
          path: [country.name, state.name],
          id: state.id,
          countryId: country.id,
          stateId: state.id,
          name: state.name,
          code: state.code,
          type: state.type ? state.type.toUpperCase() : "STATE",
          isActive: state.isActive,
          version: state.version || 1,
          tenderCount: state.tenderCount || 0,
          createdAt: state.createdAt || state.updatedAt || new Date().toISOString(),
          publishedAt: state.publishedAt || null,
          createdBy: formatUser(state.createdBy),
          approvedBy: formatUser(state.approvedBy),
          activeRequestId: state.activeRequestId,
          activeRequestNumber: state.activeRequestNumber,
          isCountry: false,
          countryName: country.name,
          stateName: state.name,
        });
      });
    });
    return rows;
  }, [countries]);

  const autoGroupColumnDef = useMemo<ColDef>(() => {
    return {
      headerName: "Geography",
      minWidth: 260,
      flex: 1.5,
      cellRendererParams: {
        suppressCount: true,
        innerRenderer: (params: ICellRendererParams<FlatGeographyRow>) => {
          if (!params.data) return params.value;
          const isCountry = params.data.isCountry;
          return (
            <span className="inline-flex items-center gap-2 text-xs">
              {isCountry ? (
                <Globe className="w-4 h-4 text-text-light shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-text-light/70 shrink-0" />
              )}
              <span
                className={
                  isCountry ? "font-semibold text-text" : "font-normal text-text"
                }
              >
                {params.data.name}
              </span>
            </span>
          );
        },
      },
    };
  }, []);

  const columnDefs = useMemo<ColDef[]>(() => {
    return [
      {
        field: "code",
        headerName: "Code",
        width: 100,
        cellRenderer: (params: ICellRendererParams<FlatGeographyRow>) => {
          if (!params.data) return null;
          return (
            <span className="font-mono text-xs font-semibold text-text bg-surface px-2 py-0.5 rounded-md border border-border">
              {params.data.code}
            </span>
          );
        },
      },
      {
        field: "type",
        headerName: "Type",
        width: 140,
        cellRenderer: (params: ICellRendererParams<FlatGeographyRow>) => {
          if (!params.data) return null;
          return (
            <span className="font-mono text-[11px] text-text-light uppercase tracking-wider">
              {params.data.type}
            </span>
          );
        },
      },
      {
        field: "version",
        headerName: "Version",
        width: 100,
        cellRenderer: (params: ICellRendererParams<FlatGeographyRow>) => {
          if (!params.data) return null;
          return (
            <span className="font-mono text-[11px] text-text-light">
              v{params.data.version}
            </span>
          );
        },
      },
      {
        field: "tenderCount",
        headerName: "Tender Usage",
        width: 130,
        cellRenderer: (params: ICellRendererParams<FlatGeographyRow>) => {
          if (!params.data) return null;
          return (
            <span className="font-mono text-xs text-text font-medium">
              {params.data.tenderCount} active
            </span>
          );
        },
      },
      {
        field: "isActive",
        headerName: "Status",
        width: 130,
        cellRenderer: (params: ICellRendererParams<FlatGeographyRow>) => {
          if (!params.data) return null;
          const isActive = params.data.isActive;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        field: "activeRequestNumber",
        headerName: "Governance Ticket",
        width: 170,
        cellRenderer: (params: ICellRendererParams<FlatGeographyRow>) => {
          if (!params.data) return null;
          const ticketNumber = params.data.activeRequestNumber;
          const requestId = params.data.activeRequestId;
          if (!ticketNumber || !requestId) {
            return (
              <span className="text-text-light text-[11px]">—</span>
            );
          }
          return (
            <button
              onClick={() => onOpenReview(requestId)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-surface text-text hover:bg-sidebar-hover font-mono text-[11px] font-medium transition-colors cursor-pointer"
            >
              <FileText className="w-3 h-3 text-text-light" />
              {ticketNumber}
            </button>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Created At",
        width: 130,
        cellRenderer: (params: ICellRendererParams<FlatGeographyRow>) => {
          if (!params.data) return null;
          return (
            <span className="text-xs text-text-light">
              {formatDate(params.data.createdAt)}
            </span>
          );
        },
      },
      {
        field: "publishedAt",
        headerName: "Published At",
        width: 130,
        cellRenderer: (params: ICellRendererParams<FlatGeographyRow>) => {
          if (!params.data) return null;
          return (
            <span className="text-xs text-text-light">
              {formatDate(params.data.publishedAt)}
            </span>
          );
        },
      },
      {
        field: "createdBy",
        headerName: "Created By",
        width: 140,
        cellRenderer: (params: ICellRendererParams<FlatGeographyRow>) => {
          if (!params.data) return null;
          return (
            <span className="text-xs text-text font-medium">
              {params.data.createdBy}
            </span>
          );
        },
      },
      {
        field: "approvedBy",
        headerName: "Approved By",
        width: 140,
        cellRenderer: (params: ICellRendererParams<FlatGeographyRow>) => {
          if (!params.data) return null;
          return (
            <span className="text-xs text-text font-medium">
              {params.data.approvedBy}
            </span>
          );
        },
      },
    ];
  }, [onOpenReview]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 120,
      filter: true,
      sortable: true,
      resizable: true,
    };
  }, []);

  const sideBar = useMemo<SideBarDef>(() => {
    return {
      toolPanels: [
        {
          id: "columns",
          labelDefault: "Columns",
          labelKey: "columns",
          iconKey: "columns",
          toolPanel: "agColumnsToolPanel",
        },
        {
          id: "filters",
          labelDefault: "Filters",
          labelKey: "filters",
          iconKey: "filter",
          toolPanel: "agFiltersToolPanel",
        },
      ],
    };
  }, []);

  const staticGridOptions = useMemo<GridOptions>(() => {
    return {
      animateRows: true,
    };
  }, []);

  const getContextMenuItems = useCallback(
    (params: GetContextMenuItemsParams) => {
      const row = params.node?.data as FlatGeographyRow | undefined;
      const items: any[] = [];

      if (row) {
        const targetType = row.isCountry ? "COUNTRY" : "STATE";
        const action = row.isActive ? "DEACTIVATE" : "ACTIVATE";

        items.push({
          name: `Propose ${action === "ACTIVATE" ? "Activation" : "Deactivation"} for "${row.name}"`,
          action: () => {
            onProposeAction(
              targetType,
              row.countryId,
              row.isCountry ? undefined : row.stateId,
              action,
              row.countryName,
              row.isCountry ? undefined : row.stateName
            );
          },
        });

        items.push({
          name: `View Audit Timeline for "${row.name}"`,
          action: () => {
            onOpenTimeline(
              row.countryId,
              row.isCountry ? undefined : row.stateId,
              row.countryName,
              row.isCountry ? undefined : row.stateName
            );
          },
        });

        if (row.activeRequestId) {
          items.push({
            name: `Open Governance Ticket #${row.activeRequestNumber}`,
            action: () => {
              onOpenReview(row.activeRequestId!);
            },
          });
        }

        items.push("separator");
      }

      items.push("copy", "copyWithHeaders", "paste", "separator", "export");

      return items;
    },
    [onProposeAction, onOpenTimeline, onOpenReview]
  );

  const getDataPath = useMemo(() => {
    return (data: FlatGeographyRow) => data.path;
  }, []);

  return (
    <div className="space-y-6">
      <div className="relative flex flex-col w-full min-h-[600px] h-[calc(100vh-220px)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px]">
            <Toolbar gridRef={gridRef} />
          </div>
        </div>

        {/* Table Area */}
        <section className="flex flex-1 overflow-hidden mt-2">
          <div
            id="myGrid"
            className={`flex-1 overflow-hidden h-full rounded-[20px] border border-slate-900/10 bg-white/70 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${themeClass}`}
          >
            <AgGridReactMemo
              theme={themeQuartz}
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              loading={loading}
              defaultColDef={defaultColDef}
              sideBar={sideBar}
              gridOptions={staticGridOptions}
              getContextMenuItems={getContextMenuItems}
              treeData={true}
              getDataPath={getDataPath as any}
              autoGroupColumnDef={autoGroupColumnDef as any}
              groupDefaultExpanded={-1}
              pagination
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
