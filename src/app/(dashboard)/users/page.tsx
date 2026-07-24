//@ts-nocheck
"use client";

import {
  ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  UserCheck,
  UserMinus,
  UserX,
  Shield,
  Clock,
  ShieldAlert,
  CreditCard,
  Ban,
  Globe,
  Calendar,
  RotateCw,
  Download,
  Edit2,
  Eye,
  UserPlus,
  CheckCircle,
  ArrowRight,
  Key,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { authApi } from "@/features/auth/api/api";
import { useUserStats } from "@/features/auth/api/queries";
import {
  useBlockUser,
  useSuspendUser,
  useActivateUser,
  useArchiveUser,
  useResetPasswordAdmin,
  useSendUserVerification,
  useForcePasswordReset,
  useImpersonateUser,
  useUpdateUserDetail,
} from "@/features/auth/api/mutations";
import { useThemeStore } from "@/store/theme.store";
import { AgGridReact } from "ag-grid-react";
import {
  type ColDef,
  themeQuartz,
  GridOptions,
  AllCommunityModule,
} from "ag-grid-community";
import { Toolbar } from "@/components/ui/Toolbar";
import { UserApprovalModal } from "@/components/users/UserApprovalModal";
import type {
  ColGroupDef,
  GridReadyEvent,
  ICellRendererParams,
  SideBarDef,
} from "ag-grid-community";
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
} from "ag-grid-enterprise";
import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import dayjs from "dayjs";

interface UserListItem {
  id: string;
  name: string;
  email: string;
  accountType: "user" | "admin";
  companyName: string | null;
  country: {
    id: string;
    name: string;
    code: string;
  };
  emailVerified: boolean;
  isBlocked: boolean;
  status: string;
  requestedRoleId?: string;
  requestedDescription?: string;
  reviewerId?: string;
  submittedById?: string;
  createdAt: string;
  lastLoginAt: string | null;
  roles?: string[];
  subscriptions?: Array<{
    plan: {
      name: string;
    };
  }>;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  admins: number;
  customers: number;
  pendingVerification: number;
  pendingApprovalAdmins: number;
  subscribed: number;
  blocked: number;
  onlineNow: number;
  newToday: number;
  newThisMonth: number;
}

const AgGridReactMemo = memo(AgGridReact);

const CountryCellRenderer = (params: ICellRendererParams<UserListItem>) => {
  const u = params.data;
  if (!u) return null;
  const value = u.country.name;
  const code = u.country.code;
  if (value == null || value === "" || value === "(Select All)") {
    return <span className="truncate">{value || ""}</span>;
  }

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
      <img
        alt={`${value} flag`}
        width={15}
        height={10}
        src={`https://flags.fmcdn.net/data/flags/mini/${code.toLowerCase()}.png`}
      />
      <span className="truncate">{value}</span>
    </span>
  );
};

interface RowItem {
  country: string;
  language: string;
  name: string;
  game: {
    name: string;
    bought: boolean;
  };
  bankBalance: number;
  rating: number;
  totalWinnings: number;
  [month: string]: number | string | boolean | object | undefined;
  [key: `col${number}`]: string | number;
}

// const mobileDefaultCols: ColDef<RowItem>[] = [
//   {
//     rowDrag: true,
//     field: "name",
//     width: 200,
//     cellClass: "v-align",
//   },
//   // {
//   //   field: "language",
//   //   width: 150,
//   //   filter: "agSetColumnFilter",
//   //   cellEditor: "agRichSelectCellEditor",
//   //   cellClass: "v-align",
//   //   cellEditorParams: {
//   //     values: LANGUAGES,
//   //   },
//   // },
//   {
//     field: "country",
//     width: 150,
//     cellRenderer: CountryCellRenderer,
//     cellClass: "v-align",
//     cellEditor: "agRichSelectCellEditor",
//     cellEditorParams: {
//       cellRenderer: CountryCellRenderer,
//       // values: COUNTRY_NAMES,
//     },
//   },
//   {
//     field: "game.name",
//     width: 180,
//     cellEditor: "agRichSelectCellEditor",
//     cellEditorParams: {
//       values: [...games].sort(),
//     },
//     filter: "agSetColumnFilter",
//     cellClass: () => "alphabet",
//   },
//   {
//     field: "bankBalance",
//     width: 180,
//     cellClassRules: {
//       "currency-cell": 'typeof x == "number"',
//     },
//     enableValue: true,
//     cellDataType: "currency",
//     filter: "agNumberColumnFilter",
//   },
//   {
//     field: "totalWinnings",
//     filter: "agNumberColumnFilter",
//     width: 170,
//     enableValue: true,
//     cellClassRules: {
//       "currency-cell": 'typeof x == "number"',
//     },
//     cellStyle: currencyCssFunc,
//     cellDataType: "currency",
//   },
//   ...monthCols,
// ];

const getApprovalStatus = (user: UserListItem) => {
  if (user.approvedAt) return "Approved";
  if (
    user.status === "approved" ||
    user.status === "APPROVED" ||
    user.status === "active"
  )
    return "Approved";
  if (user.status === "pending_approval") return "Pending";
  if (user.status === "pending_review") return "Pending Review";
  if (user.status === "rejected" || user.status === "rejected_by_admin")
    return "Rejected";
  if (user.status === "pending_email_verification") return "Pending Email";
  return "Not Required";
};

const ApprovedStatusRenderer = (params: ICellRendererParams<UserListItem>) => {
  const u = params.data;
  if (!u) return null;
  const approvalStatus = getApprovalStatus(u);

  return (
    <div className="flex items-center h-full">
      {approvalStatus === "Approved" && (
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          Approved
        </span>
      )}
      {(approvalStatus === "Pending Approval" ||
        approvalStatus === "Pending") && (
        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          Pending Approval
        </span>
      )}
      {approvalStatus === "Pending Review" && (
        <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
          Pending Review
        </span>
      )}
      {approvalStatus === "Rejected" && (
        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          Rejected
        </span>
      )}
      {approvalStatus === "Pending Email" && (
        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          Pending Email
        </span>
      )}
      {approvalStatus === "Not Required" && (
        <span className="text-[11px] text-text-light">—</span>
      )}
    </div>
  );
};

enum UserStatus {
  PENDING_EMAIL_VERIFICATION = "pending_email_verification",
  PENDING_APPROVAL = "pending_approval",
  PENDING_REVIEW = "pending_review",
  ACTIVE = "active",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
  DEACTIVATED = "deactivated",
  ARCHIVED = "archived",
  BLOCKED = "BLOCKED",
  REJECTED_BY_ADMIN = "rejected_by_admin",
  APPROVED = "APPROVED",
}

const STATUS_STYLES: Record<UserStatus, { label: string; className: string }> =
  {
    [UserStatus.ACTIVE]: {
      label: "Active",
      className: "text-emerald-600 dark:text-emerald-400",
    },
    [UserStatus.PENDING_EMAIL_VERIFICATION]: {
      label: "Pending Email",
      className: "text-amber-600 dark:text-amber-400",
    },
    [UserStatus.PENDING_APPROVAL]: {
      label: "Pending Approval",
      className: "text-blue-600 dark:text-blue-400",
    },
    [UserStatus.PENDING_REVIEW]: {
      label: "Pending Review",
      className: "text-purple-600 dark:text-purple-400",
    },
    [UserStatus.SUSPENDED]: {
      label: "Suspended",
      className: "text-orange-600 dark:text-orange-400",
    },
    [UserStatus.BLOCKED]: {
      label: "Blocked",
      className: "text-rose-600 dark:text-rose-400",
    },
    [UserStatus.REJECTED]: {
      label: "Rejected",
      className: "text-rose-600 dark:text-rose-400",
    },
    [UserStatus.REJECTED_BY_ADMIN]: {
      label: "Rejected",
      className: "text-rose-600 dark:text-rose-400",
    },
    [UserStatus.DEACTIVATED]: {
      label: "Deactivated",
      className: "text-slate-600 dark:text-slate-400",
    },
    [UserStatus.ARCHIVED]: {
      label: "Archived",
      className: "text-slate-600 dark:text-slate-400",
    },
    [UserStatus.APPROVED]: {
      label: "Approved",
      className: "text-emerald-600 dark:text-emerald-400",
    },
  };

const ActionsRenderer = (params: any) => {
  const u = params.data;
  if (!u) return null;
  const router = params.router;
  const handleOpenEdit = params.handleOpenEdit;
  const setImpersonateUser = params.setImpersonateUser;
  const setSelectedUserForActions = params.setSelectedUserForActions;

  return (
    <div className="flex items-center justify-center gap-1 h-full">
      <button
        onClick={() => router.push(`/users/${u.id}`)}
        title="View Details"
        className="p-1 text-text-light hover:text-primary transition hover:scale-110 cursor-pointer"
      >
        <Eye size={14} />
      </button>

      <button
        onClick={() => handleOpenEdit(u)}
        title="Edit Details"
        className="p-1 text-text-light hover:text-primary transition hover:scale-110 cursor-pointer"
      >
        <Edit2 size={14} />
      </button>

      <button
        onClick={() => setImpersonateUser(u)}
        title="Impersonate"
        className="p-1 text-text-light hover:text-amber-500 transition hover:scale-110 cursor-pointer"
      >
        <UserPlus size={14} />
      </button>

      <button
        onClick={() => setSelectedUserForActions(u)}
        title="More Actions"
        className="p-1 text-text-light hover:text-text transition hover:scale-110 cursor-pointer font-bold text-[10px] flex items-center justify-center h-5 w-5"
      >
        •••
      </button>
    </div>
  );
};

const modules = [
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

const IS_SSR = typeof window === "undefined";

// const excelStyles: ExcelStyle[] = [
//   {
//     id: "v-align",
//     alignment: {
//       vertical: "Center",
//     },
//   },
//   {
//     id: "alphabet",
//     alignment: {
//       vertical: "Center",
//     },
//   },
//   {
//     id: "good-score",
//     alignment: {
//       horizontal: "Center",
//       vertical: "Center",
//     },
//     interior: {
//       color: "#C6EFCE",
//       pattern: "Solid",
//     },
//     numberFormat: {
//       format: "[$$-409]#,##0",
//     },
//   },
//   {
//     id: "bad-score",
//     alignment: {
//       horizontal: "Center",
//       vertical: "Center",
//     },
//     interior: {
//       color: "#FFC7CE",
//       pattern: "Solid",
//     },
//     numberFormat: {
//       format: "[$$-409]#,##0",
//     },
//   },
//   {
//     id: "header",
//     font: {
//       color: "#44546A",
//       size: 16,
//     },
//     interior: {
//       color: "#F2F2F2",
//       pattern: "Solid",
//     },
//     alignment: {
//       horizontal: "Center",
//       vertical: "Center",
//     },
//     borders: {
//       borderTop: {
//         lineStyle: "Continuous",
//         weight: 0,
//         color: "#8EA9DB",
//       },
//       borderRight: {
//         lineStyle: "Continuous",
//         weight: 0,
//         color: "#8EA9DB",
//       },
//       borderBottom: {
//         lineStyle: "Continuous",
//         weight: 0,
//         color: "#8EA9DB",
//       },
//       borderLeft: {
//         lineStyle: "Continuous",
//         weight: 0,
//         color: "#8EA9DB",
//       },
//     },
//   },
//   {
//     id: "currency-cell",
//     alignment: {
//       horizontal: "Center",
//       vertical: "Center",
//     },
//     numberFormat: {
//       format: "[$$-409]#,##0",
//     },
//   },
//   {
//     id: "boolean-type",
//     dataType: "Boolean",
//     alignment: {
//       vertical: "Center",
//     },
//   },
//   {
//     id: "country-cell",
//     alignment: {
//       indent: 4,
//     },
//   },
// ];

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
  rowSelection: {
    mode: "multiRow",
  },
  initialGroupOrderComparator: ({ nodeA, nodeB }) => {
    const aKey = nodeA.key || "";
    const bKey = nodeB.key || "";
    if (aKey < bKey) {
      return -1;
    }
    if (aKey > bKey) {
      return 1;
    }
    return 0;
  },
  enableRtl: IS_SSR ? false : /[?&]rtl=true/.test(window.location.search),
  pivotPanelShow: "always",
  enableCharts: true,
  undoRedoCellEditing: true,
  undoRedoCellEditingLimit: 50,
  rowNumbers: true,
  // excelStyles: excelStyles,
  enableFilterHandlers: true,
  rowDragManaged: true,
  rowDragMultiRow: true,
  pagination: true,
  paginationPageSize: 20,
  paginationPageSizeSelector: [10, 20, 50, 100],
  loadingOverlayComponent: () => (
    <div className="ag-overlay-loading-center" role="presentation">
      <div aria-live="polite" aria-atomic="true">
        Generating rows....
      </div>
    </div>
  ),
};

// AG Grid Cell Renderers
function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridRef = useRef<AgGridReact>(null as any);

  const currentTheme = useThemeStore((state) => state.theme);
  // Top-level main tabs: stats | list
  const [activeMainTab, setActiveMainTab] = useState<"stats" | "list">("stats");

  useEffect(() => {
    const view = searchParams.get("view");
    if (view === "list") {
      setActiveMainTab("list");
    } else {
      setActiveMainTab("stats");
    }
  }, [searchParams]);

  // Data State
  const [users, setUsers] = useState<UserListItem[]>([]);
  console.log(users);
  const [total, setTotal] = useState(0);
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useUserStats();
  const stats = (statsData as UserStats | undefined) || null;
  const [isLoading, setIsLoading] = useState(true);

  // Auth Mutation Hooks
  const blockUserMutation = useBlockUser();
  const suspendUserMutation = useSuspendUser();
  const activateUserMutation = useActivateUser();
  const archiveUserMutation = useArchiveUser();
  const resetPasswordAdminMutation = useResetPasswordAdmin();
  const sendUserVerificationMutation = useSendUserVerification();
  const forcePasswordResetMutation = useForcePasswordReset();
  const impersonateUserMutation = useImpersonateUser();
  const updateUserDetailMutation = useUpdateUserDetail();

  // Selected for Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // UI Modals
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [editUser, setEditUser] = useState<UserListItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    companyName: "",
    country: "",
  });
  const [impersonateUser, setImpersonateUser] = useState<UserListItem | null>(
    null,
  );
  const [impersonateReason, setImpersonateReason] = useState("");
  const [selectedUserForActions, setSelectedUserForActions] =
    useState<UserListItem | null>(null);
  console.log("selectedUserForActions", selectedUserForActions);
  const [userForApprovalModal, setUserForApprovalModal] =
    useState<UserListItem | null>(null);

  // Confirm actions
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Auto-clear Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({ message, type });
  };

  // Fetch users list
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const api = gridRef.current?.api;

      const currentPage = api?.paginationGetCurrentPage(); // 0-based
      const totalPages = api?.paginationGetTotalPages();
      const pageSize = api?.paginationGetPageSize();
      const rowCount = api?.getDisplayedRowCount();
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      // if (search) params.search = search;
      // if (country) params.country = country;
      // if (verified !== "all") params.verified = verified === "verified";

      // // Map tab parameters
      // if (activeTab === "customers") {
      //   params.accountType = "user";
      // } else if (activeTab === "admins") {
      //   params.accountType = "admin";
      // } else if (activeTab === "pending") {
      //   params.accountType = "admin";
      //   params.approvalStatus = "pending";
      // } else if (activeTab === "suspended") {
      //   params.status = "SUSPENDED";
      // }

      const res = await authApi.listUsers(params);
      setUsers(res.data.data);
      setTotal(res.data.meta?.total || res.data.data.length);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to fetch users list",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // setPage(1);
    fetchUsers();
  };

  const handleRefresh = () => {
    refetchStats();
    fetchUsers();
    showToast("User list refreshed", "info");
  };

  // Actions
  const handleToggleBlock = (user: UserListItem) => {
    const nextBlocked = !user.isBlocked;
    setConfirmAction({
      title: nextBlocked ? "Block User Account" : "Unblock User Account",
      message: `Are you sure you want to ${nextBlocked ? "block" : "unblock"} the account of "${user.name}"?`,
      onConfirm: async () => {
        try {
          await blockUserMutation.mutateAsync({
            id: user.id,
            isBlocked: nextBlocked,
          });
          showToast(
            `Account for ${user.name} is now ${nextBlocked ? "blocked" : "active"}`,
            "success",
          );
          fetchUsers();
          refetchStats();
        } catch (err: any) {
          showToast(err.response?.data?.message || "Action failed", "error");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleToggleSuspend = (user: UserListItem) => {
    const isSuspended = user.status === "suspended";
    setConfirmAction({
      title: isSuspended ? "Activate User" : "Suspend User",
      message: `Are you sure you want to ${isSuspended ? "activate" : "suspend"} "${user.name}"?`,
      onConfirm: async () => {
        try {
          if (isSuspended) {
            await activateUserMutation.mutateAsync(user.id);
            showToast(`User ${user.name} activated successfully`, "success");
          } else {
            await suspendUserMutation.mutateAsync(user.id);
            showToast(`User ${user.name} suspended successfully`, "success");
          }
          fetchUsers();
          refetchStats();
        } catch (err: any) {
          showToast(err.response?.data?.message || "Action failed", "error");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleArchive = (user: UserListItem) => {
    setConfirmAction({
      title: "Archive User Account",
      message: `Are you sure you want to archive "${user.name}"? This will restrict login and mark the user as archived.`,
      onConfirm: async () => {
        try {
          await archiveUserMutation.mutateAsync(user.id);
          showToast(`User ${user.name} archived successfully`, "success");
          fetchUsers();
          refetchStats();
        } catch (err: any) {
          showToast(err.response?.data?.message || "Action failed", "error");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleSendResetPassword = (user: UserListItem) => {
    setConfirmAction({
      title: "Send Password Reset Link",
      message: `Send an email verification reset token link to "${user.email}"?`,
      onConfirm: async () => {
        try {
          await resetPasswordAdminMutation.mutateAsync(user.id);
          showToast(`Password reset link sent to ${user.email}`, "success");
        } catch (err: any) {
          showToast(
            err.response?.data?.message || "Failed to send reset link",
            "error",
          );
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleSendVerification = (user: UserListItem) => {
    setConfirmAction({
      title: "Resend Verification Email",
      message: `Resend account email verification link to "${user.email}"?`,
      onConfirm: async () => {
        try {
          await sendUserVerificationMutation.mutateAsync(user.id);
          showToast(`Verification link sent to ${user.email}`, "success");
        } catch (err: any) {
          showToast(
            err.response?.data?.message || "Failed to send verification",
            "error",
          );
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleApproveUser = (user: UserListItem) => {
    setUserForApprovalModal(user);
  };

  const handleForcePasswordReset = (user: UserListItem) => {
    setConfirmAction({
      title: "Force Password Change",
      message: `Force "${user.name}" to change their password on their next login attempt?`,
      onConfirm: async () => {
        try {
          await forcePasswordResetMutation.mutateAsync(user.id);
          showToast(
            `Forced password reset flag set for ${user.name}`,
            "success",
          );
        } catch (err: any) {
          showToast(err.response?.data?.message || "Action failed", "error");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  // Impersonate
  const executeImpersonation = async () => {
    if (!impersonateUser || !impersonateReason.trim()) return;
    try {
      const res = await impersonateUserMutation.mutateAsync({
        id: impersonateUser.id,
        input: { reason: impersonateReason },
      });
      const { token } = res.data.data;

      // Store impersonation metadata locally
      localStorage.setItem(
        "impersonatedUser",
        JSON.stringify({
          id: impersonateUser.id,
          name: impersonateUser.name,
          email: impersonateUser.email,
        }),
      );
      localStorage.setItem("impersonatedToken", token);

      // Dispatch event to trigger banner
      window.dispatchEvent(new Event("impersonationChange"));

      showToast(
        `Impersonation session established for ${impersonateUser.name}!`,
        "success",
      );
      setImpersonateUser(null);
      setImpersonateReason("");

      // Refresh to update banner locally, or wait 1.5s
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to initiate impersonation",
        "error",
      );
    }
  };

  // Edit details
  const handleOpenEdit = (user: UserListItem) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      companyName: user.companyName || "",
      country: user.country?.code || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      await updateUserDetailMutation.mutateAsync({
        id: editUser.id,
        input: editForm,
      });
      showToast("User details updated successfully", "success");
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to update details",
        "error",
      );
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    // if (users.length === 0) return;
    // const headers = ["ID", "Name", "Email", "AccountType", "Company", "Country", "Verified", "Blocked", "Status", "Created At"];
    // const rows = users.map(u => [
    //   u.id, u.name, u.email, u.accountType, u.companyName || "", u.country?.name || "",
    //   u.emailVerified ? "Yes" : "No", u.isBlocked ? "Yes" : "No", u.status, u.createdAt
    // ]);
    // const csvContent = "data:text/csv;charset=utf-8,"
    //   + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    // const encodedUri = encodeURI(csvContent);
    // const link = document.createElement("a");
    // link.setAttribute("href", encodedUri);
    // link.setAttribute("download", `nexusbid_users_export_${activeTab}.csv`);
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // showToast("CSV Export triggered", "success");
  };

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(users.map((u) => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const handleBulkStatus = async (
    status: "active" | "suspended" | "archived",
  ) => {
    if (selectedIds.size === 0) return;
    setConfirmAction({
      title: `Bulk Change to ${status.toUpperCase()}`,
      message: `Apply status update "${status}" to the ${selectedIds.size} selected user accounts?`,
      onConfirm: async () => {
        try {
          // Call sequential API updates
          for (const id of Array.from(selectedIds)) {
            if (status === "suspended") {
              await suspendUserMutation.mutateAsync(id);
            } else if (status === "active") {
              await activateUserMutation.mutateAsync(id);
            } else if (status === "archived") {
              await archiveUserMutation.mutateAsync(id);
            }
          }
          showToast(
            `Successfully processed bulk action for ${selectedIds.size} users`,
            "success",
          );
          setSelectedIds(new Set());
          fetchUsers();
          refetchStats();
        } catch (err: any) {
          showToast(
            err.response?.data?.message || "Failed during bulk action updates",
            "error",
          );
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const desktopDefaultCols: (ColDef<RowItem> | ColGroupDef<RowItem>)[] = [
    {
      rowDrag: true,
      field: "name",
      width: 200,
      enableRowGroup: true,
      cellClass: "v-align",
    },
    {
      field: "email",
      width: 200,
      enableRowGroup: true,
      cellClass: "v-align",
    },
    {
      field: "country",
      width: 150,
      cellRenderer: CountryCellRenderer,
      cellClass: ["country-cell", "v-align"],
      enableRowGroup: true,
      enablePivot: true,
      cellEditor: "agRichSelectCellEditor",
      cellEditorParams: {
        cellRenderer: CountryCellRenderer,
      },
      filter: "agSetColumnFilter",
      filterParams: {
        cellRenderer: CountryCellRenderer,
        buttons: ["reset"],
      },
    },
    {
      field: "accountType",
      headerName: "Account Type",
      width: 200,
      enableRowGroup: true,
      cellClass: "v-align",
    },
    {
      field: "role",
      headerName: "Role",
      width: 200,
      enableRowGroup: true,
      cellClass: "v-align",
      valueFormatter: (params) => {
        if (params.data) {
          if (params.data.accountType === "admin") {
            return params.data.roles;
          }
          return "—";
        }
        return params.value;
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      enableRowGroup: true,
      cellClass: "v-align",
      cellRenderer: ApprovedStatusRenderer,
    },
    {
      field: "emailVerified",
      headerName: "Email Verified",
      width: 200,
      enableRowGroup: true,
      cellClass: "v-align",
      cellRenderer: (params: { value: boolean }) => {
        const value = params.value;
        return value ? (
          <span className="inline-flex items-center gap-1 text-green-600">
            <CheckCircle2 size={16} />
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-600">
            <XCircle size={16} />
          </span>
        );
      },
    },
    {
      field: "status",
      headerName: "Account Status",
      width: 200,
      enableRowGroup: true,
      cellClass: "v-align",
      cellRenderer: ({ value }: { value: UserStatus }) => {
        if (!value) return "-";
        const status = STATUS_STYLES[value];

        return (
          <span
            className={`inline-flex items-center text-xs font-semibold ${status?.className ?? ""}`}
          >
            {status?.label ?? "-"}
          </span>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created Date",
      width: 200,
      enableRowGroup: true,
      cellClass: "v-align",
      type: "date",
    },
    {
      field: "lastLoginAt",
      headerName: "Last Login",
      width: 200,
      enableRowGroup: true,
      cellClass: "v-align",
      type: "date",
    },
    {
      headerName: "Actions",
      cellRenderer: ActionsRenderer,
      cellRendererParams: {
        router,
        handleOpenEdit,
        setImpersonateUser,
        setSelectedUserForActions,
      },
      width: 120,
      minWidth: 120,
      pinned: "right" as const,
      resizable: false,
      sortable: false,
      filter: false,
      suppressMovable: true,
    },
  ];

  // const smallDefaultCols = mobileDefaultCols;
  const largeDefaultCols = desktopDefaultCols;
  // const smallColCount = smallDefaultCols.length;
  // const largeColCount = 22;
  const darkMode = currentTheme === "dark";
  const themeClass = darkMode ? `ag-theme-quartz-dark` : `ag-theme-quartz`;

  const [isSmall] = useState(() =>
    IS_SSR
      ? false
      : document.documentElement.clientHeight <= 415 ||
        document.documentElement.clientWidth < 768,
  );
  // const loadInstance = useRef(0);
  // const dataIntervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  // const dataTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  // const dataSizeTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  // const [base64Flags, setBase64Flags] = useState<Record<string, string>>();
  // const [defaultCols, setDefaultCols] = useState<(ColDef | ColGroupDef)[]>();
  // const [defaultColCount, setDefaultColCount] = useState<number>(0);
  // const [columnDefs, setColumnDefs] = useState<(ColDef | ColGroupDef)[]>();
  // const [rowData, setRowData] = useState<unknown[]>();
  // const [dataSize, setDataSize] = useState<string>();

  const defaultColDef = useMemo<ColDef>(
    () => ({
      minWidth: 50,
      editable: true,
      filter: true,
      floatingFilter: !isSmall,
      enableCellChangeFlash: true,
    }),
    [isSmall],
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

  const onGridReady = useCallback((event: GridReadyEvent) => {
    if (!IS_SSR && document.documentElement.clientWidth <= 1024) {
      event.api.closeToolPanel();
    }
  }, []);

  // const createData = (newDataSize: string) => {
  //   loadInstance.current += 1;
  //   const loadInstanceCopy = loadInstance.current;
  //   const startTime = Date.now();

  //   if (dataIntervalId.current) {
  //     clearInterval(dataIntervalId.current);
  //     dataIntervalId.current = null;
  //   }
  //   if (dataTimeoutId.current) {
  //     clearTimeout(dataTimeoutId.current);
  //     dataTimeoutId.current = null;
  //   }

  //   const colCount = parseInt(newDataSize?.split("x")[1] ?? "0", 10);
  //   const rowCount = parseFloat(newDataSize?.split("x")[0] ?? "0");
  //   const colDefs = createCols(colCount);

  //   let row = 0;
  //   const data: unknown[] = [];
  //   const loopCount = rowCount > 10000 ? 10000 : 1000;

  //   dataIntervalId.current = window.setInterval(() => {
  //     if (loadInstanceCopy !== loadInstance.current) {
  //       if (dataIntervalId.current) {
  //         clearInterval(dataIntervalId.current);
  //         dataIntervalId.current = null;
  //       }
  //       return;
  //     }

  //     for (let i = 0; i < loopCount; i += 1) {
  //       if (row < rowCount) {
  //         const rowItem = createRowItem(
  //           row,
  //           colCount,
  //           defaultCols?.length ?? 0,
  //           defaultColCount,
  //         );
  //         data.push(rowItem);
  //         row += 1;
  //       } else {
  //         break;
  //       }
  //     }

  //     if (row >= rowCount) {
  //       const elapsedTime = Date.now() - startTime;
  //       const minDisplayTime = 500;
  //       const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

  //       dataTimeoutId.current = window.setTimeout(() => {
  //         setIsLoading(false);
  //         setColumnDefs(colDefs);
  //         setRowData(data);
  //       }, remainingTime);

  //       if (dataIntervalId.current) {
  //         clearInterval(dataIntervalId.current);
  //         dataIntervalId.current = null;
  //       }
  //     }
  //   }, 0);
  // };

  // useEffect(() => {
  //   const newDefaultCols = isSmall ? smallDefaultCols : largeDefaultCols;
  //   const newDefaultColCount = isSmall ? smallColCount : largeColCount;

  //   setDefaultCols(newDefaultCols);
  //   setDefaultColCount(newDefaultColCount);

  //   const newRowsCols: [number, number][] = [
  //     [100, newDefaultColCount],
  //     [1_000, newDefaultColCount],
  //   ];

  //   if (!isSmall) {
  //     newRowsCols.push(
  //       [10_000, 100],
  //       [50_000, newDefaultColCount],
  //       [100_000, newDefaultColCount],
  //     );
  //   }

  //   setDataSize(createDataSizeValue(newRowsCols[1][0], newRowsCols[1][1]));
  // }, [isSmall]);

  // useEffect(() => {
  //   let isMounted = true;
  //   const controller = new AbortController();
  //   const flags: Record<string, string> = {};

  //   const loadFlags = async () => {
  //     try {
  //       const promiseArray = countries.map(async (country) => {
  //         const countryCode = COUNTRY_CODES[country.country];

  //         const response = await fetch(
  //           `https://flagcdn.com/w20/${countryCode}.png`,
  //           { signal: controller.signal },
  //         );
  //         const blob = await response.blob();
  //         return await new Promise((resolve) => {
  //           const reader = new FileReader();
  //           reader.onloadend = () => {
  //             flags[countryCode] = String(reader.result);
  //             resolve(reader.result);
  //           };
  //           reader.readAsDataURL(blob);
  //         });
  //       });

  //       await Promise.all(promiseArray);
  //       if (isMounted) {
  //         setBase64Flags(flags);
  //       }
  //     } catch (error) {
  //       if (controller.signal.aborted) {
  //         return;
  //       }
  //       void error;
  //       // Leave flags unset on fetch failures.
  //     }
  //   };

  //   loadFlags();

  //   return () => {
  //     isMounted = false;
  //     controller.abort();
  //   };
  // }, []);

  // const createCols = (colCount: number) => {
  //   // start with a copy of the default cols
  //   const columns: (ColDef | ColGroupDef)[] =
  //     defaultCols?.slice(0, colCount) ?? [];

  //   // Group extra columns by their group name
  //   const groups = new Map<string, ColDef[]>();
  //   for (let col = defaultColCount; col < colCount; col += 1) {
  //     const extraColIndex = col - defaultColCount;
  //     const colConfig = extraColumns[extraColIndex % extraColumns.length];
  //     const colDef: ColDef = {
  //       headerName: colConfig.headerName,
  //       field: `col${col}`,
  //       width: 150,
  //       editable: true,
  //     };
  //     switch (colConfig.dataType) {
  //       case "currency":
  //         colDef.cellDataType = "currency";
  //         colDef.filter = "agNumberColumnFilter";
  //         colDef.width = 160;
  //         break;
  //       case "percent":
  //         colDef.filter = "agNumberColumnFilter";
  //         colDef.valueFormatter = (params) =>
  //           params.value != null ? `${params.value.toFixed(1)}%` : "";
  //         colDef.width = 130;
  //         break;
  //       case "rating":
  //         colDef.filter = "agNumberColumnFilter";
  //         colDef.width = 120;
  //         break;
  //       case "text":
  //         colDef.filter = "agSetColumnFilter";
  //         colDef.width = 160;
  //         break;
  //       case "number":
  //       default:
  //         colDef.filter = "agNumberColumnFilter";
  //         colDef.width = 140;
  //         break;
  //     }
  //     const group = colConfig.group;
  //     if (!groups.has(group)) {
  //       groups.set(group, []);
  //     }
  //     groups.get(group)!.push(colDef);
  //   }

  //   for (const [groupName, children] of groups) {
  //     columns.push({
  //       headerName: groupName,
  //       children,
  //     });
  //   }

  //   return columns;
  // };

  // const createDataRef = useRef(createData);
  // createDataRef.current = createData;

  // useEffect(() => {
  //   if (dataSize) {
  //     setIsLoading(true);
  //     if (dataSizeTimeoutId.current) {
  //       clearTimeout(dataSizeTimeoutId.current);
  //     }
  //     dataSizeTimeoutId.current = window.setTimeout(() => {
  //       createDataRef.current(dataSize);
  //     }, 10);
  //   }
  //   return () => {
  //     if (dataSizeTimeoutId.current) {
  //       clearTimeout(dataSizeTimeoutId.current);
  //       dataSizeTimeoutId.current = null;
  //     }
  //   };
  // }, [dataSize]);

  // useEffect(() => {
  //   return () => {
  //     loadInstance.current += 1;
  //     if (dataIntervalId.current) {
  //       clearInterval(dataIntervalId.current);
  //       dataIntervalId.current = null;
  //     }
  //     if (dataTimeoutId.current) {
  //       clearTimeout(dataTimeoutId.current);
  //       dataTimeoutId.current = null;
  //     }
  //     if (dataSizeTimeoutId.current) {
  //       clearTimeout(dataSizeTimeoutId.current);
  //       dataSizeTimeoutId.current = null;
  //     }
  //   };
  // }, []);

  console.log("userForApprovalModal", userForApprovalModal);

  return (
    <div className="space-y-6">
      {/* Conditionally Render Active Main Tab */}
      <div className="animate-fade-in">
        {/* Tab 1: Stats & Overview */}
        {activeMainTab === "stats" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-surface text-xs font-semibold hover:bg-background transition cursor-pointer shadow-xs"
              >
                <RotateCw size={14} />
                Refresh Directory Data
              </button>
              <button
                onClick={exportToCSV}
                // disabled={users.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-surface text-xs font-semibold hover:bg-background disabled:opacity-50 transition cursor-pointer shadow-xs"
              >
                <Download size={14} />
                Export CSV Report
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[
                {
                  title: "Total Users",
                  val: stats?.total,
                  icon: Users,
                  col: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20",
                },
                {
                  title: "Active Accounts",
                  val: stats?.active,
                  icon: UserCheck,
                  col: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
                },
                {
                  title: "Inactive Accounts",
                  val: stats?.inactive,
                  icon: UserMinus,
                  col: "text-gray-400 bg-gray-50 dark:bg-gray-950/20",
                },
                {
                  title: "Suspended",
                  val: stats?.suspended,
                  icon: UserX,
                  col: "text-amber-500 bg-amber-50 dark:bg-amber-950/20",
                },
                {
                  title: "Administrators",
                  val: stats?.admins,
                  icon: Shield,
                  col: "text-purple-500 bg-purple-50 dark:bg-purple-950/20",
                },
                {
                  title: "Customers",
                  val: stats?.customers,
                  icon: Users,
                  col: "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
                },
                {
                  title: "Pending Verification",
                  val: stats?.pendingVerification,
                  icon: Clock,
                  col: "text-amber-500 bg-amber-50 dark:bg-amber-950/20",
                },
                {
                  title: "Pending Approval (Admins)",
                  val: stats?.pendingApprovalAdmins,
                  icon: ShieldAlert,
                  col: "text-rose-500 bg-rose-50 dark:bg-rose-950/20",
                },
                {
                  title: "Subscribed",
                  val: stats?.subscribed,
                  icon: CreditCard,
                  col: "text-teal-500 bg-teal-50 dark:bg-teal-950/20",
                },
                {
                  title: "Blocked Accounts",
                  val: stats?.blocked,
                  icon: Ban,
                  col: "text-rose-600 bg-rose-50 dark:bg-rose-950/20",
                },
                {
                  title: "Online Now",
                  val: stats?.onlineNow,
                  icon: Globe,
                  col: "text-sky-500 bg-sky-50 dark:bg-sky-950/20",
                },
                {
                  title: "New Today",
                  val: stats?.newToday,
                  icon: Clock,
                  col: "text-orange-500 bg-orange-50 dark:bg-orange-950/20",
                },
                {
                  title: "New This Month",
                  val: stats?.newThisMonth,
                  icon: Calendar,
                  col: "text-pink-500 bg-pink-50 dark:bg-pink-950/20",
                },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-light">
                        {card.title}
                      </span>
                      <div className={`p-2 rounded-xl ${card.col}`}>
                        <Icon size={16} />
                      </div>
                    </div>
                    <div className="mt-3">
                      {statsLoading ? (
                        <div className="h-8 w-16 bg-border animate-pulse rounded-md" />
                      ) : (
                        <h3 className="text-3xl font-bold tracking-tight">
                          {card.val ?? 0}
                        </h3>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: User List */}
        {activeMainTab === "list" && (
          <div className="space-y-6">
            <div className="relative flex h-dvh min-h-[calc(100dvh-var(--layout-grid-header-height))] w-full flex-col">
              <div className="flex items-center justify-between gap-4 pb-2 shrink-0">
                <div className="flex-1 min-w-0">
                  <Toolbar gridRef={gridRef} />
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-surface text-xs font-semibold hover:bg-background disabled:opacity-50 transition cursor-pointer shadow-xs shrink-0"
                >
                  <RotateCw
                    size={14}
                    className={isLoading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>

              {/* Table Area */}
              <section className="flex flex-1 overflow-hidden">
                <div
                  id="myGrid"
                  className={`flex-1 overflow-hidden h-full rounded-[20px] border border-slate-900/10 bg-white/70 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${themeClass}`}
                >
                  <AgGridReactMemo
                    theme={themeQuartz}
                    ref={gridRef}
                    rowData={users}
                    // columnDefs={columnDefs}
                    modules={modules}
                    gridOptions={staticGridOptions}
                    columnDefs={largeDefaultCols as any}
                    // rowData={rowData}
                    loading={isLoading}
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
        )}
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">Edit User Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-text-light block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-light block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-light block mb-1">
                  Company Name
                </label>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-light block mb-1">
                  Country (2-Letter ISO Code)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={editForm.country}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      country: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-background cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Impersonation Modal */}
      {impersonateUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-amber-500">
              <ShieldAlert size={22} />
              <h3 className="text-lg font-bold text-text">
                Initialize Impersonation
              </h3>
            </div>
            <p className="text-xs text-text-light leading-relaxed">
              Impersonating <strong>{impersonateUser.name}</strong> will
              authenticate your session as this user. This action is strictly
              audited under your administrator account.
            </p>
            <div>
              <label className="text-xs font-bold text-text block mb-1">
                Reason for Impersonation
              </label>
              <textarea
                value={impersonateReason}
                onChange={(e) => setImpersonateReason(e.target.value)}
                placeholder="e.g. Debugging purchase failure report #1093"
                className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none h-20 resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => {
                  setImpersonateUser(null);
                  setImpersonateReason("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-background cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeImpersonation}
                disabled={!impersonateReason.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight size={13} />
                Establish Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions Modal */}
      {selectedUserForActions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-text">
                  Account Management
                </h3>
                <p className="text-xs text-text-light mt-0.5">
                  Admin actions for{" "}
                  <span className="font-semibold text-text">
                    {selectedUserForActions.name}
                  </span>{" "}
                  ({selectedUserForActions.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForActions(null)}
                className="text-text-light hover:text-text text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {selectedUserForActions.emailVerified &&
                (selectedUserForActions.status === "pending_approval" ||
                  selectedUserForActions.status === "pending_review" ||
                  selectedUserForActions.status ===
                    "pending_email_verification") && (
                  <button
                    onClick={() => {
                      handleApproveUser(selectedUserForActions);
                      setSelectedUserForActions(null);
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition text-left cursor-pointer sm:col-span-2"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-emerald-700 dark:text-emerald-300">
                        {selectedUserForActions.status === "pending_review"
                          ? "Review & Evaluate Approval"
                          : "Approve User Account"}
                      </span>
                      <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                        {selectedUserForActions.status === "pending_review"
                          ? "Evaluate Maker-Checker approval request details and decide"
                          : "Authorize pending registration and assign roles"}
                      </span>
                    </div>
                  </button>
                )}

              <button
                onClick={() => {
                  handleSendResetPassword(selectedUserForActions);
                  setSelectedUserForActions(null);
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50 hover:bg-background transition text-left cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Key size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs block">
                    Reset Password
                  </span>
                  <span className="text-[10px] text-text-light">
                    Send password reset link
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  handleSendVerification(selectedUserForActions);
                  setSelectedUserForActions(null);
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50 hover:bg-background transition text-left cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs block">
                    Send Verification
                  </span>
                  <span className="text-[10px] text-text-light">
                    Resend verification link
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  handleForcePasswordReset(selectedUserForActions);
                  setSelectedUserForActions(null);
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50 hover:bg-background transition text-left cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs block">Force Reset</span>
                  <span className="text-[10px] text-text-light">
                    Force reset on next login
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  handleToggleBlock(selectedUserForActions);
                  setSelectedUserForActions(null);
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50 hover:bg-background transition text-left cursor-pointer"
              >
                <div
                  className={`p-2 rounded-lg ${selectedUserForActions.isBlocked ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                >
                  <Ban size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs block">
                    {selectedUserForActions.isBlocked
                      ? "Unblock Account"
                      : "Block Account"}
                  </span>
                  <span className="text-[10px] text-text-light">
                    {selectedUserForActions.isBlocked
                      ? "Restore login privileges"
                      : "Restrict all login access"}
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  handleToggleSuspend(selectedUserForActions);
                  setSelectedUserForActions(null);
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50 hover:bg-background transition text-left cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <UserMinus size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs block">
                    {selectedUserForActions.status === "suspended"
                      ? "Unsuspend User"
                      : "Suspend User"}
                  </span>
                  <span className="text-[10px] text-text-light">
                    {selectedUserForActions.status === "suspended"
                      ? "Activate account status"
                      : "Temporarily freeze account"}
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  handleArchive(selectedUserForActions);
                  setSelectedUserForActions(null);
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50 hover:bg-background transition text-left cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-gray-500/10 text-gray-500">
                  <Download size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs block">
                    Archive Account
                  </span>
                  <span className="text-[10px] text-text-light">
                    Archive & restrict login
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-border">
              <button
                onClick={() => setSelectedUserForActions(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-background cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-text">
              {confirmAction.title}
            </h3>
            <p className="text-sm text-text-light leading-relaxed">
              {confirmAction.message}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-background cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maker-Checker User Approval Modal */}
      <UserApprovalModal
        isOpen={Boolean(userForApprovalModal)}
        user={userForApprovalModal}
        onClose={() => setUserForApprovalModal(null)}
        onSuccess={() => {
          fetchUsers();
          refetchStats();
        }}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-gray-950 text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-white/10 max-w-sm animate-slide-up">
          <div
            className={`p-2 rounded-xl bg-white/10 ${toast.type === "error" ? "text-red-400" : toast.type === "success" ? "text-green-400" : "text-sky-400"}`}
          >
            <ShieldAlert size={18} />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider">
              {toast.type === "error"
                ? "Action Failed"
                : toast.type === "success"
                  ? "Completed"
                  : "Notification"}
            </span>
            <span className="text-xs text-white/90 leading-normal font-semibold">
              {toast.message}
            </span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-white/40 hover:text-white/80 text-sm ml-2 self-start p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-text-light">Loading User Directory...</div>}>
      <UsersPageContent />
    </Suspense>
  );
}
