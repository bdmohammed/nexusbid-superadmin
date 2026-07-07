"use client";

import { useAuthStore } from "../features/auth/store/store";

export function usePermissions() {
  const user = useAuthStore((state: any) => state.user);
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const isInitializing = useAuthStore((state: any) => state.isInitializing);

  const permissions = user?.permissions ?? [];
  const roles = user?.roles ?? [];
  const isSuperAdmin = roles.includes("super-admin") || false;

  const hasPermission = (permission: string) => {
    return isSuperAdmin || permissions.includes(permission);
  };

  const hasAnyPermission = (keys: string[]) => {
    return isSuperAdmin || keys.some((k) => permissions.includes(k));
  };

  const hasAllPermissions = (keys: string[]) => {
    return isSuperAdmin || keys.every((k) => permissions.includes(k));
  };

  return {
    user,
    permissions,
    isAuthenticated,
    isInitializing,
    roles,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
