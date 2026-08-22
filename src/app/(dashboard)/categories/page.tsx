//@ts-nocheck
"use client";

import {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter,useSearchParams } from "next/navigation";
import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import {
  AllCommunityModule,
  type ColDef,
  type GetContextMenuItemsParams,
  themeQuartz,
} from "ag-grid-community";
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
  TreeDataModule,
} from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dayjs from "dayjs";
import {
  CheckCircle2,
  FolderKanban,
  FolderOpen,
  Plus,
  RotateCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { CategoryFormDrawer } from "@/components/categories/CategoryFormDrawer";
import {
  CategoryReviewDecisionModal,
  SubmitCategoryReviewModal,
} from "@/components/categories/CategoryGovernanceModals";
import Button from "@/components/ui/Button";
import { Toolbar } from "@/components/ui/Toolbar";
import { useAuthStore } from "@/features/auth/store/store";
import { categoryApi } from "@/features/categories/api/api";
import { rbacApi } from "@/features/rbac/api/api";
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

// Local Interfaces
interface Category {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
  parentId?: string | null;
  parentCategory?: { id: string; code: string; name: string } | null;
  activeVersionId?: string | null;
  activeVersion?: {
    id: string;
    versionNumber: string;
    majorVersion: number;
    minorVersion: number;
    status: string;
  } | null;
  displayOrder?: number;
  icon?: string | null;
  color?: string | null;
  isActive: boolean;
  tenderCount?: number;
  childrenCount?: number;
  createdAt: string;
  updatedAt: string;
  createdByUser?: { id: string; name: string; email: string } | null;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  tendersCount: number;
}

interface CategoryVersionItem {
  id: string;
  versionNumber: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  createdAt: string;
  createdByUser?: { name: string; email: string };
  approvedByUser?: { name: string; email: string };
}

interface CategoryReviewItem {
  id: string;
  status: string;
  submittedAt: string;
  decisionComment: string | null;
  assignments: {
    id: string;
    reviewer: { name: string; email: string };
    status: string;
  }[];
  comments: {
    id: string;
    comment: string;
    action: string;
    createdAt: string;
    user: { name: string };
  }[];
}

interface CategoryActivityItem {
  id: string;
  event: string;
  details: Record<string, any> | null;
  createdAt: string;
  actor: { name: string; email: string };
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

type DrawerTab =
  | "general"
  | "hierarchy"
  | "review"
  | "comments"
  | "versions"
  | "activity"
  | "usage";

function CategoriesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  const { theme } = useThemeStore();
  const themeClass =
    theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine";
  const gridRef = useRef<AgGridReact>(null as any);

  // Tab State: "stats" | "list"
  const [activeTab, setActiveTab] = useState<"stats" | "list">(
    viewParam && ["stats", "list"].includes(viewParam)
      ? (viewParam as any)
      : "stats",
  );

  useEffect(() => {
    if (viewParam && ["stats", "list"].includes(viewParam)) {
      setActiveTab(viewParam as any);
    }
  }, [viewParam]);

  const handleTabChange = (tab: "stats" | "list") => {
    setActiveTab(tab);
    router.push(`/categories?view=${tab}`, { scroll: false });
  };

  // Main Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    archived: 0,
    tendersCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Governance Drawer States
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("general");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [currentCategoryForm, setCurrentCategoryForm] = useState<
    Partial<Category>
  >({});

  // Governance Details Data
  const [versions, setVersions] = useState<CategoryVersionItem[]>([]);
  const [reviews, setReviews] = useState<CategoryReviewItem[]>([]);
  const [activities, setActivities] = useState<CategoryActivityItem[]>([]);
  const [usageStats, setUsageStats] = useState<{
    tendersCount: number;
    activeTendersCount: number;
    subcategoriesCount: number;
  }>({
    tendersCount: 0,
    activeTendersCount: 0,
    subcategoriesCount: 0,
  });

  // Action States inside Drawer
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>([]);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [decisionComment, setDecisionComment] = useState<string>("");
  const [submitReviewOpen, setSubmitReviewOpen] = useState<boolean>(false);
  const [reviewActionOpen, setReviewActionOpen] = useState<boolean>(false);
  const [reviewDecision, setReviewDecision] = useState<
    "APPROVE" | "REJECT" | "CHANGES_REQUESTED"
  >("APPROVE");
  const currentUser = useAuthStore((state) => state.user);
  const [submittingReviewAction, setSubmittingReviewAction] =
    useState<boolean>(false);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshList = async () => {
    setRefreshing(true);
    try {
      await fetchCategories();
      await fetchStats();
      showToast("Category list refreshed successfully");
    } catch {
      showToast("Failed to refresh category list", "error");
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  // Fetch Categories List & Stats
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryApi.getCategories({ limit: 100 });
      const body = res.data;
      if (body?.success && body?.data) {
        const rawList =
          body.data.categories || (Array.isArray(body.data) ? body.data : []);
        setCategories(rawList);
        if (body.data.stats) {
          setStats(body.data.stats);
        }
      }
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load categories",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await categoryApi.getCategoryStats();
      const body = res.data;
      if (body?.success && body?.data) {
        setStats(body.data);
      }
    } catch {
      // fallback if endpoint fails
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await rbacApi.getAssignableUsers({
        accountType: "admin",
        status: "active",
        permission: "category.manage",
        limit: 100,
      });
      const body = res.data;
      if (body?.success && body?.data) {
        const uList =
          body.data.users || (Array.isArray(body.data) ? body.data : []);
        setAdminUsers(uList);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  // Fetch Governance Details for Drawer
  const fetchCategoryGovernance = async (categoryId: string) => {
    try {
      const res = await categoryApi.getCategoryGovernance(categoryId);
      const body = res.data;
      if (body?.success && body?.data) {
        const d = body.data as any;
        setSelectedCategory(d.category);
        setCurrentCategoryForm(d.category);
        setVersions(d.versions || []);
        setReviews(d.reviews || []);
        setActivities(d.activities || []);
        setUsageStats(
          d.usage || {
            tendersCount: 0,
            activeTendersCount: 0,
            subcategoriesCount: 0,
          },
        );
      }
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load category governance details",
        "error",
      );
    }
  };

  const openDrawer = (
    mode: "create" | "edit" | "view",
    category?: Category,
    tab: DrawerTab = "general",
  ) => {
    setDrawerMode(mode);
    setDrawerTab(tab);
    if (category) {
      setSelectedCategory(category);
      setCurrentCategoryForm(category);
      fetchCategoryGovernance(category.id);
    } else {
      setSelectedCategory(null);
      setCurrentCategoryForm({
        name: "",
        code: "",
        description: "",
        displayOrder: 0,
      });
      setVersions([]);
      setReviews([]);
      setActivities([]);
    }
    setDrawerOpen(true);
  };

  // Lifecycle Actions
  const handleCreateOrUpdateCategory = async (
    e?: React.FormEvent | React.MouseEvent,
  ) => {
    if (e) e.preventDefault();
    const isCreate = drawerMode === "create";

    if (
      !currentCategoryForm.name?.trim() ||
      !currentCategoryForm.description?.trim()
    ) {
      showToast("Please fill Name and Description.", "error");
      return;
    }

    if (
      !isCreate &&
      currentCategoryForm.code &&
      !/^\d{3}$/.test(currentCategoryForm.code)
    ) {
      showToast("Category Code must be exactly 3 digits (e.g. 080).", "error");
      return;
    }

    try {
      if (isCreate) {
        const payload = {
          ...currentCategoryForm,
          parentCategoryId:
            currentCategoryForm.parentCategoryId ||
            (currentCategoryForm as any).parentId ||
            null,
        };
        if (!payload.code) delete payload.code;
        const res = await categoryApi.createCategory(payload as any);
        if (res.data?.success) {
          showToast("Category draft created successfully");
          setDrawerOpen(false);
          fetchCategories();
        }
      } else if (selectedCategory) {
        const payload = {
          ...currentCategoryForm,
          parentCategoryId:
            currentCategoryForm.parentCategoryId ||
            (currentCategoryForm as any).parentId ||
            null,
        };
        const res = await categoryApi.updateCategory(
          selectedCategory.id,
          payload,
        );
        if (res.data?.success) {
          showToast("Category updated successfully");
          fetchCategoryGovernance(selectedCategory.id);
          fetchCategories();
        }
      }
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || err?.message || "Operation failed",
        "error",
      );
    }
  };

  const handleSubmitForReview = async () => {
    if (!selectedCategory) return;
    try {
      setSubmittingReviewAction(true);
      const res = await categoryApi.submitCategoryReview(selectedCategory.id, {
        reviewerIds: selectedReviewerIds,
        comment: reviewComment,
      });
      if (res.data?.success) {
        showToast("Category submitted for review");
        fetchCategoryGovernance(selectedCategory.id);
        fetchCategories();
        setSubmitReviewOpen(false);
        setSelectedReviewerIds([]);
        setReviewComment("");
      }
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ||
          err?.message ||
          "Submit for review failed",
        "error",
      );
    } finally {
      setSubmittingReviewAction(false);
    }
  };

  const handleReviewDecision = async () => {
    if (!selectedCategory) return;
    try {
      setSubmittingReviewAction(true);
      const res = await categoryApi.reviewCategoryDecision(
        selectedCategory.id,
        {
          action: reviewDecision,
          comment: decisionComment,
        },
      );
      if (res.data?.success) {
        showToast(`Category review outcome recorded`);
        fetchCategoryGovernance(selectedCategory.id);
        fetchCategories();
        setReviewActionOpen(false);
        setDecisionComment("");
      }
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ||
          err?.message ||
          "Review decision failed",
        "error",
      );
    } finally {
      setSubmittingReviewAction(false);
    }
  };

  const handleCreateNewDraft = async (categoryId: string) => {
    try {
      const res = await categoryApi.createCategoryDraftVersion(categoryId);
      if (res.data?.success) {
        showToast("New category draft created (v1.1)");
        fetchCategoryGovernance(categoryId);
        fetchCategories();
      }
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || err?.message || "Create draft failed",
        "error",
      );
    }
  };

  const handleArchiveCategory = async (categoryId: string) => {
    try {
      const res = await categoryApi.archiveCategory(categoryId);
      if (res.data?.success) {
        showToast("Category archived");
        fetchCategoryGovernance(categoryId);
        fetchCategories();
      }
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || err?.message || "Archive failed",
        "error",
      );
    }
  };

  const handleRestoreCategory = async (categoryId: string) => {
    try {
      const res = await categoryApi.restoreCategory(categoryId);
      if (res.data?.success) {
        showToast("Category restored to Published");
        fetchCategoryGovernance(categoryId);
        fetchCategories();
      }
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || err?.message || "Restore failed",
        "error",
      );
    }
  };

  // Main AG Grid Columns
  const columnDefs: ColDef<Category>[] = useMemo(
    () => [
      {
        headerName: "Status State",
        field: "status",
        width: 150,
        cellRenderer: (params: any) => {
          const val = params.value || "PUBLISHED";
          const styles: Record<string, string> = {
            DRAFT: "text-amber-700 bg-amber-50 border-amber-200",
            IN_REVIEW: "text-blue-700 bg-blue-50 border-blue-200",
            APPROVED: "text-indigo-700 bg-indigo-50 border-indigo-200",
            PUBLISHED: "text-emerald-700 bg-emerald-50 border-emerald-200",
            ARCHIVED: "text-gray-700 bg-gray-50 border-gray-200",
          };
          return (
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${styles[val] || styles.PUBLISHED}`}
            >
              {val.replace("_", " ")}
            </span>
          );
        },
      },
      {
        headerName: "Version",
        field: "activeVersion",
        width: 110,
        cellRenderer: (params: any) => {
          const ver = params.value?.versionNumber || "1.0";
          return (
            <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              v{ver}
            </span>
          );
        },
      },
      {
        headerName: "Usage",
        field: "tenderCount",
        width: 130,
        cellRenderer: (params: any) => (
          <span className="text-xs font-semibold text-text-light bg-background px-2.5 py-1 rounded-full border border-border">
            {params.value || 0} Tenders
          </span>
        ),
      },
      {
        headerName: "Updated At",
        field: "updatedAt",
        width: 170,
        valueFormatter: ({ value }) =>
          value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "—",
      },
    ],
    [],
  );

  const getContextMenuItems = useCallback(
    (params: GetContextMenuItemsParams) => {
      const category = params.node?.data as Category;
      if (!category) return ["copy", "copyWithHeaders", "separator", "export"];

      return [
        {
          name: "View Category",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
          action: () => openDrawer("view", category, "general"),
        },
        {
          name: "Edit Category",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
          action: () => openDrawer("edit", category, "general"),
        },
        "separator",
        "copy",
        "copyWithHeaders",
        "separator",
        "export",
      ];
    },
    [openDrawer],
  );

  return (
    <div className="space-y-6">
      {/* Tab Contents: Stats Overview */}
      {activeTab === "stats" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 md:col-span-2">
            {[
              {
                title: "Total Categories",
                value: stats.total,
                color: "bg-blue-100 text-blue-600",
                icon: FolderKanban,
              },
              {
                title: "Active Categories",
                value: stats.active,
                color: "bg-green-100 text-green-600",
                icon: CheckCircle2,
              },
              {
                title: "Unused / Idle",
                value: stats.inactive,
                color: "bg-yellow-100 text-yellow-600",
                icon: XCircle,
              },
              {
                title: "Archived",
                value: stats.archived,
                color: "bg-red-100 text-red-600",
                icon: Trash2,
              },
              {
                title: "Tenders Active",
                value: stats.tendersCount,
                color: "bg-indigo-100 text-indigo-600",
                icon: FolderOpen,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
                    >
                      <Icon size={24} />
                    </div>
                  </div>
                  <p className="mt-5 text-sm text-text-light">{card.title}</p>
                  <h3 className="mt-1 text-3xl font-bold text-text">
                    {card.value}
                  </h3>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text border-b border-border pb-3">
              Category Health Distribution
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-text-light mb-1">
                  <span>Active Ratio</span>
                  <span>
                    {stats.total > 0
                      ? Math.round((stats.active / stats.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.active / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text">Top Categories</h3>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleTabChange("list")}
              >
                View AG Grid List
              </Button>
            </div>
            <div className="divide-y divide-border/30">
              {categories.slice(0, 5).map((cat) => (
                <div
                  key={cat.id}
                  className="py-2.5 flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-semibold text-text">{cat.name}</span>
                    <span className="text-xs text-text-light block font-mono">
                      {cat.code}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {cat.tenderCount || 0} Tenders
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents: List (AG Grid) */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <Toolbar gridRef={gridRef} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                leftIcon={RotateCw}
                onClick={handleRefreshList}
                disabled={refreshing || loading}
                className={`shrink-0 text-xs ${refreshing ? "opacity-75" : ""}`}
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button leftIcon={Plus} onClick={() => openDrawer("create")}>
                Create Category Draft
              </Button>
            </div>
          </div>

          <div
            id="categoriesGrid"
            className={`h-[600px] w-full rounded-[20px] border border-border bg-surface shadow-sm overflow-hidden ${themeClass}`}
          >
            <AgGridReactMemo
              theme={themeQuartz}
              ref={gridRef}
              rowData={categories}
              modules={CommunityModule}
              columnDefs={columnDefs as any}
              loading={loading}
              sideBar={{
                toolPanels: ["columns", "filters"],
                defaultToolPanel: "",
              }}
              getContextMenuItems={getContextMenuItems}
              treeData={true}
              treeDataParentIdField="parentId"
              getDataPath={(data) => {
                if (data.parentCategory?.name) {
                  return [data.parentCategory.name, data.name];
                }
                return [data.name];
              }}
              getRowId={(params) => params.data.id}
              autoGroupColumnDef={{
                headerName: "Category",
                minWidth: 350,
                cellRendererParams: {
                  suppressCount: true,
                  innerRenderer: (params: any) => {
                    const {data} = params;
                    const val = params.value || data?.name || "";
                    if (!data && !val) return null;

                    const isChild = Boolean(
                      data?.parentId ||
                        data?.parentCategoryId ||
                        data?.parentCategory,
                    );
                    const isRoot = !isChild;

                    return (
                      <div className="inline-flex items-center gap-2 py-0.5">
                        {isRoot ? (
                          <FolderKanban className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <FolderOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        )}
                        {data?.code && (
                          <span
                            className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border bg-primary/10 text-primary border-primary/20 font-bold`}
                          >
                            {data.code}
                          </span>
                        )}
                        <span
                          className={
                            isChild
                              ? "text-xs font-semibold text-text"
                              : "text-sm font-bold text-text"
                          }
                        >
                          {data?.name || val}
                        </span>
                      </div>
                    );
                  },
                },
              }}
              pagination
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
            />
          </div>
        </div>
      )}

      <CategoryFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        drawerMode={drawerMode}
        selectedCategory={selectedCategory}
        currentCategoryForm={currentCategoryForm}
        setCurrentCategoryForm={setCurrentCategoryForm}
        categories={categories}
        drawerTab={drawerTab}
        setDrawerTab={setDrawerTab}
        versions={versions}
        reviews={reviews}
        activities={activities}
        usageStats={usageStats}
        currentUserId={currentUser?.id}
        onSave={handleCreateOrUpdateCategory}
        onStartNewDraft={() =>
          selectedCategory && handleCreateNewDraft(selectedCategory.id)
        }
        onOpenSubmitReviewModal={() => {
          fetchAdminUsers();
          setSubmitReviewOpen(true);
        }}
        onOpenReviewActionModal={() => setReviewActionOpen(true)}
        onRefreshGovernance={(catId) => fetchCategoryGovernance(catId)}
      />

      <SubmitCategoryReviewModal
        isOpen={submitReviewOpen}
        onClose={() => setSubmitReviewOpen(false)}
        category={selectedCategory}
        assignableUsers={adminUsers}
        selectedReviewers={selectedReviewerIds}
        setSelectedReviewers={setSelectedReviewerIds}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        submitting={submittingReviewAction}
        onSendForReview={handleSubmitForReview}
        currentUserId={currentUser?.id}
      />

      <CategoryReviewDecisionModal
        isOpen={reviewActionOpen}
        onClose={() => setReviewActionOpen(false)}
        category={selectedCategory}
        assignableUsers={adminUsers}
        reviewDecision={reviewDecision}
        setReviewDecision={setReviewDecision}
        decisionComment={decisionComment}
        setDecisionComment={setDecisionComment}
        submitting={submittingReviewAction}
        onSubmitReview={handleReviewDecision}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-text-light">Loading Categories...</div>
      }
    >
      <CategoriesPageContent />
    </Suspense>
  );
}
