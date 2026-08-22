"use client";

import { useEffect, useMemo,useState } from "react";
import dayjs from "dayjs";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Info,
  Key,
  Save,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import ReactSelect from "react-select";

import type {
  CreateAssignmentDto,
  PermissionModule,
  Role,
} from "@/features/rbac/types";
import type { SingleValue } from "react-select";
import Button from "@/components/ui/Button";
import { rbacApi } from "@/features/rbac/api/api";
import { useThemeStore } from "@/store/theme.store";

export interface RoleCreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAssignmentDto) => void;
}

interface SelectOption {
  value: string;
  label: string;
}

interface FormattedPermission {
  id: string;
  key: string;
  label: string;
  description: string;
  category: "basic" | "admin" | "dangerous";
  dependencies: string[];
}

function getPermissionMetadata(
  key: string,
  desc?: string,
): FormattedPermission {
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
  else if (normKey === "NOTIFICATION_PREFERENCE_MANAGE")
    label = "Manage Notification Preferences";
  else if (normKey === "SYSTEM_CACHE_MANAGE") label = "Manage Cache";
  else if (normKey === "TENDER_VIEW") label = "View Tenders";
  else if (normKey === "TENDER_CREATE") label = "Create Tenders";
  else if (normKey === "TENDER_UPDATE") label = "Update Tenders";
  else if (normKey === "TENDER_DELETE") label = "Delete Tenders";
  else {
    const parts = normKey.split("_");
    if (parts.length >= 2) {
      const act =
        parts[parts.length - 1]!.charAt(0).toUpperCase() +
        parts[parts.length - 1]!.slice(1).toLowerCase();
      const mod = parts
        .slice(0, parts.length - 1)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(" ");
      label = `${act} ${mod}`;
    } else {
      label = key
        .replace(/[_\.]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
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

  return {
    id: key,
    key,
    label,
    description:
      desc || `Grants permission to perform ${label.toLowerCase()} operations.`,
    category,
    dependencies: [],
  };
}

export default function RoleCreateDrawer({
  open,
  onClose,
  onSubmit,
}: RoleCreateDrawerProps) {
  const currentTheme = useThemeStore((state) => state.theme);
  const isDark = currentTheme === "dark";

  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  // Configuration Fields
  const [effectiveDate, setEffectiveDate] = useState(
    dayjs().format("YYYY-MM-DDTHH:mm"),
  );
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");

  // Reviewer Selection
  const [reviewerId, setReviewerId] = useState("");

  // Permissions View States
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [permSearch, setPermSearch] = useState("");
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activePermissionDetail, setActivePermissionDetail] =
    useState<FormattedPermission | null>(null);

  const [previewPermissions, setPreviewPermissions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      setLoadingUsers(true);
      setError(null);
      try {
        const [rolesRes, usersRes, permsRes] = await Promise.all([
          rbacApi.getRoles(),
          rbacApi.getAssignableUsers({
            accountType: "admin",
            status: "active",
            permission: "role.view",
            limit: 100,
          }),
          rbacApi.getPermissions(),
        ]);

        const rawRoles = Array.isArray(rolesRes.data)
          ? rolesRes.data
          : rolesRes.data?.success && Array.isArray(rolesRes.data?.data)
            ? rolesRes.data.data
            : [];

        const activeRoles = rawRoles.filter(
          (r: any) => !r.status || r.status === "ACTIVE",
        );

        const usersData = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data?.success && Array.isArray(usersRes.data?.data)
            ? usersRes.data.data
            : [];

        const modulesData = Array.isArray(permsRes.data)
          ? permsRes.data
          : permsRes.data?.success && Array.isArray(permsRes.data?.data)
            ? permsRes.data.data
            : [];

        setRoles(activeRoles);
        setAssignableUsers(usersData);
        setModules(modulesData);

        if (activeRoles.length > 0) {
          setSelectedRoleId(activeRoles[0].id);
        }
        if (usersData.length > 0) {
          setSelectedUserId(usersData[0].id);
          if (usersData.length > 1) {
            setReviewerId(usersData[1].id);
          } else {
            setReviewerId(usersData[0].id);
          }
        }
        if (modulesData.length > 0) {
          setExpandedModules(modulesData.map((m: any) => m.id || m.name));
        }
      } catch (err: any) {
        console.error("Failed to load roles/users/permissions:", err);
        setError("Failed to fetch available users or roles. Please try again.");
      } finally {
        setLoadingUsers(false);
      }
    }

    if (open) {
      loadInitialData();
    }
  }, [open]);

  // Options for react-select
  const userOptions: SelectOption[] = useMemo(() => {
    return assignableUsers.map((user) => ({
      value: user.id,
      label: `${user.name || user.email} (${user.email}) — Active Verified Admin`,
    }));
  }, [assignableUsers]);

  const reviewerOptions: SelectOption[] = useMemo(() => {
    return assignableUsers
      .filter((u) => u.id !== selectedUserId)
      .map((user) => ({
        value: user.id,
        label: `${user.name || user.email} (${user.email}) — Active Verified Admin`,
      }));
  }, [assignableUsers, selectedUserId]);

  const roleOptions: SelectOption[] = useMemo(() => {
    return roles.map((role) => ({
      value: role.id,
      label: `${role.name} ${role.description ? `- ${role.description}` : ""}`,
    }));
  }, [roles]);

  // Update permissions preview whenever selected role changes
  useEffect(() => {
    const role = roles.find((r) => r.id === selectedRoleId);
    if (role) {
      const perms = role.permissionKeys || role.permissions || [];
      setPreviewPermissions(Array.isArray(perms) ? perms : []);
    } else {
      setPreviewPermissions([]);
    }
  }, [selectedRoleId, roles]);

  // Custom react-select styles
  const selectStyles = useMemo(
    () => ({
      control: (base: any, state: any) => ({
        ...base,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: state.isFocused
          ? "var(--color-primary, #6366f1)"
          : isDark
            ? "#374151"
            : "#e5e7eb",
        borderRadius: "0.75rem",
        padding: "2px 4px",
        boxShadow: state.isFocused
          ? "0 0 0 2px rgba(99, 102, 241, 0.2)"
          : "none",
        "&:hover": {
          borderColor: "var(--color-primary, #6366f1)",
        },
      }),
      menu: (base: any) => ({
        ...base,
        backgroundColor: isDark ? "#111827" : "#ffffff",
        borderRadius: "0.75rem",
        border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
        zIndex: 9999,
      }),
      option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "var(--color-primary, #6366f1)"
          : state.isFocused
            ? isDark
              ? "#1f2937"
              : "rgba(99, 102, 241, 0.08)"
            : "transparent",
        color: state.isSelected ? "#ffffff" : isDark ? "#f3f4f6" : "#1f2937",
        cursor: "pointer",
        fontSize: "0.75rem",
      }),
      singleValue: (base: any) => ({
        ...base,
        color: isDark ? "#f3f4f6" : "#1f2937",
        fontSize: "0.75rem",
      }),
      input: (base: any) => ({
        ...base,
        color: isDark ? "#f3f4f6" : "#1f2937",
        fontSize: "0.75rem",
      }),
      placeholder: (base: any) => ({
        ...base,
        color: isDark ? "#9ca3af" : "#6b7280",
        fontSize: "0.75rem",
      }),
    }),
    [isDark],
  );

  // Group permissions into modules + categories for read-only view
  const categorizedModules = useMemo(() => {
    if (previewPermissions.length === 0) return [];

    // Map keys to metadata
    const permMetaMap = new Map<string, FormattedPermission>();
    previewPermissions.forEach((key) => {
      permMetaMap.set(key, getPermissionMetadata(key));
    });

    if (modules.length > 0) {
      const result: Array<{
        id: string;
        name: string;
        matchedPermissions: FormattedPermission[];
      }> = [];

      const assignedSet = new Set(previewPermissions);
      const processedKeys = new Set<string>();

      modules.forEach((mod) => {
        const modPerms: FormattedPermission[] = [];
        (mod.permissions || []).forEach((p: any) => {
          const pKey = typeof p === "string" ? p : p.key;
          if (assignedSet.has(pKey)) {
            processedKeys.add(pKey);
            const desc = typeof p === "object" ? p.description : undefined;
            modPerms.push(getPermissionMetadata(pKey, desc));
          }
        });

        const matches = modPerms.filter(
          (p) =>
            !permSearch.trim() ||
            p.key.toLowerCase().includes(permSearch.toLowerCase()) ||
            p.label.toLowerCase().includes(permSearch.toLowerCase()) ||
            p.description.toLowerCase().includes(permSearch.toLowerCase()),
        );

        if (matches.length > 0) {
          result.push({
            id: mod.id || mod.name,
            name: mod.name,
            matchedPermissions: matches,
          });
        }
      });

      // Leftover permissions not explicitly in module definitions
      const leftoverKeys = previewPermissions.filter(
        (k) => !processedKeys.has(k),
      );
      if (leftoverKeys.length > 0) {
        const leftoverPerms = leftoverKeys.map((k) => getPermissionMetadata(k));
        const matches = leftoverPerms.filter(
          (p) =>
            !permSearch.trim() ||
            p.key.toLowerCase().includes(permSearch.toLowerCase()) ||
            p.label.toLowerCase().includes(permSearch.toLowerCase()),
        );
        if (matches.length > 0) {
          result.push({
            id: "system-other",
            name: "System & Core Operations",
            matchedPermissions: matches,
          });
        }
      }

      return result;
    } else {
      // Fallback if modules list is not loaded yet: group by single module
      const allPerms = previewPermissions.map((k) => getPermissionMetadata(k));
      const matches = allPerms.filter(
        (p) =>
          !permSearch.trim() ||
          p.key.toLowerCase().includes(permSearch.toLowerCase()) ||
          p.label.toLowerCase().includes(permSearch.toLowerCase()),
      );
      return matches.length > 0
        ? [
            {
              id: "all-permissions",
              name: "Role Effective Permissions",
              matchedPermissions: matches,
            },
          ]
        : [];
    }
  }, [previewPermissions, modules, permSearch]);

  function handleFormSubmit(status: "DRAFT" | "SUBMITTED") {
    setError(null);

    if (!selectedUserId) {
      setError("Please select a target administrator for role assignment.");
      return;
    }

    if (!selectedRoleId) {
      setError("Please select an active role to assign.");
      return;
    }

    if (hasExpiry && !expiryDate) {
      setError(
        "Please specify an expiration date & time for temporary access.",
      );
      return;
    }

    if (status === "SUBMITTED" && !reviewerId) {
      setError(
        "Please select an eligible administrator reviewer for Maker-Checker approval.",
      );
      return;
    }

    const payload: CreateAssignmentDto = {
      userId: selectedUserId,
      roleId: selectedRoleId,
      effectiveAt: effectiveDate
        ? new Date(effectiveDate).toISOString()
        : new Date().toISOString(),
      expiresAt:
        hasExpiry && expiryDate ? new Date(expiryDate).toISOString() : null,
      reason: reason.trim(),
      comment: comment.trim(),
      reviewerId,
      status,
    };

    onSubmit(payload);
    onClose();
  }

  if (!open) return null;

  const selectedUserOption =
    userOptions.find((o) => o.value === selectedUserId) || null;
  const selectedRoleOption =
    roleOptions.find((o) => o.value === selectedRoleId) || null;
  const selectedReviewerOption =
    reviewerOptions.find((o) => o.value === reviewerId) || null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-2xl flex-col bg-surface shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Configure Role Assignment</h2>
            </div>
            <p className="mt-1.5 text-xs text-text-light">
              Maker-Checker Governance Flow — Select user, role, effective
              dates, reason, and assign an administrator reviewer.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-background text-text-light hover:text-text cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 border border-red-200 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-400">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Select Target User with react-select */}
          <div className="space-y-2 rounded-2xl border border-border p-5 bg-background">
            <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> 1. Search & Select Administrator
            </label>

            {loadingUsers ? (
              <div className="h-10 rounded-xl border border-border bg-surface animate-pulse flex items-center px-4">
                <span className="text-xs text-text-light">
                  Loading administrators...
                </span>
              </div>
            ) : (
              <ReactSelect
                options={userOptions}
                value={selectedUserOption}
                onChange={(option: SingleValue<SelectOption>) =>
                  setSelectedUserId(option?.value || "")
                }
                placeholder="Search administrator by name or email..."
                styles={selectStyles}
                isSearchable
                isClearable={false}
              />
            )}
          </div>

          {/* Step 2: Select Active Role with react-select */}
          <div className="space-y-2 rounded-2xl border border-border p-5 bg-background">
            <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> 2. Select Active Role
            </label>

            <ReactSelect
              options={roleOptions}
              value={selectedRoleOption}
              onChange={(option: SingleValue<SelectOption>) =>
                setSelectedRoleId(option?.value || "")
              }
              placeholder="Search or select role..."
              styles={selectStyles}
              isSearchable
            />
          </div>

          {/* Step 3: Configure Assignment (Dates, Reason, Comment) */}
          <div className="space-y-4 rounded-2xl border border-border p-5 bg-background">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Clock className="h-4 w-4" /> 3. Configure Assignment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text">
                  Effective Date
                </label>
                <input
                  type="datetime-local"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-medium text-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasExpiry}
                    onChange={(e) => setHasExpiry(e.target.checked)}
                    className="h-3.5 w-3.5 rounded accent-primary border-border"
                  />
                  <span>Time-Bound Expiry</span>
                </label>
                {hasExpiry ? (
                  <input
                    type="datetime-local"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text"
                  />
                ) : (
                  <div className="h-[36px] rounded-xl border border-border bg-surface/50 px-3.5 flex items-center text-xs text-text-light">
                    Permanent Assignment
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text">
                Reason (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Project Onboarding, Temporary Coverage, Emergency Escalation"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text">
                Governance Comment
              </label>
              <textarea
                rows={2}
                placeholder="Provide governance justification notes for review record..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text"
              />
            </div>
          </div>

          {/* Step 4: Assign Reviewer with react-select */}
          <div className="space-y-2 rounded-2xl border border-border p-5 bg-background">
            <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> 4. Assign Reviewer
              (Maker-Checker)
            </label>

            <ReactSelect
              options={reviewerOptions}
              value={selectedReviewerOption}
              onChange={(option: SingleValue<SelectOption>) =>
                setReviewerId(option?.value || "")
              }
              placeholder="Search or select reviewer..."
              styles={selectStyles}
              isSearchable
            />
          </div>

          {/* Effective Permissions Preview Accordions (Read-Only) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Key className="h-4 w-4" />
                Effective Permissions Preview ({previewPermissions.length})
              </h3>

              {/* Permission Filter / Search Input */}
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-text-light" />
                <input
                  type="text"
                  placeholder="Filter permissions..."
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface pl-8 pr-3 py-1 text-[11px] outline-none focus:border-primary text-text"
                />
              </div>
            </div>

            {/* Read-Only Permission Modules Accordions */}
            {previewPermissions.length === 0 ? (
              <div className="rounded-2xl border border-border bg-background p-4 text-center">
                <p className="text-xs text-text-light italic">
                  No permissions configured for this role.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {categorizedModules.map((mod) => {
                  const isExpanded =
                    permSearch.length > 0 || expandedModules.includes(mod.id);

                  const basicPerms = mod.matchedPermissions.filter(
                    (p) => p.category === "basic",
                  );
                  const adminPerms = mod.matchedPermissions.filter(
                    (p) => p.category === "admin",
                  );
                  const dangerousPerms = mod.matchedPermissions.filter(
                    (p) => p.category === "dangerous",
                  );

                  return (
                    <div
                      key={mod.id}
                      className="rounded-2xl border border-border bg-surface overflow-hidden transition-all duration-200"
                    >
                      {/* Accordion Header */}
                      <div className="flex items-center justify-between p-3 bg-background/40 border-b border-border/40">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedModules((prev) =>
                              prev.includes(mod.id)
                                ? prev.filter((id) => id !== mod.id)
                                : [...prev, mod.id],
                            )
                          }
                          className="flex items-center gap-2 font-bold text-xs text-text cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-text-light" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-text-light" />
                          )}
                          <span>{mod.name}</span>
                        </button>

                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {mod.matchedPermissions.length} active
                        </span>
                      </div>

                      {/* Accordion Body — Read-Only Cards */}
                      {isExpanded && (
                        <div className="p-3 space-y-3 bg-surface divide-y divide-border/30">
                          {/* Basic Category */}
                          {basicPerms.length > 0 && (
                            <div className="pt-1">
                              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-green-600 bg-green-50 px-2 py-0.5 rounded-md mb-2 uppercase tracking-wide">
                                🟢 Basic
                              </span>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {basicPerms.map((perm) => (
                                  <div
                                    key={perm.key}
                                    className="flex items-center justify-between p-2 rounded-xl bg-background/40 border border-border/40"
                                  >
                                    <div className="truncate min-w-0 pr-2">
                                      <span className="text-xs font-semibold text-text block truncate">
                                        {perm.label}
                                      </span>
                                      <span className="text-[10px] text-text-light font-mono block truncate">
                                        {perm.key}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActivePermissionDetail(perm)
                                      }
                                      className="text-text-light hover:text-primary p-1 shrink-0 cursor-pointer"
                                      title="View Description"
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Administrative Category */}
                          {adminPerms.length > 0 && (
                            <div className="pt-2">
                              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mb-2 uppercase tracking-wide">
                                🟡 Administrative
                              </span>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {adminPerms.map((perm) => (
                                  <div
                                    key={perm.key}
                                    className="flex items-center justify-between p-2 rounded-xl bg-background/40 border border-border/40"
                                  >
                                    <div className="truncate min-w-0 pr-2">
                                      <span className="text-xs font-semibold text-text block truncate">
                                        {perm.label}
                                      </span>
                                      <span className="text-[10px] text-text-light font-mono block truncate">
                                        {perm.key}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActivePermissionDetail(perm)
                                      }
                                      className="text-text-light hover:text-primary p-1 shrink-0 cursor-pointer"
                                      title="View Description"
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Dangerous Category */}
                          {dangerousPerms.length > 0 && (
                            <div className="pt-2">
                              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-md mb-2 uppercase tracking-wide">
                                🔴 Dangerous
                              </span>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {dangerousPerms.map((perm) => (
                                  <div
                                    key={perm.key}
                                    className="flex items-center justify-between p-2 rounded-xl bg-background/40 border border-red-200/50"
                                  >
                                    <div className="truncate min-w-0 pr-2">
                                      <span className="text-xs font-semibold text-red-600 block truncate">
                                        {perm.label}
                                      </span>
                                      <span className="text-[10px] text-text-light font-mono block truncate">
                                        {perm.key}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActivePermissionDetail(perm)
                                      }
                                      className="text-text-light hover:text-red-500 p-1 shrink-0 cursor-pointer"
                                      title="View Description"
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
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
            )}
          </div>
        </div>

        {/* Permission Info Modal */}
        {activePermissionDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase font-mono">
                  {activePermissionDetail.key}
                </span>
                <button
                  type="button"
                  onClick={() => setActivePermissionDetail(null)}
                  className="text-text-light hover:text-text p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <h4 className="text-sm font-bold text-text">
                {activePermissionDetail.label}
              </h4>
              <p className="text-xs text-text-light leading-relaxed">
                {activePermissionDetail.description}
              </p>
              <div className="pt-2 text-right">
                <Button
                  size="sm"
                  onClick={() => setActivePermissionDetail(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border p-6 bg-surface">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              leftIcon={Save}
              onClick={() => handleFormSubmit("DRAFT")}
            >
              Create Draft
            </Button>

            <Button
              type="button"
              leftIcon={Send}
              onClick={() => handleFormSubmit("SUBMITTED")}
            >
              Submit For Review
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
