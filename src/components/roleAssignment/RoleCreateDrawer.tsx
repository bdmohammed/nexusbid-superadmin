"use client";

import { X, Calendar, Key, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import Select from "@/components/common/Select";
import Button from "@/components/ui/Button";
import { Role } from "@/features/rbac/types";
import { rbacApi } from "@/features/rbac/api/api";

export interface RoleCreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { userId: string; userName: string; email: string; roleId: string; roleName: string; expiresAt: string | null }) => void;
}

export default function RoleCreateDrawer({
  open,
  onClose,
  onSubmit,
}: RoleCreateDrawerProps) {
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [previewPermissions, setPreviewPermissions] = useState<string[]>([]);

  useEffect(() => {
    async function loadRolesAndUsers() {
      setLoadingUsers(true);
      try {
        const [rolesRes, usersRes] = await Promise.all([
          rbacApi.getRoles(),
          rbacApi.getAssignableUsers(),
        ]);
        const rolesData = rolesRes.data.data || [];
        const usersData = usersRes.data.data || [];
        setRoles(rolesData);
        setAssignableUsers(usersData);
        if (rolesData.length > 0) {
          setSelectedRoleId(rolesData[0].id);
        }
        if (usersData.length > 0) {
          setSelectedUserId(usersData[0].id);
        }
      } catch (err) {
        console.error("Failed to load roles/users:", err);
      } finally {
        setLoadingUsers(false);
      }
    }
    if (open) {
      loadRolesAndUsers();
    }
  }, [open]);

  // Update permissions preview whenever selected role changes
  useEffect(() => {
    const role = roles.find((r) => r.id === selectedRoleId);
    if (role) {
      setPreviewPermissions(role.permissions || []);
    } else {
      setPreviewPermissions([]);
    }
  }, [selectedRoleId, roles]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = assignableUsers.find((u) => u.id === selectedUserId);
    const role = roles.find((r) => r.id === selectedRoleId);

    if (!user || !role) return;

    onSubmit({
      userId: user.id,
      userName: user.name,
      email: user.email,
      roleId: role.id,
      roleName: role.name,
      expiresAt: hasExpiry && expiryDate ? new Date(expiryDate).toISOString() : null
    });

    onClose();
  }

  if (!open) return null;

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
            <h2 className="text-2xl font-bold">Assign Role to User</h2>
            <p className="mt-2 text-sm text-text-light">
              Grant permissions to a user by assigning a configured role with optional expiration.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-background text-text-light hover:text-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-6 overflow-y-auto p-6"
        >
          {/* User Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text">Select Administrator</label>
            {loadingUsers ? (
              <div className="h-10 rounded-xl border border-border bg-background animate-pulse flex items-center px-4">
                <span className="text-xs text-text-light">Loading administrators...</span>
              </div>
            ) : assignableUsers.length === 0 ? (
              <p className="text-xs text-text-light italic">No administrators available for assignment.</p>
            ) : (
              <Select
                name="userId"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {assignableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </Select>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text">Assign Role</label>
            <Select
              name="roleId"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </option>
              ))}
            </Select>
          </div>

          {/* Expiration Settings */}
          <div className="rounded-2xl border border-border p-5 bg-background space-y-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={hasExpiry}
                onChange={(e) => setHasExpiry(e.target.checked)}
                className="h-4 w-4 rounded accent-primary border-border"
              />
              <div className="text-sm font-semibold text-text flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                Temporary Assignment (Time-Bound Expiration)
              </div>
            </label>

            {hasExpiry && (
              <div className="pl-7 space-y-2 animate-fadeIn">
                <label className="block text-xs font-medium text-text-light">
                  Expiration Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-text"
                  required={hasExpiry}
                />
              </div>
            )}
          </div>

          {/* Effective Permissions Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Key className="h-4 w-4" />
              Effective Permissions Preview
            </h3>
            <p className="text-xs text-text-light">
              Live preview of permissions this user will receive from the selected role assignment.
            </p>

            <div className="rounded-2xl border border-border bg-background p-4 max-h-60 overflow-y-auto space-y-3">
              {previewPermissions.length === 0 ? (
                <p className="text-xs text-text-light italic">No permissions in this role.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {previewPermissions.map((perm) => (
                    <span
                      key={perm}
                      className="text-xs px-2.5 py-1 rounded-lg bg-surface border border-border text-text font-mono"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border p-6 bg-surface">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit}>Assign Role</Button>
        </div>
      </div>
    </>
  );
}
