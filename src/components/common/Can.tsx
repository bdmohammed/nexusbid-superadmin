"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { ReactNode } from "react";

interface CanProps {
  permission?: string;
  any?: string[];
  all?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ permission, any, all, fallback = null, children }: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) {
    return null;
  }

  let authorized = false;

  if (permission) {
    authorized = hasPermission(permission);
  } else if (any && any.length > 0) {
    authorized = hasAnyPermission(any);
  } else if (all && all.length > 0) {
    authorized = hasAllPermissions(all);
  } else {
    authorized = true;
  }

  if (authorized) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
