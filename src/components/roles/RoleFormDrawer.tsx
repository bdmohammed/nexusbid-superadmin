"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Key,
  Eye,
  MessageSquare,
  History,
  Clock,
  Users,
  Lock,
  ArrowRight,
  HelpCircle,
  Search,
  Star,
  ChevronDown,
  ChevronRight,
  Send,
  RefreshCw,
  Plus,
  CheckCircle,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Role } from "@/features/rbac/types";
import dayjs from "dayjs";
import { toast } from "sonner";

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
        parts[parts.length - 1].charAt(0).toUpperCase() +
        parts[parts.length - 1].slice(1).toLowerCase();
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

interface RoleFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editingRole: Role | null;
  viewOnly: boolean;
  roleName: string;
  setRoleName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  selectedPermissions: string[];
  setSelectedPermissions: React.Dispatch<React.SetStateAction<string[]>>;
  modules: any[];
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  // Extra drawer state
  versions: any[];
  commentsList: any[];
  loadingComments: boolean;
  activityLogsList: any[];
  loadingActivityLogs: boolean;
  onAddComment: (e: React.FormEvent) => void;
  newCommentText: string;
  setNewCommentText: (val: string) => void;
  onOpenSubmitReviewModal: (roleOrVersion: any) => void;
  onOpenReviewActionModal: (role: any, reviewId?: string) => void;
  onToggleLock: (version: any) => void;
}

export const RoleFormDrawer: React.FC<RoleFormDrawerProps> = ({
  isOpen,
  onClose,
  editingRole,
  viewOnly,
  roleName,
  setRoleName,
  description,
  setDescription,
  selectedPermissions,
  setSelectedPermissions,
  modules,
  submitting,
  onSubmit,
  versions,
  commentsList,
  loadingComments,
  activityLogsList,
  loadingActivityLogs,
  onAddComment,
  newCommentText,
  setNewCommentText,
  onOpenSubmitReviewModal,
  onOpenReviewActionModal,
  onToggleLock,
}) => {
  const [drawerTab, setDrawerTab] = useState<
    | "general"
    | "permissions"
    | "review"
    | "comments"
    | "versions"
    | "activity"
    | "users"
  >("general");

  const [starredPermissions, setStarredPermissions] = useState<string[]>([]);
  const [permSearch, setPermSearch] = useState("");
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [isNewDraftMode, setIsNewDraftMode] = useState(false);

  const roleId = editingRole?.id || (editingRole as any)?.roleId;

  useEffect(() => {
    if (isOpen) {
      setDrawerTab("general");
      setIsNewDraftMode(false);
    }
  }, [isOpen, roleId]);

  const initialName = editingRole?.name || "";
  const initialDescription = (editingRole?.description || "")
    .replace(/\[ReplacesRole:\s*([0-9a-fA-F-]+)\]/, "")
    .trim();

  const isPermsUnchanged = useMemo(() => {
    if (!editingRole) return false;
    const rawOrig =
      (editingRole as any)?.permissionKeys || editingRole?.permissions || [];
    const origPerms = rawOrig
      .map((p: any) =>
        typeof p === "string" ? p : p?.permissionKey || p?.key || p?.slug || "",
      )
      .filter(Boolean)
      .slice()
      .sort();
    const currPerms = selectedPermissions.slice().sort();

    if (origPerms.length !== currPerms.length) return false;
    return origPerms.every(
      (val: string, idx: number) => val === currPerms[idx],
    );
  }, [editingRole, selectedPermissions]);

  if (!isOpen) return null;

  const isSavedInDb = Boolean(roleId);
  const isGeneralFilled = Boolean(roleName.trim() && description.trim());
  const isPermissionsUnlocked = isGeneralFilled;
  const hasPermissionsSelected = selectedPermissions.length > 0;
  const isReviewUnlocked = isGeneralFilled && hasPermissionsSelected;

  const isGovernanceSubmitted =
    editingRole?.versionStatus === "PENDING_REVIEW" ||
    editingRole?.versionStatus === "SUBMITTED" ||
    editingRole?.versionStatus === "IN_REVIEW";

  const isApproved = editingRole?.versionStatus === "APPROVED";

  const isCommentsUnlocked = isSavedInDb;
  const isVersionsUnlocked = isSavedInDb;
  const isActivityUnlocked = isSavedInDb;
  const isUsersUnlocked =
    isSavedInDb && (editingRole?.status === "ACTIVE" || isApproved);

  const hasFormChanges = Boolean(
    !editingRole ||
    isNewDraftMode ||
    roleName.trim() !== initialName.trim() ||
    description.trim() !== initialDescription ||
    !isPermsUnchanged,
  );

  const isFormReadOnly =
    viewOnly || isGovernanceSubmitted || (isApproved && !isNewDraftMode);

  const handleStartNewDraft = () => {
    setIsNewDraftMode(true);
    setDrawerTab("general");
    toast.info(
      "New draft mode activated! Modify role parameters and click 'Create New Draft Version'.",
    );
  };

  function toggleStar(key: string) {
    setStarredPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function toggleModuleFullAccess(mod: any) {
    const modPermKeys = mod.permissions.map((p: any) => p.key);
    const allSelected = modPermKeys.every((k: string) =>
      selectedPermissions.includes(k),
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((k) => !modPermKeys.includes(k)),
      );
    } else {
      const toAdd = modPermKeys.filter(
        (k: string) => !selectedPermissions.includes(k),
      );
      setSelectedPermissions((prev) => [...prev, ...toAdd]);
    }
  }

  function handlePresetChange(presetType: string) {
    const allModuleKeys = modules.flatMap((m) =>
      (m.permissions || []).map((p: any) => p.key),
    );

    if (presetType === "super-admin") {
      setSelectedPermissions(allModuleKeys);
    } else if (presetType === "role-manager") {
      const matched = allModuleKeys.filter((k: string) => {
        const upper = k.toUpperCase().replace(/\./g, "_");
        return (
          upper.includes("ROLE") ||
          upper.includes("RBAC") ||
          upper.includes("USER") ||
          upper.includes("PERMISSION")
        );
      });
      setSelectedPermissions(matched.length > 0 ? matched : allModuleKeys);
    } else if (presetType === "audit-only") {
      const matched = allModuleKeys.filter((k: string) => {
        const upper = k.toUpperCase().replace(/\./g, "_");
        return (
          upper.includes("VIEW") ||
          upper.includes("AUDIT") ||
          upper.includes("READ") ||
          upper.includes("LOG")
        );
      });
      setSelectedPermissions(matched.length > 0 ? matched : allModuleKeys);
    } else if (presetType === "clear") {
      setSelectedPermissions([]);
    }
  }

  function togglePermission(key: string) {
    const meta = getPermissionMetadata(key, "");
    const isCurrentlySelected = selectedPermissions.includes(key);
    let newSelected = [...selectedPermissions];

    if (isCurrentlySelected) {
      newSelected = newSelected.filter((k) => k !== key);
    } else {
      if (meta.category === "dangerous") {
        const confirmMsg = `⚠️ WARNING: "${meta.label}" is a dangerous permission. Are you sure you want to enable this?`;
        if (!window.confirm(confirmMsg)) return;
      }
      newSelected.push(key);
      meta.dependencies.forEach((depKey) => {
        const depExists = modules.some((m) =>
          m.permissions.some((p: any) => p.key === depKey),
        );
        if (depExists && !newSelected.includes(depKey)) {
          newSelected.push(depKey);
        }
      });
    }
    setSelectedPermissions(newSelected);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-5xl bg-surface h-full shadow-2xl border-l border-border flex flex-col animate-slide-in-right text-text">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6 shrink-0 bg-background/50">
          <div>
            <h2 className="text-xl font-bold text-text">
              {viewOnly
                ? `Role Details — ${roleName}`
                : editingRole
                  ? `Edit Governance Role — ${editingRole.name}`
                  : "Create New Governance Role Draft"}
            </h2>
            <p className="text-xs text-text-light mt-1">
              {viewOnly
                ? "Viewing permissions, version logs, and assignment rules for this role."
                : "Follow the step-by-step workspace tabs to define role metadata, permission keys, and submit for governance review."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-background text-text-light hover:text-text cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 7-Tab Navigation Bar */}
        <div className="flex items-center gap-1 border-b border-border bg-background/60 px-6 py-2 shrink-0 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setDrawerTab("general")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              drawerTab === "general"
                ? "bg-primary text-white shadow-sm"
                : "text-text-light hover:text-text hover:bg-surface"
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> General
          </button>
          <button
            type="button"
            disabled={!isPermissionsUnlocked}
            onClick={() => isPermissionsUnlocked && setDrawerTab("permissions")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              drawerTab === "permissions"
                ? "bg-primary text-white shadow-sm cursor-pointer"
                : isPermissionsUnlocked
                  ? "text-text-light hover:text-text hover:bg-surface cursor-pointer"
                  : "text-text-light/40 opacity-50 cursor-not-allowed bg-background/30"
            }`}
          >
            <Key className="h-3.5 w-3.5" /> Permissions (
            {selectedPermissions.length})
            {!isPermissionsUnlocked && (
              <Lock className="h-3 w-3 ml-0.5 text-text-light/50" />
            )}
          </button>
          <button
            type="button"
            disabled={!isReviewUnlocked}
            onClick={() => isReviewUnlocked && setDrawerTab("review")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              drawerTab === "review"
                ? "bg-primary text-white shadow-sm cursor-pointer"
                : isReviewUnlocked
                  ? "text-text-light hover:text-text hover:bg-surface cursor-pointer"
                  : "text-text-light/40 opacity-50 cursor-not-allowed bg-background/30"
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> Review
            {!isReviewUnlocked && (
              <Lock className="h-3 w-3 ml-0.5 text-text-light/50" />
            )}
          </button>
          <button
            type="button"
            disabled={!isCommentsUnlocked}
            onClick={() => isCommentsUnlocked && setDrawerTab("comments")}
            title={
              !isCommentsUnlocked
                ? "Save role draft first to view or post notes"
                : undefined
            }
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              drawerTab === "comments"
                ? "bg-primary text-white shadow-sm cursor-pointer"
                : isCommentsUnlocked
                  ? "text-text-light hover:text-text hover:bg-surface cursor-pointer"
                  : "text-text-light/40 opacity-50 cursor-not-allowed bg-background/30"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" /> Comments
            {!isCommentsUnlocked && (
              <Lock className="h-3 w-3 ml-0.5 text-text-light/50" />
            )}
          </button>
          <button
            type="button"
            disabled={!isVersionsUnlocked}
            onClick={() => isVersionsUnlocked && setDrawerTab("versions")}
            title={
              !isVersionsUnlocked
                ? "Save role draft first to view version history"
                : undefined
            }
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              drawerTab === "versions"
                ? "bg-primary text-white shadow-sm cursor-pointer"
                : isVersionsUnlocked
                  ? "text-text-light hover:text-text hover:bg-surface cursor-pointer"
                  : "text-text-light/40 opacity-50 cursor-not-allowed bg-background/30"
            }`}
          >
            <History className="h-3.5 w-3.5" /> Versions
            {!isVersionsUnlocked && (
              <Lock className="h-3 w-3 ml-0.5 text-text-light/50" />
            )}
          </button>
          <button
            type="button"
            disabled={!isActivityUnlocked}
            onClick={() => isActivityUnlocked && setDrawerTab("activity")}
            title={
              !isActivityUnlocked
                ? "Save role draft first to view activity log"
                : undefined
            }
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              drawerTab === "activity"
                ? "bg-primary text-white shadow-sm cursor-pointer"
                : isActivityUnlocked
                  ? "text-text-light hover:text-text hover:bg-surface cursor-pointer"
                  : "text-text-light/40 opacity-50 cursor-not-allowed bg-background/30"
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Activity Log
            {!isActivityUnlocked && (
              <Lock className="h-3 w-3 ml-0.5 text-text-light/50" />
            )}
          </button>
          <button
            type="button"
            disabled={!isUsersUnlocked}
            onClick={() => isUsersUnlocked && setDrawerTab("users")}
            title={
              !isUsersUnlocked
                ? "Role must be saved & APPROVED/ACTIVE to assign users"
                : undefined
            }
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              drawerTab === "users"
                ? "bg-primary text-white shadow-sm cursor-pointer"
                : isUsersUnlocked
                  ? "text-text-light hover:text-text hover:bg-surface cursor-pointer"
                  : "text-text-light/40 opacity-50 cursor-not-allowed bg-background/30"
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Assigned Users
            {!isUsersUnlocked && (
              <Lock className="h-3 w-3 ml-0.5 text-text-light/50" />
            )}
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Tab 1: General */}
          {drawerTab === "general" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Compliance Officer"
                    required
                    disabled={isFormReadOnly}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none transition focus:border-primary text-sm text-text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Responsibilities and access scope of this role..."
                    required
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none transition focus:border-primary text-sm text-text resize-none"
                    disabled={isFormReadOnly}
                  />
                </div>
                {editingRole && (
                  <div className="p-4 bg-background border border-border rounded-2xl space-y-2 text-xs text-text-light">
                    <div className="flex justify-between">
                      <span className="font-semibold text-text">
                        Active Version:
                      </span>
                      <span className="font-bold text-primary">
                        v
                        {editingRole.versionNumber ||
                          editingRole.version ||
                          "0.1"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-text">
                        System Role:
                      </span>
                      <span>
                        {editingRole.isSystemRole ? "Yes (Read-only)" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-text">Status:</span>
                      <Badge
                        color={
                          editingRole.status === "ACTIVE" ? "green" : "yellow"
                        }
                      >
                        {editingRole.status}
                      </Badge>
                    </div>
                  </div>
                )}

                {!isFormReadOnly && (
                  <div className="pt-4 flex items-center gap-3 border-t border-border/40">
                    <Button
                      type="button"
                      disabled={!isGeneralFilled}
                      onClick={() => setDrawerTab("permissions")}
                      className="flex items-center gap-2 text-xs"
                    >
                      Next: Assign Permissions{" "}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Permissions */}
          {drawerTab === "permissions" && (
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-border">
                {!isFormReadOnly && (
                  <div className="space-y-3 rounded-2xl border border-border p-4 bg-background/50">
                    <div className="flex items-center gap-2 text-sm font-semibold text-text">
                      <HelpCircle className="h-4 w-4 text-primary" /> Quick
                      Presets
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handlePresetChange("super-admin")}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-primary transition font-medium cursor-pointer"
                      >
                        Super Admin (All)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetChange("role-manager")}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-primary transition font-medium cursor-pointer"
                      >
                        RBAC Manager
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetChange("audit-only")}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-primary transition font-medium cursor-pointer"
                      >
                        Auditor
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetChange("clear")}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-rose-400 hover:bg-rose-50 text-rose-500 transition font-medium cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-light" />
                  <input
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    placeholder="Search permissions by key, label, or module..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-surface text-xs text-text focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-4">
                  {modules.map((mod) => {
                    const formattedPerms = (mod.permissions || []).map(
                      (p: any) => getPermissionMetadata(p.key, p.description),
                    );
                    const matches = formattedPerms.filter(
                      (p: any) =>
                        p.key
                          .toLowerCase()
                          .includes(permSearch.toLowerCase()) ||
                        p.label
                          .toLowerCase()
                          .includes(permSearch.toLowerCase()),
                    );
                    if (matches.length === 0) return null;

                    const isExpanded =
                      permSearch.length > 0 || expandedModules.includes(mod.id);
                    const modSelectedKeys = matches.map((p: any) => p.key);
                    const modSelectedCount = modSelectedKeys.filter(
                      (k: string) => selectedPermissions.includes(k),
                    ).length;

                    return (
                      <div
                        key={mod.id}
                        className="rounded-2xl border border-border bg-surface overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-3.5 bg-background/50 border-b border-border">
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
                              <ChevronDown className="h-4 w-4 text-text-light" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-text-light" />
                            )}
                            <span>{mod.name}</span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {modSelectedCount}/{modSelectedKeys.length}
                            </span>
                          </button>

                          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-text-light">
                            <input
                              type="checkbox"
                              checked={
                                modSelectedCount === modSelectedKeys.length &&
                                modSelectedKeys.length > 0
                              }
                              onChange={() => toggleModuleFullAccess(mod)}
                              disabled={isFormReadOnly}
                              className="h-3.5 w-3.5 rounded accent-primary cursor-pointer"
                            />
                            <span>Full Access</span>
                          </label>
                        </div>

                        {isExpanded && (
                          <div className="p-4 grid gap-2 sm:grid-cols-2">
                            {matches.map((perm: any) => (
                              <div
                                key={perm.key}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-background/40 transition text-xs"
                              >
                                <label className="flex items-center gap-2 cursor-pointer flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(
                                      perm.key,
                                    )}
                                    onChange={() => togglePermission(perm.key)}
                                    disabled={isFormReadOnly}
                                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                                  />
                                  <div>
                                    <span className="font-semibold text-text block">
                                      {perm.label}
                                    </span>
                                    <span className="text-[10px] text-text-light block font-mono">
                                      {perm.key}
                                    </span>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!isFormReadOnly && (
                  <div className="pt-4 flex items-center justify-between border-t border-border/40">
                    <span className="text-xs text-text-light">
                      {selectedPermissions.length} permission
                      {selectedPermissions.length === 1 ? "" : "s"} selected
                    </span>
                    <Button
                      type="button"
                      disabled={!isReviewUnlocked}
                      onClick={() => setDrawerTab("review")}
                      className="flex items-center gap-2 text-xs"
                    >
                      Next: Governance Review <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Review */}
          {drawerTab === "review" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl">
              <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-text">
                      Maker-Checker Governance Review
                    </h3>
                    <p className="text-xs text-text-light">
                      Submit draft version to an assigned reviewer for approval.
                    </p>
                  </div>
                  <Badge
                    color={
                      editingRole?.versionStatus === "APPROVED"
                        ? "green"
                        : isGovernanceSubmitted
                          ? "indigo"
                          : "yellow"
                    }
                  >
                    {editingRole?.versionStatus ||
                      (isGovernanceSubmitted ? "IN REVIEW" : "DRAFT")}
                  </Badge>
                </div>

                <div className="space-y-4 border-t border-border pt-4">
                  {isApproved ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-emerald-700 dark:text-emerald-400">
                          ● Status: Governance Approved & Released
                        </div>
                        <div className="text-text-light mt-0.5">
                          This role version has passed Maker-Checker review and
                          is active in production.
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color="green">APPROVED</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={Plus}
                          onClick={handleStartNewDraft}
                        >
                          Create New Draft
                        </Button>
                      </div>
                    </div>
                  ) : !isGovernanceSubmitted ? (
                    <div className="space-y-2">
                      <Button
                        disabled={!isSavedInDb}
                        onClick={() => {
                          if (editingRole && isSavedInDb) {
                            onOpenSubmitReviewModal(editingRole);
                          } else {
                            toast.error(
                              "Please create and save draft role first before submitting for governance review.",
                            );
                          }
                        }}
                      >
                        Submit Draft for Governance Review
                      </Button>
                      {!isSavedInDb && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                          ⚠️ Please click "Create Draft" in the footer first
                          before submitting for review.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-indigo-700 dark:text-indigo-300">
                          ● Status: Pending Reviewer Decision
                        </div>
                        <div className="text-text-light mt-0.5">
                          Assigned reviewers must approve or reject this role
                          version.
                        </div>
                      </div>
                      <Button
                        size="sm"
                        leftIcon={CheckCircle}
                        onClick={() => {
                          const revId =
                            (editingRole as any)?.reviews?.[0]?.id ||
                            (editingRole as any)?.reviewId;
                          onOpenReviewActionModal(editingRole, revId);
                        }}
                      >
                        Execute Decision
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Comments */}
          {drawerTab === "comments" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />{" "}
                    Governance Discussion Thread
                  </h3>
                  <p className="text-xs text-text-light">
                    Post review notes, questions, or change rationales.
                  </p>
                </div>
                <Badge color="indigo">{commentsList.length} Notes</Badge>
              </div>

              <form
                onSubmit={onAddComment}
                className="space-y-3 bg-surface p-4 rounded-2xl border border-border"
              >
                <textarea
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Type a note or rationale..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-text focus:outline-none focus:border-primary resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    leftIcon={Send}
                    disabled={!newCommentText.trim()}
                  >
                    Post Note
                  </Button>
                </div>
              </form>

              <div className="space-y-3">
                {loadingComments ? (
                  <div className="p-8 text-center text-xs text-text-light flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-primary" />{" "}
                    Loading comments...
                  </div>
                ) : commentsList.length === 0 ? (
                  <div className="p-6 border border-dashed border-border rounded-xl text-center text-xs text-text-light italic">
                    No discussion notes yet.
                  </div>
                ) : (
                  commentsList.map((c: any) => (
                    <div
                      key={c.id}
                      className="p-3.5 bg-background border border-border rounded-xl text-xs space-y-1"
                    >
                      <div className="flex justify-between font-semibold text-text">
                        <span>{c.user?.name || "Administrator"}</span>
                        <span className="text-[10px] text-text-light">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-text">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Versions */}
          {drawerTab === "versions" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" /> Role Version
                    History
                  </h3>
                  <p className="text-xs text-text-light">
                    Audit past version releases, statuses, and governance locks.
                  </p>
                </div>
                <Badge color="indigo">{versions.length} Releases</Badge>
              </div>

              <div className="space-y-3">
                {versions.length === 0 ? (
                  <div className="p-6 border border-dashed border-border rounded-xl text-center text-xs text-text-light italic">
                    No previous version records found.
                  </div>
                ) : (
                  versions.map((v: any) => (
                    <div
                      key={v.id || v.version}
                      className="p-4 bg-surface border border-border rounded-2xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-text">
                            v{v.versionNumber || v.version || "1.0"}
                          </span>
                          <Badge
                            color={
                              v.status === "APPROVED"
                                ? "green"
                                : v.status === "DRAFT"
                                  ? "yellow"
                                  : v.status === "SUPERSEDED"
                                    ? "gray"
                                    : "indigo"
                            }
                          >
                            {v.status || "RELEASED"}
                          </Badge>
                          {v.isLocked && (
                            <span className="flex items-center gap-1 text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-semibold border border-rose-200">
                              <Lock className="h-3 w-3" /> Locked
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-text-light font-mono">
                          {v.createdAt
                            ? dayjs(v.createdAt).format("MMM DD, YYYY HH:mm")
                            : "N/A"}
                        </span>
                      </div>

                      <p className="text-text-light text-xs">
                        {v.description ||
                          "Version snapshot updated during governance workflow."}
                      </p>

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-text-light">
                        <span>
                          Permissions:{" "}
                          <strong className="text-text">
                            {(v.permissionKeys || v.permissions || []).length}{" "}
                            keys
                          </strong>
                        </span>
                        <span>
                          Author:{" "}
                          <strong className="text-text">
                            {v.createdByUser?.name || "Administrator"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 6: Activity Log */}
          {drawerTab === "activity" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" /> Role Activity Log
                    & Audit Trail
                  </h3>
                  <p className="text-xs text-text-light">
                    Forensic timeline of role creations, permission
                    modifications, and reviews.
                  </p>
                </div>
                <Badge color="indigo">{activityLogsList.length} Events</Badge>
              </div>

              <div className="space-y-3">
                {loadingActivityLogs ? (
                  <div className="p-8 text-center text-xs text-text-light flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-primary" />{" "}
                    Loading activity log...
                  </div>
                ) : activityLogsList.length === 0 ? (
                  <div className="p-6 border border-dashed border-border rounded-xl text-center text-xs text-text-light italic">
                    No activity logs recorded yet.
                  </div>
                ) : (
                  activityLogsList.map((log: any) => (
                    <div
                      key={log.id || Math.random()}
                      className="p-3.5 bg-background border border-border rounded-xl text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center font-semibold text-text">
                        <span className="font-bold text-primary">
                          {log.action || "SYSTEM_EVENT"}
                        </span>
                        <span className="text-[10px] text-text-light">
                          {log.createdAt
                            ? dayjs(log.createdAt).format("MMM DD, YYYY HH:mm")
                            : "N/A"}
                        </span>
                      </div>
                      <p className="text-text text-xs">
                        Actor:{" "}
                        <span className="font-medium">
                          {log.actorEmail || log.user?.email || "System"}
                        </span>
                      </p>
                      {log.metadata && (
                        <pre className="p-2 rounded bg-surface border border-border text-[10px] font-mono text-text-light overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 7: Assigned Users */}
          {drawerTab === "users" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Assigned Users
                  </h3>
                  <p className="text-xs text-text-light">
                    Administrators currently holding this active governance
                    role.
                  </p>
                </div>
                <Badge color="green">
                  {
                    (
                      (editingRole as any)?.userAssignments ||
                      (editingRole as any)?.assignedUsers ||
                      []
                    ).length
                  }{" "}
                  Users
                </Badge>
              </div>

              <div className="space-y-3">
                {(
                  (editingRole as any)?.userAssignments ||
                  (editingRole as any)?.assignedUsers ||
                  []
                ).length === 0 ? (
                  <div className="p-6 border border-dashed border-border rounded-xl text-center text-xs text-text-light italic">
                    No active users assigned to this role yet.
                  </div>
                ) : (
                  (
                    (editingRole as any)?.userAssignments ||
                    (editingRole as any)?.assignedUsers ||
                    []
                  ).map((u: any) => (
                    <div
                      key={u.id}
                      className="p-3.5 bg-background border border-border rounded-xl text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-text block">
                          {u.user?.name || u.name || "Administrator"}
                        </span>
                        <span className="text-[11px] text-text-light font-mono">
                          {u.user?.email || u.email}
                        </span>
                      </div>
                      <Badge color="green">ACTIVE</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        {isApproved && !isNewDraftMode ? (
          <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-3 shrink-0">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={handleStartNewDraft}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create New Draft Version (v
              {(editingRole?.version || 1) + 1})
            </Button>
          </div>
        ) : (
          !isFormReadOnly && (
            <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={onSubmit}
                disabled={
                  submitting ||
                  !isGeneralFilled ||
                  (!hasFormChanges && !isNewDraftMode)
                }
              >
                {submitting
                  ? "Saving..."
                  : isNewDraftMode
                    ? "Create New Draft Version"
                    : editingRole
                      ? "Save Changes"
                      : "Create Draft"}
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
};
