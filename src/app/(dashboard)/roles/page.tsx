"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Shield,
  ShieldAlert,
  Edit2,
  Trash2,
  Key,
  HelpCircle,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowLeftRight,
  Lock,
  Unlock,
  FileText,
  Search,
  UserCheck,
  Download,
  History,
  Info,
  Clock,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { rbacApi } from "@/features/rbac/api/api";
import { Role } from "@/features/rbac/types";
import { useAuthStore } from "@/features/auth/store/store";

export default function RolesPage() {
  const currentUser = useAuthStore((state) => state.user);

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  function showToast(message: string, type: "success" | "error" | "info" = "error") {
    setToast({ message, type });
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // View Only Mode State
  const [viewOnly, setViewOnly] = useState(false);

  // Stats State
  const [stats, setStats] = useState<{
    totalRoles: number;
    activeRoles: number;
    pendingReviews: number;
    moduleDistribution: any[];
  } | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Form State
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [modules, setModules] = useState<any[]>([]);

  // Drawer Form States
  const [starredPermissions, setStarredPermissions] = useState<string[]>([]);
  const [permSearch, setPermSearch] = useState("");
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activePermissionDetail, setActivePermissionDetail] = useState<any | null>(null);

  interface FormattedPermission {
    id: string;
    key: string;
    label: string;
    description: string;
    category: "basic" | "admin" | "dangerous";
    dependencies: string[];
  }

  function getPermissionMetadata(key: string, desc: string): FormattedPermission {
    const normKey = key.toUpperCase().replace(/\./g, "_");
    const lowerKey = normKey.toLowerCase();
    
    let label = key;
    if (normKey === "USER_VIEW") label = "View Users";
    else if (normKey === "USER_CREATE") label = "Create Users";
    else if (normKey === "USER_UPDATE") label = "Update Users";
    else if (normKey === "USER_DELETE") label = "Delete Users";
    else if (normKey === "USER_IMPERSONATE") label = "Impersonate Users";
    else if (normKey === "USER_ASSIGN_ROLE") label = "Assign Role to User";
    else if (normKey === "USER_REMOVE_ROLE") label = "Remove Role from User";
    else if (normKey === "USER_RESET_PASSWORD") label = "Reset User Password";
    else if (normKey === "NOTIFICATION_PREFERENCE_MANAGE") label = "Manage Notification Preferences";
    else if (normKey === "SYSTEM_CACHE_MANAGE") label = "Manage Cache";
    else if (normKey === "TENDER_VIEW") label = "View Tenders";
    else if (normKey === "TENDER_CREATE") label = "Create Tenders";
    else if (normKey === "TENDER_UPDATE") label = "Update Tenders";
    else if (normKey === "TENDER_DELETE") label = "Delete Tenders";
    else {
      const parts = normKey.split("_");
      if (parts.length >= 2) {
        const act = parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1).toLowerCase();
        const mod = parts.slice(0, parts.length - 1).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
        label = `${act} ${mod}`;
      } else {
        label = key.replace(/[_\.]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      }
    }

    let category: "basic" | "admin" | "dangerous" = "admin";
    if (
      lowerKey.includes("delete") ||
      lowerKey.includes("impersonate") ||
      lowerKey.includes("archive") ||
      lowerKey.includes("security") ||
      lowerKey.includes("backup") ||
      lowerKey.includes("purge") ||
      lowerKey.includes("force")
    ) {
      category = "dangerous";
    } else if (
      lowerKey.includes("view") ||
      lowerKey.includes("read") ||
      lowerKey.includes("list") ||
      lowerKey.includes("search") ||
      lowerKey.includes("get")
    ) {
      category = "basic";
    }

    const dependencies: string[] = [];
    const parts = normKey.split("_");
    if (parts.length > 0) {
      const modPrefix = parts[0];
      const viewKey = `${modPrefix}_VIEW`;
      if (normKey !== viewKey) {
        dependencies.push(viewKey);
      }
    }

    return {
      id: key,
      key,
      label,
      description: desc || `Allows performing ${label.toLowerCase()} actions.`,
      category,
      dependencies,
    };
  }

  function toggleStar(key: string) {
    setStarredPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleModuleFullAccess(mod: any) {
    const modPermKeys = mod.permissions.map((p: any) => p.key);
    const allSelected = modPermKeys.every((k: string) => selectedPermissions.includes(k));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((k) => !modPermKeys.includes(k)));
    } else {
      const toAdd = modPermKeys.filter((k: string) => !selectedPermissions.includes(k));
      setSelectedPermissions((prev) => [...prev, ...toAdd]);
    }
  }

  // History Drawer State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRole, setHistoryRole] = useState<Role | null>(null);
  const [versions, setVersions] = useState<any[]>([]);

  // Assign Drawer State
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<Role | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // Submit Review State
  const [submitReviewOpen, setSubmitReviewOpen] = useState(false);
  const [versionToSubmit, setVersionToSubmit] = useState<any | null>(null);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

  // Review Action State
  const [reviewActionOpen, setReviewActionOpen] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState("");
  const [reviewRoleName, setReviewRoleName] = useState("");
  const [reviewCreatorId, setReviewCreatorId] = useState("");
  const [reviewDecision, setReviewDecision] = useState<"APPROVED" | "REJECTED" | "CHANGES_REQUESTED">("APPROVED");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewDetails, setReviewDetails] = useState<any | null>(null);

  // Compare Drawer State
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareRole, setCompareRole] = useState<Role | null>(null);
  const [compareV1, setCompareV1] = useState<number | "">("");
  const [compareV2, setCompareV2] = useState<number | "">("");
  const [compareResult, setCompareResult] = useState<any | null>(null);

  async function loadRoles() {
    setLoading(true);
    try {
      const [rolesRes, statsRes, modulesRes] = await Promise.all([
        rbacApi.getRoles(true),
        rbacApi.getStats(),
        rbacApi.getPermissions()
      ]);
      setRoles(rolesRes.data.data || []);
      setStats(statsRes.data.data || null);
      setModules(modulesRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  // Load versions history
  async function loadHistory(role: Role) {
    setHistoryRole(role);
    setHistoryOpen(true);
    try {
      const res = await rbacApi.getRoleVersions(role.id);
      setVersions(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  // Load assignable users
  async function openAssignModal(role: Role) {
    setAssignRole(role);
    setAssignOpen(true);
    try {
      const res = await rbacApi.getAssignableUsers();
      setAssignableUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  // Handle Role Assignment
  async function handleAssignSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId || !assignRole) return;

    try {
      await rbacApi.createAssignment({
        userId: selectedUserId,
        roleId: assignRole.id,
        expiresAt: expiresAt || null
      });
      setAssignOpen(false);
      setSelectedUserId("");
      setExpiresAt("");
      alert("Role assigned successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to assign role");
    }
  }

  function handleOpenCreate() {
    setEditingRole(null);
    setRoleName("");
    setDescription("");
    setSelectedPermissions([]);
    setViewOnly(false);
    setDrawerOpen(true);
  }

  function handleOpenEdit(role: Role) {
    setEditingRole(role);
    setRoleName(role.name);
    const cleanDesc = (role.description || "").replace(/\[ReplacesRole:\s*([0-9a-fA-F-]+)\]/, "").trim();
    setDescription(cleanDesc);
    if (role.slug === "super-admin") {
      const allKeys = modules.flatMap((m) => (m.permissions || []).map((p) => p.key));
      setSelectedPermissions(allKeys);
    } else {
      setSelectedPermissions(role.permissions || []);
    }
    setViewOnly(false);
    setDrawerOpen(true);
  }

  function handleOpenView(role: Role) {
    setEditingRole(role);
    setRoleName(role.name);
    const cleanDesc = (role.description || "").replace(/\[ReplacesRole:\s*([0-9a-fA-F-]+)\]/, "").trim();
    setDescription(cleanDesc);
    if (role.slug === "super-admin") {
      const allKeys = modules.flatMap((m) => (m.permissions || []).map((p) => p.key));
      setSelectedPermissions(allKeys);
    } else {
      setSelectedPermissions(role.permissions || []);
    }
    setViewOnly(true);
    setDrawerOpen(true);
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to archive this role? All users with this role will temporarily lose access to its active permissions.")) {
      try {
        const res = await rbacApi.deleteRole(id);
        if (res.data.success) {
          loadRoles();
        }
      } catch (err: any) {
        alert(err.response?.data?.message || "Delete failed");
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleName.trim()) return;

    if (selectedPermissions.length === 0) {
      alert("A role must have at least one permission assigned.");
      return;
    }

    try {
      if (editingRole) {
        const isRenamingApprovedRole = editingRole.activeVersionId && editingRole.name.trim() !== roleName.trim();
        if (isRenamingApprovedRole) {
          await rbacApi.createRole({
            name: roleName.trim(),
            description: `${description || ""} [ReplacesRole: ${editingRole.id}]`.trim(),
            permissions: selectedPermissions,
          });
          alert(`Cloned draft version of "${roleName}" has been successfully created. Once approved, the previous role "${editingRole.name}" will be blocked, and all users will be migrated automatically.`);
        } else {
          await rbacApi.updateRole(editingRole.id, {
            name: roleName,
            description,
            permissions: selectedPermissions,
          });
        }
      } else {
        await rbacApi.createRole({
          name: roleName,
          description,
          permissions: selectedPermissions,
        });
      }
      setDrawerOpen(false);
      loadRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || "Submission failed");
    }
  }

  // Toggle version lock
  async function toggleLock(version: any) {
    try {
      if (version.lockedByUserId) {
        await rbacApi.unlockVersion(version.id);
      } else {
        await rbacApi.lockVersion(version.id);
      }
      if (historyRole) loadHistory(historyRole);
    } catch (err: any) {
      alert(err.response?.data?.message || "Lock action failed");
    }
  }

  // Submit for review dialog
  async function openSubmitReviewModal(version: any) {
    setVersionToSubmit(version);
    setSubmitReviewOpen(true);
    setSelectedReviewers([]);
    try {
      const res = await rbacApi.getAssignableUsers();
      setAssignableUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSendForReview() {
    if (selectedReviewers.length === 0 || !versionToSubmit) return;
    try {
      await rbacApi.submitVersion(versionToSubmit.id, selectedReviewers);
      setSubmitReviewOpen(false);
      if (historyRole) loadHistory(historyRole);
      loadRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || "Submit review failed");
    }
  }

  // Review console
  async function openReviewAction(version: any) {
    setReviewRoleName(historyRole?.name || "");
    setReviewCreatorId(version.createdByUserId);
    setReviewComment("");
    setReviewDecision("APPROVED");

    try {
      const res = await rbacApi.getReviewDetails(version.reviews?.[0]?.id || version.reviews?.[0] || "");
      if (res.data.data) {
        setReviewDetails(res.data.data);
        setActiveReviewId(res.data.data.id);
        setReviewActionOpen(true);
      }
    } catch (err: any) {
      // If direct look failed, fetch via active version reviews structure
      console.error(err);
      alert("Failed to load review workflow timeline.");
    }
  }

  async function submitReviewDecision() {
    try {
      await rbacApi.submitReview(activeReviewId, reviewDecision, reviewComment);
      setReviewActionOpen(false);
      if (historyRole) loadHistory(historyRole);
      loadRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || "Review decision submission failed");
    }
  }

  // Version Comparison
  async function openCompareModal(role: Role) {
    setCompareRole(role);
    setCompareV1("");
    setCompareV2("");
    setCompareResult(null);
    setCompareOpen(true);
    try {
      const res = await rbacApi.getRoleVersions(role.id);
      setVersions(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCompare() {
    if (!compareRole || !compareV1 || !compareV2) return;
    try {
      const res = await rbacApi.compareVersions(compareRole.id, Number(compareV1), Number(compareV2));
      setCompareResult(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Comparison failed");
    }
  }

  // Preset configuration mapped to uppercase seeded keys
  function handlePresetChange(presetType: string) {
    if (presetType === "super-admin") {
      const all = modules.flatMap((m) => m.permissions.map((p: any) => p.key));
      setSelectedPermissions(all);
    } else if (presetType === "role-manager") {
      setSelectedPermissions([
        "ROLE_VIEW", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE",
        "ROLE_REVIEW", "ROLE_APPROVE", "ROLE_REJECT", "ROLE_ASSIGN", "ROLE_COMPARE"
      ]);
    } else if (presetType === "audit-only") {
      setSelectedPermissions(["ROLE_VIEW", "ROLE_AUDIT_VIEW"]);
    } else if (presetType === "clear") {
      setSelectedPermissions([]);
    }
  }

  function togglePermission(key: string) {
    const meta = getPermissionMetadata(key, "");
    const isCurrentlySelected = selectedPermissions.includes(key);

    let newSelected = [...selectedPermissions];

    if (isCurrentlySelected) {
      // Uncheck it
      newSelected = newSelected.filter((k) => k !== key);
    } else {
      // Check it.
      // 1. If it's dangerous, warn the user
      if (meta.category === "dangerous") {
        const confirmMsg = `⚠️ WARNING: "${meta.label}" is a dangerous or highly privileged permission. This may allow system-level operations or sensitive data access. Are you sure you want to enable this?`;
        if (!window.confirm(confirmMsg)) {
          return;
        }
      }

      newSelected.push(key);

      // 2. Auto-check dependencies (e.g. if USER_CREATE is checked, check USER_VIEW)
      meta.dependencies.forEach((depKey) => {
        // Find if this dependency is registered in modules
        const depExists = modules.some((m) => m.permissions.some((p: any) => p.key === depKey));
        if (depExists && !newSelected.includes(depKey)) {
          newSelected.push(depKey);
        }
      });
    }

    setSelectedPermissions(newSelected);
  }

  // Trigger export of RBAC Configuration
  async function triggerExport() {
    try {
      const res = await rbacApi.exportData();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.data, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `rbac_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error(err);
    }
  }

  // Memoized permission checklist to prevent typing lag
  const memoizedPermissionSelector = useMemo(() => {
    return (
      <>
        {/* Favorites Section */}
        {starredPermissions.length > 0 && (
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/20 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-500" />
              ⭐ Favorites
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {starredPermissions.map((key) => {
                const meta = getPermissionMetadata(key, "");
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border/40 hover:border-amber-300 transition"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(key)}
                        onChange={() => togglePermission(key)}
                        disabled={viewOnly}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      <span className="text-xs font-medium text-text">{meta.label}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleStar(key)}
                      className="text-amber-400 hover:text-amber-500 p-1"
                    >
                      ★
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Permission Modules Accordions */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-2">
            Permissions Modules
          </h3>

          {modules
            .map((mod) => {
              const formattedPerms = (mod.permissions || []).map((p: any) =>
                getPermissionMetadata(p.key, p.description)
              );
              const matches = formattedPerms.filter(
                (p: any) =>
                  p.key.toLowerCase().includes(permSearch.toLowerCase()) ||
                  p.label.toLowerCase().includes(permSearch.toLowerCase()) ||
                  p.description.toLowerCase().includes(permSearch.toLowerCase())
              );
              return {
                ...mod,
                matchedPermissions: matches,
              };
            })
            .filter((mod) => mod.matchedPermissions.length > 0)
            .map((mod) => {
              const isExpanded =
                permSearch.length > 0 || expandedModules.includes(mod.id);
              const modSelectedKeys = mod.matchedPermissions.map((p: any) => p.key);
              const modSelectedCount = modSelectedKeys.filter((k: string) =>
                selectedPermissions.includes(k)
              ).length;
              const isFullAccess =
                modSelectedCount === modSelectedKeys.length && modSelectedKeys.length > 0;

              // Categorize matching permissions
              const basicPerms = mod.matchedPermissions.filter((p: any) => p.category === "basic");
              const adminPerms = mod.matchedPermissions.filter((p: any) => p.category === "admin");
              const dangerousPerms = mod.matchedPermissions.filter((p: any) => p.category === "dangerous");

              return (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-border bg-surface overflow-hidden transition-all duration-200 hover:border-border/100"
                >
                  {/* Accordion Header */}
                  <div className="flex items-center justify-between p-4 bg-background/30 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedModules((prev) =>
                            prev.includes(mod.id)
                              ? prev.filter((id) => id !== mod.id)
                              : [...prev, mod.id]
                          )
                        }
                        className="flex items-center gap-2 font-bold text-sm text-text"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-text-light" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-text-light" />
                        )}
                        <span>{mod.name}</span>
                      </button>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {modSelectedCount}/{modSelectedKeys.length} selected
                      </span>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-light">
                      <input
                        type="checkbox"
                        checked={isFullAccess}
                        onChange={() => toggleModuleFullAccess(mod)}
                        disabled={viewOnly}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      <span>Full Access</span>
                    </label>
                  </div>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <div className="p-4 space-y-4 bg-surface divide-y divide-border/30">
                      {/* Basic category */}
                      {basicPerms.length > 0 && (
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-green-600 bg-green-50 px-2 py-0.5 rounded-md mb-2 uppercase tracking-wide">
                            🟢 Basic
                          </span>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {basicPerms.map((perm: any) => (
                              <div
                                key={perm.key}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-background/40 transition"
                              >
                                <label className="flex items-start gap-2 cursor-pointer flex-1 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(perm.key)}
                                    onChange={() => togglePermission(perm.key)}
                                    disabled={viewOnly}
                                    className="mt-0.5 h-4 w-4 rounded accent-primary shrink-0"
                                  />
                                  <div className="truncate">
                                    <span className="text-xs font-semibold text-text block truncate">
                                      {perm.label}
                                    </span>
                                    <span className="text-[10px] text-text-light block truncate">
                                      {perm.key}
                                    </span>
                                  </div>
                                </label>

                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleStar(perm.key)}
                                    className="text-text-light hover:text-amber-400 p-1"
                                  >
                                    {starredPermissions.includes(perm.key) ? (
                                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    ) : (
                                      <Star className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActivePermissionDetail(perm)}
                                    className="text-text-light hover:text-primary p-1"
                                  >
                                    <Info className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin category */}
                      {adminPerms.length > 0 && (
                        <div className="pt-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mb-2 uppercase tracking-wide">
                            🟡 Administrative
                          </span>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {adminPerms.map((perm: any) => (
                              <div
                                key={perm.key}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-background/40 transition"
                              >
                                <label className="flex items-start gap-2 cursor-pointer flex-1 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(perm.key)}
                                    onChange={() => togglePermission(perm.key)}
                                    disabled={viewOnly}
                                    className="mt-0.5 h-4 w-4 rounded accent-primary shrink-0"
                                  />
                                  <div className="truncate">
                                    <span className="text-xs font-semibold text-text block truncate">
                                      {perm.label}
                                    </span>
                                    <span className="text-[10px] text-text-light block truncate">
                                      {perm.key}
                                    </span>
                                  </div>
                                </label>

                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleStar(perm.key)}
                                    className="text-text-light hover:text-amber-400 p-1"
                                  >
                                    {starredPermissions.includes(perm.key) ? (
                                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    ) : (
                                      <Star className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActivePermissionDetail(perm)}
                                    className="text-text-light hover:text-primary p-1"
                                  >
                                    <Info className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dangerous category */}
                      {dangerousPerms.length > 0 && (
                        <div className="pt-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-md mb-2 uppercase tracking-wide">
                            🔴 Dangerous
                          </span>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {dangerousPerms.map((perm: any) => (
                              <div
                                key={perm.key}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-background/40 transition border border-transparent hover:border-red-200"
                              >
                                <label className="flex items-start gap-2 cursor-pointer flex-1 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(perm.key)}
                                    onChange={() => togglePermission(perm.key)}
                                    disabled={viewOnly}
                                    className="mt-0.5 h-4 w-4 rounded accent-red-600 shrink-0"
                                  />
                                  <div className="truncate">
                                    <span className="text-xs font-semibold text-red-600 block truncate">
                                      {perm.label}
                                    </span>
                                    <span className="text-[10px] text-text-light block truncate">
                                      {perm.key}
                                    </span>
                                  </div>
                                </label>

                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleStar(perm.key)}
                                    className="text-text-light hover:text-amber-400 p-1"
                                  >
                                    {starredPermissions.includes(perm.key) ? (
                                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    ) : (
                                      <Star className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActivePermissionDetail(perm)}
                                    className="text-text-light hover:text-red-500 p-1"
                                  >
                                    <Info className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </>
    );
  }, [
    starredPermissions,
    selectedPermissions,
    modules,
    permSearch,
    expandedModules,
    viewOnly,
  ]);

  // Filter roles list
  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          role.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || role.status === statusFilter;
    const matchesType = typeFilter === "ALL" ||
                        (typeFilter === "SYSTEM" && role.isSystemRole) ||
                        (typeFilter === "CUSTOM" && !role.isSystemRole);
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-text">
            <Shield className="text-primary h-8 w-8" />
            Roles & Permissions Control Panel
          </h1>
          <p className="mt-1 text-text-light">
            Manage enterprise role versioning, draft locking, reviewer consensus, and permission registry snapshot assignments.
          </p>
        </div>

        <div className="flex gap-2">
          <Button leftIcon={Download} variant="outline" onClick={triggerExport}>
            Export Configuration
          </Button>
          <Button leftIcon={Plus} onClick={handleOpenCreate}>
            Create Role Draft
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 flex items-center gap-4 bg-indigo-50/50 border-indigo-100">
            <div className="p-3 bg-indigo-500 rounded-xl text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-light">Total Roles</p>
              <h3 className="text-2xl font-bold text-text">{stats.totalRoles}</h3>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4 bg-green-50/50 border-green-100">
            <div className="p-3 bg-green-500 rounded-xl text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-light">Active Roles</p>
              <h3 className="text-2xl font-bold text-text">{stats.activeRoles}</h3>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4 bg-amber-50/50 border-amber-100">
            <div className="p-3 bg-amber-500 rounded-xl text-white animate-pulse">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-light">Pending Reviews</p>
              <h3 className="text-2xl font-bold text-text">{stats.pendingReviews}</h3>
            </div>
          </Card>
        </div>
      )}

      {/* Advanced Filter Toolbar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-surface">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-text-light" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles..."
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 outline-none transition focus:border-primary text-sm text-text"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 outline-none transition focus:border-primary text-sm text-text"
          >
            <option value="ALL">All Types</option>
            <option value="SYSTEM">System Roles</option>
            <option value="CUSTOM">Custom Roles</option>
          </select>
        </div>
      </Card>

      {/* Roles List */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 rounded-2xl border border-border bg-surface p-6 space-y-4">
              <div className="h-6 bg-sidebar-hover rounded w-1/2"></div>
              <div className="h-4 bg-sidebar-hover rounded w-3/4"></div>
              <div className="h-4 bg-sidebar-hover rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className={`relative rounded-2xl border bg-surface p-6 shadow-sm transition hover:shadow-md flex flex-col justify-between ${
                role.slug === "super-admin" ? "border-primary/40 ring-1 ring-primary/10" : "border-border"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-text flex flex-wrap items-center gap-1.5">
                      {role.name}
                      {role.isSystemRole && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                          System
                        </span>
                      )}
                      {role.isDefaultRole && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                          Default
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-text-light mt-0.5">Active Version: {role.version ? `v${role.version}` : "None (Draft)"}</p>
                  </div>

                  <Badge
                    color={
                      role.status === "ACTIVE"
                        ? "green"
                        : role.status === "DISABLED"
                        ? "yellow"
                        : "red"
                    }
                  >
                    {role.status}
                  </Badge>
                </div>
                {(() => {
                  const replacesMatch = role.description?.match(/\[ReplacesRole:\s*([0-9a-fA-F-]+)\]/);
                  const cleanDesc = role.description?.replace(/\[ReplacesRole:\s*([0-9a-fA-F-]+)\]/, "").trim() || "";
                  return (
                    <div className="mb-4">
                      <p className="text-sm text-text-light line-clamp-3 mb-2">{cleanDesc || "No description provided."}</p>
                      {replacesMatch && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          🔄 Replaces Predecessor Role
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-text-light mb-4 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-1">
                    <Key className="h-4 w-4 text-primary" />
                    <span>
                      {role.slug === "super-admin" ? "All privileges" : `${role.permissions?.length || 0} permissions`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openCompareModal(role)}
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                      title="Compare Versions"
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5" />
                      Diff
                    </button>
                    <button
                      onClick={() => loadHistory(role)}
                      className="text-text hover:underline font-semibold flex items-center gap-1"
                    >
                      <History className="h-3.5 w-3.5" />
                      History
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    leftIcon={Eye}
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenView(role)}
                  >
                    View
                  </Button>
                  <Button
                    leftIcon={UserCheck}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (role.status !== "ACTIVE") {
                        showToast("Assign is disabled: This role is currently inactive or draft. It must be APPROVED and ACTIVE before it can be assigned to users.", "error");
                        return;
                      }
                      openAssignModal(role);
                    }}
                    className={role.status !== "ACTIVE" ? "opacity-50 cursor-not-allowed hover:bg-transparent active:scale-100" : ""}
                  >
                    Assign
                  </Button>
                  <Button
                    leftIcon={Edit2}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (role.isSystemRole) {
                        showToast("Edit is disabled: System roles are read-only and cannot be modified.", "error");
                        return;
                      }
                      handleOpenEdit(role);
                    }}
                    className={role.isSystemRole ? "opacity-50 cursor-not-allowed hover:bg-transparent active:scale-100" : ""}
                  >
                    Edit
                  </Button>
                  <Button
                    leftIcon={Trash2}
                    variant="outline"
                    size="sm"
                    className={`hover:bg-red-50 hover:text-red-600 hover:border-red-200 ${
                      role.isSystemRole ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-text hover:border-border active:scale-100" : ""
                    }`}
                    onClick={() => {
                      if (role.isSystemRole) {
                        showToast("Archive is disabled: System roles are read-only and cannot be deleted or archived.", "error");
                        return;
                      }
                      handleDelete(role.id);
                    }}
                  >
                    Archive
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Role Drawer */}
      {drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-5xl flex-col bg-surface shadow-2xl transition-all duration-300">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border p-6 bg-surface shrink-0">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-text">
                  <Shield className="h-6 w-6 text-primary" />
                  {viewOnly ? "Role Details (Read-only)" : editingRole ? "Update Role Version" : "Create New Role Draft"}
                </h2>
                <p className="mt-1 text-sm text-text-light">
                  {viewOnly
                    ? "Inspect active permission configuration and details."
                    : editingRole
                    ? "Modifications will save as a new DRAFT version requiring review before deployment."
                    : "Creates version 1 of a new role configuration."}
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 transition hover:bg-background text-text-light hover:text-text"
              >
                ✕
              </button>
            </div>

            {/* Double Column Form Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Column: Input Form & Module List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-border/50">
                {/* Basic Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Role Name"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Compliance Officer"
                    required
                    disabled={viewOnly}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text">Description</label>
                    <textarea
                      rows={1}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Responsibilities and access scope of this role..."
                      className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                      disabled={viewOnly}
                    />
                  </div>
                </div>

                {editingRole && editingRole.activeVersionId && editingRole.name.trim() !== roleName.trim() && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl text-xs flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="font-bold flex items-center gap-1.5 text-amber-700">
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                      Cloning / Deactivation Migration Triggered
                    </span>
                    <span>
                      Renaming this active role will create a new, separate duplicate role (<strong>{roleName}</strong>).
                      Once approved, the new role will be activated, the original role (<strong>{editingRole.name}</strong>) will be disabled, and all assigned users will automatically migrate to the new role.
                    </span>
                  </div>
                )}

                {/* Presets */}
                {!viewOnly && (
                  <div className="space-y-3 rounded-2xl border border-border p-4 bg-background/50">
                    <div className="flex items-center gap-2 text-sm font-semibold text-text">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      Quick Preset Snapshots
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handlePresetChange("super-admin")}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-primary hover:bg-primary-light transition font-medium"
                      >
                        Super Admin (All)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetChange("role-manager")}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-primary hover:bg-primary-light transition font-medium"
                      >
                        RBAC Manager
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetChange("audit-only")}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-primary hover:bg-primary-light transition font-medium"
                      >
                        Auditor
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetChange("clear")}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-red-400 hover:bg-red-50 text-red-500 transition font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-light" />
                  <input
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    placeholder="Search permissions by name, key, or description..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                {memoizedPermissionSelector}
              </div>

              {/* Right Column: Live Summary Sidebar & Info Panel */}
              <div className="w-80 shrink-0 bg-background/40 p-6 flex flex-col justify-between border-l border-border/50">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-text uppercase tracking-wider">
                      Role Config Summary
                    </h3>
                    <div className="mt-4 p-4 rounded-2xl bg-surface border border-border/60 shadow-sm space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-text-light mb-1">
                          <span>Permissions Selected</span>
                          <span className="font-bold text-text">
                            {selectedPermissions.length} selected
                          </span>
                        </div>
                        <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${Math.min(
                                100,
                                (selectedPermissions.length /
                                  (modules.flatMap((m) => m.permissions || []).length || 1)) *
                                  100
                              )}%`,
                            }}
                            className="h-full bg-primary rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Module breakdown count */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pt-2 border-t border-border/40">
                        {modules.map((mod) => {
                          const keys = (mod.permissions || []).map((p: any) => p.key);
                          const selCount = keys.filter((k: string) =>
                            selectedPermissions.includes(k)
                          ).length;
                          if (selCount === 0) return null;
                          return (
                            <div
                              key={mod.id}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="text-text-light truncate max-w-[130px]">
                                {mod.name}
                              </span>
                              <span className="font-semibold px-2 py-0.5 rounded bg-background text-text">
                                {selCount} selected
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Selected Chips */}
                  <div>
                    <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-3">
                      Selected Registry Keys
                    </h4>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                      {selectedPermissions.length === 0 ? (
                        <p className="text-xs text-text-light italic">No permissions selected yet.</p>
                      ) : (
                        selectedPermissions.map((key) => {
                          const meta = getPermissionMetadata(key, "");
                          return (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-surface border border-border text-text hover:border-red-300 hover:text-red-600 transition cursor-pointer"
                              onClick={() => togglePermission(key)}
                            >
                              {meta.label}
                              <span className="text-text-light group-hover:text-red-600">✕</span>
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Permission detail info block */}
                {activePermissionDetail ? (
                  <div className="p-4 rounded-2xl border border-primary/20 bg-primary-light/10 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => setActivePermissionDetail(null)}
                      className="absolute top-2.5 right-3 text-text-light hover:text-text text-xs"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          activePermissionDetail.category === "dangerous"
                            ? "bg-red-100 text-red-700"
                            : activePermissionDetail.category === "basic"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {activePermissionDetail.category}
                      </span>
                      <h4 className="text-xs font-bold text-text truncate max-w-[130px]">
                        {activePermissionDetail.label}
                      </h4>
                    </div>
                    <p className="text-[11px] text-text-light leading-relaxed">
                      {activePermissionDetail.description}
                    </p>
                    <div className="text-[10px] space-y-1.5 border-t border-border/40 pt-2">
                      <div>
                        <span className="font-semibold text-text">Registry Key: </span>
                        <code className="text-primary bg-background px-1 py-0.5 rounded font-mono">
                          {activePermissionDetail.key}
                        </code>
                      </div>
                      {activePermissionDetail.dependencies.length > 0 && (
                        <div>
                          <span className="font-semibold text-text">Requires: </span>
                          <span className="text-text-light">
                            {activePermissionDetail.dependencies.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-border text-center">
                    <Info className="h-6 w-6 text-text-light mx-auto mb-2" />
                    <p className="text-xs text-text-light">
                      Click the ⓘ icon on any permission to view detailed risks and dependency rules.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-6 flex justify-end gap-3 bg-surface shrink-0">
              {viewOnly ? (
                <Button onClick={() => setDrawerOpen(false)}>
                  Close
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingRole ? "Spawn Draft Version" : "Create Draft"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* History & Versions Modal */}
      <Modal
        open={historyOpen}
        title={`Version History — ${historyRole?.name || ""}`}
        onClose={() => setHistoryOpen(false)}
        width="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-text-light uppercase bg-background">
                  <th className="p-3">Ver</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Modified By</th>
                  <th className="p-3">Lock State</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {versions.map((ver) => (
                  <tr key={ver.id} className="hover:bg-sidebar-hover/30">
                    <td className="p-3 font-semibold">v{ver.version}</td>
                    <td className="p-3">
                      <Badge
                        color={
                          ver.status === "APPROVED"
                            ? "green"
                            : ver.status === "PENDING_REVIEW"
                            ? "yellow"
                            : ver.status === "REJECTED"
                            ? "red"
                            : "indigo"
                        }
                      >
                        {ver.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-xs text-text">{ver.createdByUser?.name || "System"}</p>
                      <p className="text-[10px] text-text-light">{ver.createdByUser?.email || ""}</p>
                    </td>
                    <td className="p-3">
                      {ver.lockedByUserId ? (
                        <div className="flex items-center gap-1 text-red-600 text-xs font-semibold">
                          <Lock className="h-3.5 w-3.5" />
                          <span>Locked</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-text-light text-xs">
                          <Unlock className="h-3.5 w-3.5" />
                          <span>Unlocked</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {/* Locking Toggle */}
                      {ver.status === "DRAFT" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLock(ver)}
                          title={ver.lockedByUserId ? "Unlock draft" : "Lock draft to edit"}
                        >
                          {ver.lockedByUserId ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </Button>
                      )}

                      {/* Submit Workflow */}
                      {(ver.status === "DRAFT" || ver.status === "REOPENED") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSubmitReviewModal(ver)}
                          disabled={ver.lockedByUserId && ver.lockedByUserId !== currentUser?.id}
                        >
                          Submit
                        </Button>
                      )}

                      {/* Review Decision workflow */}
                      {ver.status === "PENDING_REVIEW" && (
                        <Button
                          size="sm"
                          onClick={() => openReviewAction(ver)}
                        >
                          Review
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Submit for Review Modal */}
      <Modal
        open={submitReviewOpen}
        title="Submit Role Draft for Approval"
        onClose={() => setSubmitReviewOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-light">
            Assign one or more administrators to review and approve version {versionToSubmit?.version} of this role.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text">Select Reviewers</label>
            <div className="max-h-48 overflow-y-auto border border-border rounded-xl p-2 space-y-2">
              {assignableUsers
                .filter((u) => u.id !== currentUser?.id) // Filter creator out to warn/prevent self-assign
                .map((u) => (
                  <label key={u.id} className="flex items-center gap-2 p-1.5 hover:bg-sidebar-hover rounded-lg text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedReviewers.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReviewers([...selectedReviewers, u.id]);
                        } else {
                          setSelectedReviewers(selectedReviewers.filter((id) => id !== u.id));
                        }
                      }}
                      className="h-4 w-4 rounded accent-primary"
                    />
                    <div>
                      <p className="font-semibold text-text">{u.name}</p>
                      <p className="text-[10px] text-text-light">{u.email}</p>
                    </div>
                  </label>
                ))}
            </div>
            {selectedReviewers.length === 0 && (
              <p className="text-xs text-red-500 font-medium">Please assign at least one reviewer.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setSubmitReviewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendForReview} disabled={selectedReviewers.length === 0}>
              Send to Reviewers
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Action Console */}
      <Modal
        open={reviewActionOpen}
        title={`Review Approval Console — ${reviewRoleName}`}
        onClose={() => setReviewActionOpen(false)}
        width="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Creator Warning Block */}
          {reviewCreatorId === currentUser?.id && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2 text-red-700 text-xs">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <span className="font-bold">Creator approval blocked:</span> You created this version draft. To maintain integrity, you cannot approve or reject your own submissions.
              </div>
            </div>
          )}

          {/* Activity Comments Timeline */}
          {reviewDetails?.comments && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-text-light uppercase tracking-wider">Review Comments Timeline</h4>
              <div className="space-y-2 max-h-36 overflow-y-auto border border-border rounded-xl p-3 bg-background">
                {reviewDetails.comments.map((c: any) => (
                  <div key={c.id} className="text-xs flex gap-2 items-start border-b border-border/30 pb-2">
                    <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-text">{c.user?.name || "System"}</p>
                      <p className="text-text-light italic mt-0.5">"{c.comment}"</p>
                      <p className="text-[9px] text-text-light/80 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-semibold text-text block">Review Decision</label>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-3 border border-border rounded-xl cursor-pointer hover:border-green-400">
                <input
                  type="radio"
                  name="decision"
                  checked={reviewDecision === "APPROVED"}
                  onChange={() => setReviewDecision("APPROVED")}
                  disabled={reviewCreatorId === currentUser?.id}
                />
                <span className="text-xs font-bold text-green-700">Approve</span>
              </label>

              <label className="flex items-center gap-2 p-3 border border-border rounded-xl cursor-pointer hover:border-red-400">
                <input
                  type="radio"
                  name="decision"
                  checked={reviewDecision === "REJECTED"}
                  onChange={() => setReviewDecision("REJECTED")}
                  disabled={reviewCreatorId === currentUser?.id}
                />
                <span className="text-xs font-bold text-red-700">Reject</span>
              </label>

              <label className="flex items-center gap-2 p-3 border border-border rounded-xl cursor-pointer hover:border-purple-400">
                <input
                  type="radio"
                  name="decision"
                  checked={reviewDecision === "CHANGES_REQUESTED"}
                  onChange={() => setReviewDecision("CHANGES_REQUESTED")}
                  disabled={reviewCreatorId === currentUser?.id}
                />
                <span className="text-xs font-bold text-purple-700">Request Changes</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text">Review Comment</label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Provide constructive feedback for the audit log..."
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none text-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setReviewActionOpen(false)}>
              Close
            </Button>
            <Button
              variant={reviewDecision === "REJECTED" ? "danger" : "primary"}
              onClick={submitReviewDecision}
              disabled={reviewCreatorId === currentUser?.id}
            >
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>

      {/* Version Comparison Drawer */}
      <Modal
        open={compareOpen}
        title={`Version Comparison Diff — ${compareRole?.name || ""}`}
        onClose={() => setCompareOpen(false)}
        width="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-light block mb-1">Source Version (V1)</label>
              <select
                value={compareV1}
                onChange={(e) => setCompareV1(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none text-sm text-text"
              >
                <option value="">Select V1</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.version}>Version {v.version} ({v.status})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-light block mb-1">Target Version (V2)</label>
              <select
                value={compareV2}
                onChange={(e) => setCompareV2(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none text-sm text-text"
              >
                <option value="">Select V2</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.version}>Version {v.version} ({v.status})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              leftIcon={ArrowLeftRight}
              onClick={handleCompare}
              disabled={!compareV1 || !compareV2 || compareV1 === compareV2}
            >
              Compare Side-by-Side
            </Button>
          </div>

          {compareResult && (
            <div className="mt-6 border border-border rounded-2xl overflow-hidden bg-background p-4 space-y-6">
              {/* Metadata Comparison */}
              <div className="grid grid-cols-2 gap-6 border-b border-border pb-4">
                <div>
                  <h4 className="text-sm font-bold text-text-light uppercase mb-2">v{compareResult.v1.version} (Source)</h4>
                  <div className="p-3 bg-surface border border-border rounded-xl">
                    <p className="font-semibold text-text">{compareResult.v1.name}</p>
                    <p className="text-xs text-text-light mt-1">{compareResult.v1.description || "No description provided."}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-light uppercase mb-2">v{compareResult.v2.version} (Target)</h4>
                  <div className="p-3 bg-surface border border-border rounded-xl">
                    <p className="font-semibold text-text">{compareResult.v2.name}</p>
                    <p className="text-xs text-text-light mt-1">{compareResult.v2.description || "No description provided."}</p>
                  </div>
                </div>
              </div>

              {/* Permission Diff */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-light uppercase tracking-wider">Permission Changes</h4>

                <div className="grid grid-cols-3 gap-4">
                  {/* Added */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-green-700 flex items-center gap-1">
                      <span className="p-1 rounded-full bg-green-100 text-green-700 text-[10px]">+</span>
                      Added ({compareResult.diff.added.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {compareResult.diff.added.map((k: string) => (
                        <span key={k} className="text-[10px] font-semibold px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200">
                          {k}
                        </span>
                      ))}
                      {compareResult.diff.added.length === 0 && (
                        <span className="text-xs text-text-light italic">None</span>
                      )}
                    </div>
                  </div>

                  {/* Removed */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-red-700 flex items-center gap-1">
                      <span className="p-1 rounded-full bg-red-100 text-red-700 text-[10px]">-</span>
                      Removed ({compareResult.diff.removed.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {compareResult.diff.removed.map((k: string) => (
                        <span key={k} className="text-[10px] font-semibold px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200">
                          {k}
                        </span>
                      ))}
                      {compareResult.diff.removed.length === 0 && (
                        <span className="text-xs text-text-light italic">None</span>
                      )}
                    </div>
                  </div>

                  {/* Unchanged */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-text-light flex items-center gap-1">
                      <span className="p-1 rounded-full bg-gray-100 text-text-light text-[10px]">=</span>
                      Retained ({compareResult.diff.unchanged.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                      {compareResult.diff.unchanged.map((k: string) => (
                        <span key={k} className="text-[10px] font-semibold px-2 py-1 rounded bg-gray-50 text-text-light border border-gray-200">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Assign Role Modal */}
      <Modal
        open={assignOpen}
        title={`Assign Role — ${assignRole?.name || ""}`}
        onClose={() => setAssignOpen(false)}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text">Select Administrator</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none transition focus:border-primary text-sm text-text"
              required
            >
              <option value="">Choose User...</option>
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text">Expiration Date (Optional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none transition focus:border-primary text-sm text-text"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedUserId}>
              Assign Role
            </Button>
          </div>
        </form>
      </Modal>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 max-w-md bg-zinc-900/95 text-white px-4 py-3.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <div className="p-2 rounded-xl bg-white/10 text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-white/90 leading-tight">Action Disabled</span>
            <span className="text-[11px] text-white/70 leading-normal">{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white/40 hover:text-white/80 text-sm ml-2 self-start p-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
