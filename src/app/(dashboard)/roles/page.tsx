//@ts-nocheck
"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { rbacApi } from "@/features/rbac/api/api";
import { Role } from "@/features/rbac/types";
import { useAuthStore } from "@/features/auth/store/store";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCategorizedRoles,
  useRbacStats,
  usePermissions as useRbacPermissions,
  useRoleVersions,
  useAssignableUsers,
} from "@/features/rbac/api/queries";
import {
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useCreateAssignment,
} from "@/features/rbac/api/mutations";

// Subcomponents
import { RolesStatsView } from "@/components/roles/RolesStatsView";
import { RolesListView } from "@/components/roles/RolesListView";
import { RoleFormDrawer } from "@/components/roles/RoleFormDrawer";
import {
  SubmitReviewModal,
  RoleReviewModal,
  RoleCompareModal,
  RoleAssignModal,
} from "@/components/roles/RoleGovernanceModals";

function RolesPageContent() {
  const { hasPermission, isInitializing } = usePermissions();
  const searchParams = useSearchParams();
  const [activeMainTab, setActiveMainTab] = useState<"stats" | "list">("stats");

  const canViewRoles =
    hasPermission("role.view") || hasPermission("role.manage");
  const canManageRoles = hasPermission("role.manage");

  useEffect(() => {
    const view = searchParams.get("view");
    if (view === "list") {
      setActiveMainTab("list");
    } else {
      setActiveMainTab("stats");
    }
  }, [searchParams]);

  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // React Query Hooks
  const {
    data: rawRoles = [],
    isLoading: loadingRoles,
    refetch: refetchRoles,
  } = useCategorizedRoles();
  const { data: statsData, isLoading: loadingStats } = useRbacStats();
  const { data: rawPermissions = [], isLoading: loadingPerms } =
    useRbacPermissions();

  const roles = useMemo(() => {
    return rawRoles.map((r: any) => {
      const perms = r.permissionKeys || r.permissions || [];
      return {
        ...r,
        id: r.id || r.roleId || r.name,
        permissions: perms,
        permissionKeys: perms,
      };
    });
  }, [rawRoles]);

  const stats = statsData || null;
  const modules = rawPermissions || [];
  const loading = loadingRoles || loadingStats || loadingPerms;

  // Drawer Form State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const editingRoleId = editingRole
    ? editingRole.id || (editingRole as any).roleId
    : "";
  const { data: versions = [] } = useRoleVersions(editingRoleId);

  // Drawer History / Comments / Activity
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [activityLogsList, setActivityLogsList] = useState<any[]>([]);
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(false);

  // Modal States
  const [submitReviewOpen, setSubmitReviewOpen] = useState(false);
  const [versionToSubmit, setVersionToSubmit] = useState<any | null>(null);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

  const [reviewActionOpen, setReviewActionOpen] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState("");
  const [reviewRoleName, setReviewRoleName] = useState("");
  const [reviewCreatorId, setReviewCreatorId] = useState("");
  const [reviewDecision, setReviewDecision] = useState<
    "APPROVED" | "REJECTED" | "CHANGES_REQUESTED"
  >("APPROVED");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewDetails, setReviewDetails] = useState<any | null>(null);

  const [compareOpen, setCompareOpen] = useState(false);
  const [compareRole, setCompareRole] = useState<Role | null>(null);
  const [compareV1, setCompareV1] = useState<number | "">("");
  const [compareV2, setCompareV2] = useState<number | "">("");
  const [compareResult, setCompareResult] = useState<any | null>(null);
  const [compareVersionsList, setCompareVersionsList] = useState<any[]>([]);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<Role | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // Drawer Detail Fetchers
  const fetchRoleComments = async (roleId: string) => {
    setLoadingComments(true);
    try {
      const res = await rbacApi.getRoleVersions(roleId);
      const versionList = res.data?.success ? res.data.data : [];
      let allComments: any[] = [];
      for (const v of versionList) {
        if (v.reviews && v.reviews.length > 0) {
          for (const rev of v.reviews) {
            const revId = rev.id || rev;
            if (typeof revId === "string") {
              const revRes = await rbacApi.getReviewDetails(revId);
              if (revRes.data?.success && revRes.data.data?.comments) {
                const mapped = revRes.data.data.comments.map((c: any) => ({
                  ...c,
                  version: v.version,
                }));
                allComments = [...allComments, ...mapped];
              }
            }
          }
        }
      }
      allComments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setCommentsList(allComments);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchRoleActivityLogs = async (role: any) => {
    setLoadingActivityLogs(true);
    try {
      const roleId = role.id || role.roleId;
      const res = await rbacApi.getForensicLogs({
        search: role.name || roleId,
        limit: 50,
      });
      let logs = res.data?.success ? res.data.data?.logs || [] : [];
      if (logs.length === 0) {
        logs = [
          {
            id: roleId,
            createdAt: role.createdAt || new Date().toISOString(),
            actorEmail: role.createdByUser?.email || "System User",
            action: `ROLE_${role.status || "CREATED"}`,
            metadata: {
              name: role.name,
              description: role.description,
              version: role.version || 1,
            },
          },
        ];
      }
      setActivityLogsList(logs);
    } catch (err) {
      console.error("Failed to load activity logs", err);
    } finally {
      setLoadingActivityLogs(false);
    }
  };

  useEffect(() => {
    if (drawerOpen && editingRole) {
      const roleId = editingRole.id || (editingRole as any).roleId;
      if (roleId) {
        fetchRoleComments(roleId);
        fetchRoleActivityLogs(editingRole);
      }
    }
  }, [drawerOpen, editingRole]);

  // Handlers for Drawer
  const handleOpenCreate = () => {
    if (!canManageRoles) {
      toast.error("You do not have permission to create roles.");
      return;
    }
    setEditingRole(null);
    setRoleName("");
    setDescription("");
    setSelectedPermissions([]);
    setViewOnly(false);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    const perms = (role as any).permissionKeys || role.permissions || [];
    setEditingRole({
      ...role,
      permissions: perms,
      permissionKeys: perms,
    });
    setRoleName(role.name);
    const cleanDesc = (role.description || "")
      .replace(/\[ReplacesRole:\s*([0-9a-fA-F-]+)\]/, "")
      .trim();
    setDescription(cleanDesc);

    if (role.slug === "super-admin") {
      const allKeys = modules.flatMap((m) =>
        (m.permissions || []).map((p: any) => p.key),
      );
      setSelectedPermissions(allKeys);
    } else {
      setSelectedPermissions(perms);
    }
    setViewOnly(!canManageRoles);
    setDrawerOpen(true);
  };

  const handleOpenView = (role: Role) => {
    handleOpenEdit(role);
    setViewOnly(true);
  };

  const handleDuplicate = (role: Role) => {
    if (!canManageRoles) {
      toast.error("You do not have permission to duplicate roles.");
      return;
    }
    handleOpenEdit(role);
    setEditingRole(null);
    setRoleName(`${role.name} (Copy)`);
    setViewOnly(false);
  };

  const deleteRoleMutation = useDeleteRole();
  const createAssignmentMutation = useCreateAssignment();

  const handleDeleteRole = async (id: string) => {
    if (!canManageRoles) {
      toast.error("You do not have permission to archive roles.");
      return;
    }
    if (
      confirm(
        "Are you sure you want to archive this role? Users with this role will lose permissions.",
      )
    ) {
      try {
        await deleteRoleMutation.mutateAsync(id);
        toast.success("Role archived successfully");
        queryClient.invalidateQueries({ queryKey: ["rbac"] });
      } catch (err: any) {
        toast.error(err.message || "Delete failed");
      }
    }
  };

  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageRoles) {
      toast.error("You do not have permission to modify roles.");
      return;
    }
    if (submitting) return;
    if (!roleName.trim() || !description.trim()) {
      toast.error("Role Name and Description are required.");
      return;
    }

    setSubmitting(true);
    const isUpdate = Boolean(editingRole);

    try {
      let resultRole: any = null;
      if (isUpdate && editingRole) {
        const targetRoleId = editingRole.id || (editingRole as any).roleId;
        const res = await updateRoleMutation.mutateAsync({
          id: targetRoleId,
          data: {
            name: roleName,
            description,
            permissions: selectedPermissions,
          },
        });
        resultRole = res;
        toast.success(`Role draft "${roleName}" saved successfully`);
      } else {
        const res = await createRoleMutation.mutateAsync({
          name: roleName,
          description,
          permissions: selectedPermissions,
        });
        resultRole = res;
        toast.success(`Role draft "${roleName}" created`);
      }

      if (resultRole) {
        const roleId =
          resultRole.id ||
          resultRole.roleId ||
          (editingRole && (editingRole.id || (editingRole as any).roleId));
        const perms =
          resultRole.permissionKeys ||
          resultRole.permissions ||
          selectedPermissions;
        setEditingRole({
          ...editingRole,
          ...resultRole,
          id: roleId,
          roleId,
          name: resultRole.name || roleName,
          description: resultRole.description || description,
          permissions: perms,
          permissionKeys: perms,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["rbac"] });
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !editingRole) return;
    try {
      const newComment = {
        id: Date.now().toString(),
        userId: currentUser?.id,
        user: {
          name: currentUser?.name || "Administrator",
          email: currentUser?.email || "",
        },
        action: "NOTE",
        comment: newCommentText.trim(),
        createdAt: new Date().toISOString(),
        version: editingRole.version || 1,
      };
      setCommentsList((prev) => [newComment, ...prev]);
      setNewCommentText("");
      toast.success("Comment posted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment");
    }
  };

  // Handlers for Modals
  const openSubmitReviewModal = async (roleOrVersion: any) => {
    const roleId = roleOrVersion.roleId || roleOrVersion.id;

    // Auto-save any updated permissions or draft metadata to DB before submitting for governance review
    if (editingRole && roleId && roleName.trim()) {
      try {
        const updatedRole = await updateRoleMutation.mutateAsync({
          id: roleId,
          data: {
            name: roleName,
            description,
            permissions: selectedPermissions,
          },
        });
        if (updatedRole) {
          const perms =
            updatedRole.permissionKeys ||
            updatedRole.permissions ||
            selectedPermissions;
          setEditingRole((prev: any) => ({
            ...prev,
            ...updatedRole,
            id: roleId,
            permissions: perms,
            permissionKeys: perms,
          }));
        }
      } catch (autoSaveErr) {
        console.error(
          "Auto-save permissions prior to submission error:",
          autoSaveErr,
        );
      }
    }

    let targetVersionId =
      roleOrVersion.versionId ||
      roleOrVersion.activeVersionId ||
      roleOrVersion.targetVersionId;

    if (roleId) {
      try {
        const versionsRes = await rbacApi.getRoleVersions(roleId);
        const versionList = versionsRes.data?.success
          ? versionsRes.data.data
          : [];
        if (versionList.length > 0) {
          const draftVer =
            versionList.find(
              (v: any) => v.status === "DRAFT" || v.status === "REOPENED",
            ) || versionList[0];
          if (draftVer) targetVersionId = draftVer.id;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setVersionToSubmit({
      ...roleOrVersion,
      targetVersionId: targetVersionId || roleOrVersion.id,
    });
    setSubmitReviewOpen(true);
    setSelectedReviewers([]);

    try {
      const res = await rbacApi.getAssignableUsers({
        accountType: "admin",
        status: "active",
        permission: "role.manage",
        limit: 100,
      });
      const rawUsers = (res.data.success && res.data.data) || [];
      const activeVerifiedAdmins = rawUsers.filter((u: any) => {
        const isAdminType =
          u.accountType === "admin" ||
          u.accountType === "system_admin" ||
          u.role === "admin";
        const isActive =
          (u.status?.toLowerCase() === "active" || u.isActive === true) &&
          !u.isBlocked;
        const isVerified = u.emailVerified !== false && u.isVerified !== false;
        return isAdminType && isActive && isVerified;
      });

      const usersToUse =
        activeVerifiedAdmins.length > 0 ? activeVerifiedAdmins : rawUsers;
      setAssignableUsers(usersToUse);

      const otherAdmins = usersToUse.filter(
        (u: any) => u.id !== currentUser?.id,
      );
      if (otherAdmins.length === 0 && usersToUse.length > 0) {
        setSelectedReviewers([currentUser?.id || usersToUse[0].id]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendForReview = async () => {
    if (selectedReviewers.length === 0 || !versionToSubmit) {
      toast.error("Please select at least one reviewer");
      return;
    }
    const versionId =
      versionToSubmit.targetVersionId ||
      versionToSubmit.versionId ||
      versionToSubmit.activeVersionId ||
      versionToSubmit.id;

    setSubmitting(true);
    const toastId = toast.loading(
      "Submitting role version for governance review...",
    );
    try {
      await rbacApi.submitVersion(versionId, selectedReviewers);
      setSubmitReviewOpen(false);
      toast.success("Submitted for governance review successfully!", {
        id: toastId,
      });
      queryClient.invalidateQueries({ queryKey: ["rbac"] });
      if (editingRole) {
        setEditingRole({
          ...editingRole,
          versionStatus: "PENDING_REVIEW",
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Submit review failed", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewActionModal = async (role: any, reviewId?: string) => {
    let rId = reviewId;
    const roleId = role?.id || (role as any)?.roleId;

    if (!rId && roleId) {
      try {
        const versionsRes = await rbacApi.getRoleVersions(roleId);
        const versionList = versionsRes.data?.success
          ? versionsRes.data.data
          : [];
        for (const v of versionList) {
          if (v.reviews && v.reviews.length > 0) {
            const pendingRev =
              v.reviews.find((r: any) => r.status === "PENDING") ||
              v.reviews[0];
            if (pendingRev) {
              rId = typeof pendingRev === "string" ? pendingRev : pendingRev.id;
              break;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load review ID for modal:", err);
      }
    }

    if (rId) {
      try {
        const revRes = await rbacApi.getReviewDetails(rId);
        if (revRes.data?.success && revRes.data.data) {
          setReviewDetails(revRes.data.data);
        }
      } catch (err) {
        console.error("Failed to load review details:", err);
      }
    } else {
      setReviewDetails(null);
    }

    if (assignableUsers.length === 0) {
      try {
        const res = await rbacApi.getAssignableUsers({
          accountType: "admin",
          status: "active",
          permission: "role.manage",
          limit: 100,
        });
        const rawUsers = (res.data?.success && res.data?.data) || [];
        setAssignableUsers(rawUsers);
      } catch (err) {
        console.error("Failed to load assignable users:", err);
      }
    }

    setActiveReviewId(rId || "");
    setReviewRoleName(role?.name || "Role Draft");
    setReviewCreatorId(
      role?.createdBy ||
        (role as any)?.createdByUserId ||
        (role as any)?.createdByUser?.id ||
        "",
    );
    setReviewDecision("APPROVED");
    setReviewComment("");
    setReviewActionOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewId) {
      toast.error("No active review session found.");
      return;
    }
    if (reviewDecision !== "APPROVED" && !reviewComment.trim()) {
      toast.error("Comment is required when rejecting or requesting changes.");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(
      `Submitting governance decision (${reviewDecision})...`,
    );
    try {
      await rbacApi.submitReview(
        activeReviewId,
        reviewDecision,
        reviewComment.trim(),
      );
      toast.success(`Role version ${reviewDecision.toLowerCase()}!`, {
        id: toastId,
      });
      setReviewActionOpen(false);
      setDrawerOpen(false);
      queryClient.invalidateQueries({ queryKey: ["rbac"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Review decision failed", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openCompareModal = async (role: Role) => {
    setCompareRole(role);
    setCompareV1("");
    setCompareV2("");
    setCompareResult(null);
    setCompareOpen(true);
    try {
      const res = await rbacApi.getRoleVersions(role.id);
      setCompareVersionsList((res.data?.success && res.data?.data) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompare = async () => {
    if (!compareRole || !compareV1 || !compareV2) return;
    try {
      const res = await rbacApi.compareVersions(
        compareRole.id,
        Number(compareV1),
        Number(compareV2),
      );
      setCompareResult(res.data?.success && res.data?.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Comparison failed");
    }
  };

  const openAssignModal = async (role: Role) => {
    if (!canManageRoles) {
      toast.error("You do not have permission to assign roles.");
      return;
    }
    setAssignRole(role);
    setAssignOpen(true);
    try {
      const res = await rbacApi.getAssignableUsers({
        accountType: "admin",
        status: "active",
        limit: 100,
      });
      setAssignableUsers((res.data?.success && res.data?.data) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !assignRole) return;

    setSubmitting(true);
    const toastId = toast.loading("Assigning role to user...");
    try {
      await createAssignmentMutation.mutateAsync({
        userId: selectedUserId,
        roleId: assignRole.id,
        expiresAt: expiresAt || null,
      });
      setAssignOpen(false);
      setSelectedUserId("");
      setExpiresAt("");
      toast.success("Role assigned successfully", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["rbac"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to assign role", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLock = async (version: any) => {
    if (!canManageRoles) {
      toast.error("You do not have permission to lock or unlock versions.");
      return;
    }
    try {
      if (version.lockedByUserId) {
        await rbacApi.unlockVersion(version.id);
        toast.success("Version unlocked");
      } else {
        await rbacApi.lockVersion(version.id);
        toast.success("Version locked");
      }
      queryClient.invalidateQueries({
        queryKey: rbacKeys.roleVersions(editingRoleId),
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lock action failed");
    }
  };
  const visibleRoles = useMemo(() => {
    const isSuperAdmin =
      currentUser?.roles?.includes("super-admin") ||
      (currentUser as any)?.isSuperAdmin;
    if (isSuperAdmin) return roles;

    const activeUserId = currentUser?.id;
    if (!activeUserId) return roles;

    return roles.filter((role: any) => {
      // 1. All Approved, Rejected, Active, System, or Archived finalized roles
      const isApprovedOrRejected =
        role.status === "ACTIVE" ||
        role.status === "APPROVED" ||
        role.status === "REJECTED" ||
        role.versionStatus === "APPROVED" ||
        role.versionStatus === "REJECTED" ||
        role.status === "ARCHIVED" ||
        role.isSystemRole;

      if (isApprovedOrRejected) return true;

      // 2. Own Draft Role
      const isOwnDraft =
        role.createdBy === activeUserId ||
        role.createdByUser?.id === activeUserId ||
        role.createdByUserId === activeUserId;

      if (isOwnDraft) return true;

      // 3. Assigned to Me (Reviewer)
      const isAssignedToMe =
        role.reviewerId === activeUserId ||
        role.reviewerIds?.includes(activeUserId) ||
        role.assignedReviewers?.some((rev: any) =>
          typeof rev === "string"
            ? rev === activeUserId
            : rev.id === activeUserId || rev.userId === activeUserId,
        ) ||
        role.reviews?.some((rev: any) =>
          typeof rev === "string"
            ? rev === activeUserId
            : rev.reviewerId === activeUserId ||
              rev.reviewer?.id === activeUserId,
        );

      return isAssignedToMe;
    });
  }, [roles, currentUser]);

  const handleRefreshList = async () => {
    const toastId = toast.loading("Refreshing governance roles...");
    try {
      await queryClient.invalidateQueries({ queryKey: ["rbac"] });
      await refetchRoles();
      toast.success("Role list refreshed successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to refresh role list", {
        id: toastId,
      });
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-text-light">
          Loading role registry...
        </p>
      </div>
    );
  }

  if (!canViewRoles) {
    return (
      <div className="p-8 rounded-3xl border border-rose-500/30 bg-rose-500/5 text-center space-y-3 animate-fade-in my-6 max-w-[1600px] mx-auto">
        <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-text">
          Role Registry Access Restricted
        </h2>
        <p className="text-xs text-text-light max-w-md mx-auto">
          Your account does not have permission (
          <code className="bg-background px-1.5 py-0.5 rounded border border-border text-rose-600 dark:text-rose-400 font-mono">
            role.view
          </code>
          ) to access the role registry and permission control panel. Please
          contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* View Tabs Content */}
      {activeMainTab === "stats" && (
        <RolesStatsView stats={stats} roles={visibleRoles} loading={loading} />
      )}

      {activeMainTab === "list" && (
        <RolesListView
          roles={visibleRoles}
          loading={loading}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
          onOpenView={handleOpenView}
          onDuplicate={handleDuplicate}
          onOpenAssign={openAssignModal}
          onViewHistory={handleOpenView}
          onCompareVersions={openCompareModal}
          onDeleteRole={handleDeleteRole}
          onRefresh={handleRefreshList}
        />
      )}

      {/* Slide-over Workspace Form Drawer */}
      <RoleFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editingRole={editingRole}
        viewOnly={viewOnly}
        roleName={roleName}
        setRoleName={setRoleName}
        description={description}
        setDescription={setDescription}
        selectedPermissions={selectedPermissions}
        setSelectedPermissions={setSelectedPermissions}
        modules={modules}
        submitting={submitting}
        onSubmit={handleFormSubmit}
        versions={versions}
        commentsList={commentsList}
        loadingComments={loadingComments}
        activityLogsList={activityLogsList}
        loadingActivityLogs={loadingActivityLogs}
        onAddComment={handleAddComment}
        newCommentText={newCommentText}
        setNewCommentText={setNewCommentText}
        onOpenSubmitReviewModal={openSubmitReviewModal}
        onOpenReviewActionModal={openReviewActionModal}
        onToggleLock={toggleLock}
        currentUserId={currentUser?.id}
        assignableUsers={assignableUsers}
      />

      {/* Governance Modals */}
      <SubmitReviewModal
        isOpen={submitReviewOpen}
        onClose={() => setSubmitReviewOpen(false)}
        versionToSubmit={versionToSubmit}
        assignableUsers={assignableUsers}
        selectedReviewers={selectedReviewers}
        setSelectedReviewers={setSelectedReviewers}
        submitting={submitting}
        onSendForReview={handleSendForReview}
        currentUserId={currentUser?.id}
      />

      <RoleReviewModal
        isOpen={reviewActionOpen}
        onClose={() => setReviewActionOpen(false)}
        reviewRoleName={reviewRoleName}
        reviewCreatorId={reviewCreatorId}
        currentUserId={currentUser?.id}
        reviewDecision={reviewDecision}
        setReviewDecision={setReviewDecision}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        submitting={submitting}
        onSubmitReview={handleReviewSubmit}
        reviewDetails={reviewDetails}
        assignableUsers={assignableUsers}
      />

      <RoleCompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        compareRole={compareRole}
        versions={compareVersionsList}
        compareV1={compareV1}
        setCompareV1={setCompareV1}
        compareV2={compareV2}
        setCompareV2={setCompareV2}
        compareResult={compareResult}
        onCompare={handleCompare}
      />

      <RoleAssignModal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        assignRole={assignRole}
        assignableUsers={assignableUsers}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        expiresAt={expiresAt}
        setExpiresAt={setExpiresAt}
        onSubmit={handleAssignSubmit}
        submitting={submitting}
      />
    </div>
  );
}

export default function RolesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-text-light">Loading Roles...</div>}>
      <RolesPageContent />
    </Suspense>
  );
}
