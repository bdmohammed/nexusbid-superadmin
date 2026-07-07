"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, UserCheck, ShieldCheck, UserX, Search, Filter, 
  RotateCw, Download, Edit2, Key, Eye, UserMinus, 
  Ban, ShieldAlert, CheckCircle, Clock, Globe, ArrowRight, UserPlus
} from "lucide-react";
import { apiClient } from "@/lib/http";
import { useCountries } from "@/features/state/api/queries";

interface UserListItem {
  id: string;
  name: string;
  email: string;
  accountType: 'user' | 'admin';
  companyName: string | null;
  country: string | null;
  emailVerified: boolean;
  isBlocked: boolean;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  userRoles?: Array<{
    role: {
      name?: string;
      slug: string;
      activeVersion?: {
        name: string;
      };
    };
  }>;
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

export default function UsersPage() {
  const router = useRouter();
  const { data: countriesList = [] } = useCountries();
  
  // Tabs: customers | admins | pending | suspended
  const [activeTab, setActiveTab] = useState<'customers' | 'admins' | 'pending' | 'suspended'>('customers');
  
  // Data State
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [verified, setVerified] = useState("all");
  const [planId, setPlanId] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selected for Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // UI Modals
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [editUser, setEditUser] = useState<UserListItem | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", companyName: "", country: "" });
  const [impersonateUser, setImpersonateUser] = useState<UserListItem | null>(null);
  const [impersonateReason, setImpersonateReason] = useState("");
  
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

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  // Fetch metrics & stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await apiClient.get("/admin/users/stats");
      setStats(res.data.data);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to load user metrics", "error");
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch users list
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
      };

      if (search) params.search = search;
      if (country) params.country = country;
      if (verified !== "all") params.verified = verified === "verified";

      // Map tab parameters
      if (activeTab === "customers") {
        params.accountType = "user";
      } else if (activeTab === "admins") {
        params.accountType = "admin";
      } else if (activeTab === "pending") {
        params.accountType = "admin";
        params.approvalStatus = "pending";
      } else if (activeTab === "suspended") {
        params.status = "SUSPENDED";
      }

      const res = await apiClient.get("/admin/users", { params });
      setUsers(res.data.data);
      setTotal(res.data.meta?.total || res.data.data.length);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to fetch users list", "error");
    } finally {
      setLoading(false);
    }
  };

  // Trigger loading on filter changes
  useEffect(() => {
    fetchUsers();
  }, [activeTab, page, country, verified, planId]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRefresh = () => {
    fetchStats();
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
          await apiClient.patch(`/admin/users/${user.id}/block`, { isBlocked: nextBlocked });
          showToast(`Account for ${user.name} is now ${nextBlocked ? "blocked" : "active"}`, "success");
          fetchUsers();
          fetchStats();
        } catch (err: any) {
          showToast(err.response?.data?.message || "Action failed", "error");
        } finally {
          setConfirmAction(null);
        }
      }
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
            await apiClient.post(`/admin/users/${user.id}/activate`);
            showToast(`User ${user.name} activated successfully`, "success");
          } else {
            await apiClient.post(`/admin/users/${user.id}/suspend`);
            showToast(`User ${user.name} suspended successfully`, "success");
          }
          fetchUsers();
          fetchStats();
        } catch (err: any) {
          showToast(err.response?.data?.message || "Action failed", "error");
        } finally {
          setConfirmAction(null);
        }
      }
    });
  };

  const handleArchive = (user: UserListItem) => {
    setConfirmAction({
      title: "Archive User Account",
      message: `Are you sure you want to archive "${user.name}"? This will restrict login and mark the user as archived.`,
      onConfirm: async () => {
        try {
          await apiClient.post(`/admin/users/${user.id}/archive`);
          showToast(`User ${user.name} archived successfully`, "success");
          fetchUsers();
          fetchStats();
        } catch (err: any) {
          showToast(err.response?.data?.message || "Action failed", "error");
        } finally {
          setConfirmAction(null);
        }
      }
    });
  };

  const handleSendResetPassword = (user: UserListItem) => {
    setConfirmAction({
      title: "Send Password Reset Link",
      message: `Send an email verification reset token link to "${user.email}"?`,
      onConfirm: async () => {
        try {
          await apiClient.post(`/admin/users/${user.id}/reset-password`);
          showToast(`Password reset link sent to ${user.email}`, "success");
        } catch (err: any) {
          showToast(err.response?.data?.message || "Failed to send reset link", "error");
        } finally {
          setConfirmAction(null);
        }
      }
    });
  };

  const handleSendVerification = (user: UserListItem) => {
    setConfirmAction({
      title: "Resend Verification Email",
      message: `Resend account email verification link to "${user.email}"?`,
      onConfirm: async () => {
        try {
          await apiClient.post(`/admin/users/${user.id}/send-verification`);
          showToast(`Verification link sent to ${user.email}`, "success");
        } catch (err: any) {
          showToast(err.response?.data?.message || "Failed to send verification", "error");
        } finally {
          setConfirmAction(null);
        }
      }
    });
  };

  const handleForcePasswordReset = (user: UserListItem) => {
    setConfirmAction({
      title: "Force Password Change",
      message: `Force "${user.name}" to change their password on their next login attempt?`,
      onConfirm: async () => {
        try {
          await apiClient.post(`/admin/users/${user.id}/force-password-reset`);
          showToast(`Forced password reset flag set for ${user.name}`, "success");
        } catch (err: any) {
          showToast(err.response?.data?.message || "Action failed", "error");
        } finally {
          setConfirmAction(null);
        }
      }
    });
  };

  // Impersonate
  const executeImpersonation = async () => {
    if (!impersonateUser || !impersonateReason.trim()) return;
    try {
      const res = await apiClient.post(`/admin/users/${impersonateUser.id}/impersonate`, {
        reason: impersonateReason
      });
      const { token } = res.data.data;
      
      // Store impersonation metadata locally
      localStorage.setItem("impersonatedUser", JSON.stringify({
        id: impersonateUser.id,
        name: impersonateUser.name,
        email: impersonateUser.email,
      }));
      localStorage.setItem("impersonatedToken", token);
      
      // Dispatch event to trigger banner
      window.dispatchEvent(new Event("impersonationChange"));

      showToast(`Impersonation session established for ${impersonateUser.name}!`, "success");
      setImpersonateUser(null);
      setImpersonateReason("");
      
      // Refresh to update banner locally, or wait 1.5s
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to initiate impersonation", "error");
    }
  };

  // Edit details
  const handleOpenEdit = (user: UserListItem) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      companyName: user.companyName || "",
      country: user.country || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      await apiClient.patch(`/admin/users/${editUser.id}/details`, editForm);
      showToast("User details updated successfully", "success");
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update details", "error");
    }
  };

  // Bulk actions
  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(users.map(u => u.id)));
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

  const handleBulkStatus = async (status: 'active' | 'suspended' | 'archived') => {
    if (selectedIds.size === 0) return;
    setConfirmAction({
      title: `Bulk Change to ${status.toUpperCase()}`,
      message: `Apply status update "${status}" to the ${selectedIds.size} selected user accounts?`,
      onConfirm: async () => {
        try {
          // Call sequential API updates
          for (const id of Array.from(selectedIds)) {
            if (status === 'suspended') {
              await apiClient.post(`/admin/users/${id}/suspend`);
            } else if (status === 'active') {
              await apiClient.post(`/admin/users/${id}/activate`);
            } else if (status === 'archived') {
              await apiClient.post(`/admin/users/${id}/archive`);
            }
          }
          showToast(`Successfully processed bulk action for ${selectedIds.size} users`, "success");
          setSelectedIds(new Set());
          fetchUsers();
          fetchStats();
        } catch (err: any) {
          showToast(err.response?.data?.message || "Failed during bulk action updates", "error");
        } finally {
          setConfirmAction(null);
        }
      }
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (users.length === 0) return;
    const headers = ["ID", "Name", "Email", "AccountType", "Company", "Country", "Verified", "Blocked", "Status", "Created At"];
    const rows = users.map(u => [
      u.id, u.name, u.email, u.accountType, u.companyName || "", u.country || "",
      u.emailVerified ? "Yes" : "No", u.isBlocked ? "Yes" : "No", u.status, u.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexusbid_users_export_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV Export triggered", "success");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-text via-text-light to-text bg-clip-text">
            Enterprise User Directory
          </h1>
          <p className="mt-1 text-sm text-text-light">
            Monitor, audit, impersonate, and manage administrators and customers in one command center.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-sm font-semibold hover:bg-background transition cursor-pointer"
          >
            <RotateCw size={15} />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            disabled={users.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-sm font-semibold hover:bg-background disabled:opacity-50 transition cursor-pointer"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {[
          { title: "Total Users", val: stats?.total, icon: Users, col: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20" },
          { title: "Active Accounts", val: stats?.active, icon: UserCheck, col: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" },
          { title: "Online Now", val: stats?.onlineNow, icon: Globe, col: "text-sky-500 bg-sky-50 dark:bg-sky-950/20" },
          { title: "Admins", val: stats?.admins, icon: ShieldCheck, col: "text-purple-500 bg-purple-50 dark:bg-purple-950/20" },
          { title: "Blocked / Suspended", val: (stats?.blocked || 0) + (stats?.suspended || 0), icon: UserX, col: "text-rose-500 bg-rose-50 dark:bg-rose-950/20" },
          { title: "New Today", val: stats?.newToday, icon: Clock, col: "text-amber-500 bg-amber-50 dark:bg-amber-950/20" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-light">{card.title}</span>
                <div className={`p-1.5 rounded-lg ${card.col}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-4">
                {statsLoading ? (
                  <div className="h-8 w-16 bg-border animate-pulse rounded-md" />
                ) : (
                  <h3 className="text-2xl font-bold tracking-tight">{card.val ?? 0}</h3>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border gap-2">
        {[
          { id: "customers", label: "Customers", count: stats?.customers },
          { id: "admins", label: "Administrators", count: stats?.admins },
          { id: "pending", label: "Pending Approval", count: stats?.pendingApprovalAdmins },
          { id: "suspended", label: "Suspended", count: stats?.suspended },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id as any); setPage(1); }}
            className={`px-4 py-3 text-sm font-semibold relative transition cursor-pointer ${
              activeTab === t.id 
                ? "text-primary" 
                : "text-text-light hover:text-text"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {t.label}
              {t.count !== undefined && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === t.id ? "bg-primary/10 text-primary" : "bg-muted text-text-light"
                }`}>
                  {t.count}
                </span>
              )}
            </span>
            {activeTab === t.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Search & Filters Toolbar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 md:flex-row md:items-center bg-surface p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, company or ID..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl bg-background text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Country Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl bg-background text-sm">
            <Globe size={14} className="text-text-light" />
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setPage(1); }}
              className="bg-transparent border-none outline-none font-semibold text-xs text-text cursor-pointer"
            >
              <option value="">All Countries</option>
              {countriesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Verified status filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl bg-background text-sm">
            <CheckCircle size={14} className="text-text-light" />
            <select
              value={verified}
              onChange={(e) => { setVerified(e.target.value); setPage(1); }}
              className="bg-transparent border-none outline-none font-semibold text-xs text-text cursor-pointer"
            >
              <option value="all">Verification (All)</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Filter size={13} />
            Apply Filters
          </button>
        </div>
      </form>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 p-4 rounded-xl animate-fade-in">
          <span className="text-xs font-semibold text-primary">
            {selectedIds.size} user accounts selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus('active')}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Activate Selected
            </button>
            <button
              onClick={() => handleBulkStatus('suspended')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Suspend Selected
            </button>
            <button
              onClick={() => handleBulkStatus('archived')}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Archive Selected
            </button>
          </div>
        </div>
      )}

      {/* Main Table Wrapper */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="w-12 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedIds.size === users.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-light">
                  User Details
                </th>
                {activeTab === "customers" ? (
                  <>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-light">
                      Company
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-light">
                      Subscription
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-light">
                      Assigned Roles
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-light">
                      Approval Status
                    </th>
                  </>
                )}
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-light">
                  Country
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-light">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-light">
                  Last Login
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-light">
                  Created
                </th>
                <th className="w-20 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-text-light">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border bg-surface">
              {loading ? (
                // Skeletons
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-4 py-5"><div className="h-4 w-4 bg-border rounded" /></td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-border" />
                        <div className="space-y-2">
                          <div className="h-4 w-28 bg-border rounded" />
                          <div className="h-3 w-36 bg-border rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5"><div className="h-4 w-24 bg-border rounded" /></td>
                    <td className="px-4 py-5"><div className="h-4 w-16 bg-border rounded" /></td>
                    <td className="px-4 py-5"><div className="h-4 w-12 bg-border rounded" /></td>
                    <td className="px-4 py-5"><div className="h-4.5 w-16 bg-border rounded-full" /></td>
                    <td className="px-4 py-5"><div className="h-4 w-20 bg-border rounded" /></td>
                    <td className="px-4 py-5"><div className="h-4 w-16 bg-border rounded" /></td>
                    <td className="px-4 py-5"><div className="h-6 w-12 bg-border rounded mx-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-text-light">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-border" />
                      <p className="font-semibold text-sm">No users match the search filters.</p>
                      <p className="text-xs">Try removing filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-background/40 transition">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(u.id)}
                        onChange={(e) => handleSelectOne(u.id, e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shadow-sm select-none">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-sm block">{u.name}</span>
                          <span className="text-xs text-text-light block">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {activeTab === "customers" ? (
                      <>
                        <td className="px-4 py-4 text-xs font-semibold text-text">
                          {u.companyName || "N/A"}
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
                            {u.subscriptions?.[0]?.plan?.name || "Free Trial"}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {u.userRoles && u.userRoles.length > 0 ? (
                              u.userRoles.map((ur, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                                  {ur.role.activeVersion?.name || ur.role.slug}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-text-light">No roles</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                            u.status === "pending_approval" 
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400" 
                              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                          }`}>
                            {u.status === "pending_approval" ? "Pending Approval" : "Approved"}
                          </span>
                        </td>
                      </>
                    )}

                    <td className="px-4 py-4 text-xs font-bold text-text-light uppercase">
                      {u.country || "N/A"}
                    </td>

                    <td className="px-4 py-4">
                      {u.isBlocked ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/20">
                          Blocked
                        </span>
                      ) : u.status === "suspended" ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/20">
                          Suspended
                        </span>
                      ) : u.status === "archived" ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-950/30 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-900/20">
                          Archived
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/20">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs text-text-light">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                    </td>

                    <td className="px-4 py-4 text-xs text-text-light">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4">
                      {/* Action buttons */}
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => router.push(`/users/${u.id}`)}
                          title="View Details"
                          className="p-1 text-text-light hover:text-primary transition hover:scale-110 cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                        
                        <button
                          onClick={() => handleOpenEdit(u)}
                          title="Edit Details"
                          className="p-1 text-text-light hover:text-primary transition hover:scale-110 cursor-pointer"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => setImpersonateUser(u)}
                          title="Impersonate"
                          className="p-1 text-text-light hover:text-amber-500 transition hover:scale-110 cursor-pointer"
                        >
                          <UserPlus size={15} />
                        </button>

                        {/* Dropdown Menu for security/status actions */}
                        <div className="relative group">
                          <button className="p-1 text-text-light hover:text-text transition cursor-pointer font-bold">
                            •••
                          </button>
                          
                          <div className="hidden group-hover:block absolute right-0 bottom-full mb-1 z-30 bg-surface border border-border rounded-xl shadow-xl py-1.5 w-48 text-left text-xs font-semibold text-text divide-y divide-border/50">
                            <div>
                              <button
                                onClick={() => handleSendResetPassword(u)}
                                className="w-full px-3 py-2 hover:bg-background flex items-center gap-2 cursor-pointer"
                              >
                                <Key size={13} className="text-text-light" />
                                Send Reset Password
                              </button>
                              <button
                                onClick={() => handleSendVerification(u)}
                                className="w-full px-3 py-2 hover:bg-background flex items-center gap-2 cursor-pointer"
                              >
                                <CheckCircle size={13} className="text-text-light" />
                                Send Verification
                              </button>
                              <button
                                onClick={() => handleForcePasswordReset(u)}
                                className="w-full px-3 py-2 hover:bg-background flex items-center gap-2 cursor-pointer"
                              >
                                <ShieldAlert size={13} className="text-text-light" />
                                Force Password Change
                              </button>
                            </div>
                            <div>
                              <button
                                onClick={() => handleToggleBlock(u)}
                                className="w-full px-3 py-2 hover:bg-background text-rose-500 flex items-center gap-2 cursor-pointer"
                              >
                                <Ban size={13} />
                                {u.isBlocked ? "Unblock Account" : "Block Account"}
                              </button>
                              <button
                                onClick={() => handleToggleSuspend(u)}
                                className="w-full px-3 py-2 hover:bg-background text-amber-500 flex items-center gap-2 cursor-pointer"
                              >
                                <UserMinus size={13} />
                                {u.status === "suspended" ? "Unsuspend User" : "Suspend User"}
                              </button>
                              <button
                                onClick={() => handleArchive(u)}
                                className="w-full px-3 py-2 hover:bg-background text-gray-500 flex items-center gap-2 cursor-pointer"
                              >
                                <Download size={13} />
                                Archive Account
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {total > limit && (
          <div className="flex items-center justify-between border-t border-border bg-background px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="relative inline-flex items-center rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-background disabled:opacity-50 transition cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage(page + 1)}
                className="relative ml-3 inline-flex items-center rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-background disabled:opacity-50 transition cursor-pointer"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-text-light">
                  Showing <span className="font-semibold">{(page - 1) * limit + 1}</span> to{" "}
                  <span className="font-semibold">{Math.min(page * limit, total)}</span> of{" "}
                  <span className="font-semibold">{total}</span> users
                </p>
              </div>
              <div>
                <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="relative inline-flex items-center rounded-l-xl border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-background disabled:opacity-50 transition cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-xs font-bold bg-surface border-y border-border">
                    Page {page} of {Math.ceil(total / limit)}
                  </span>
                  <button
                    disabled={page * limit >= total}
                    onClick={() => setPage(page + 1)}
                    className="relative inline-flex items-center rounded-r-xl border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-background disabled:opacity-50 transition cursor-pointer"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold">Edit User Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-text-light block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-light block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-light block mb-1">Company Name</label>
                <input
                  type="text"
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-light block mb-1">Country (2-Letter ISO Code)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value.toUpperCase() })}
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
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <ShieldAlert size={22} />
              <h3 className="text-lg font-bold text-text">Initialize Impersonation</h3>
            </div>
            <p className="text-xs text-text-light leading-relaxed">
              Impersonating <strong>{impersonateUser.name}</strong> will authenticate your session as this user. 
              This action is strictly audited under your administrator account.
            </p>
            <div>
              <label className="text-xs font-bold text-text block mb-1">Reason for Impersonation</label>
              <textarea
                value={impersonateReason}
                onChange={(e) => setImpersonateReason(e.target.value)}
                placeholder="e.g. Debugging purchase failure report #1093"
                className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none h-20 resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => { setImpersonateUser(null); setImpersonateReason(""); }}
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

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-text">{confirmAction.title}</h3>
            <p className="text-sm text-text-light leading-relaxed">{confirmAction.message}</p>
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

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-gray-950 text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-white/10 max-w-sm animate-slide-up">
          <div className={`p-2 rounded-xl bg-white/10 ${toast.type === "error" ? "text-red-400" : toast.type === "success" ? "text-green-400" : "text-sky-400"}`}>
            <ShieldAlert size={18} />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider">
              {toast.type === "error" ? "Action Failed" : toast.type === "success" ? "Completed" : "Notification"}
            </span>
            <span className="text-xs text-white/90 leading-normal font-semibold">{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white/40 hover:text-white/80 text-sm ml-2 self-start p-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
