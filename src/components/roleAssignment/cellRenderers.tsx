"use client";

import type { ICellRendererParams } from "ag-grid-community";
import type { UserRoleAssignment } from "@/features/rbac/types";
import { Trash2, CheckCircle2, XCircle, Eye, Send } from "lucide-react";
import dayjs from "dayjs";

// 1. Name Cell Renderer (Avatar + Name)
export const NameCellRenderer = (params: ICellRendererParams<UserRoleAssignment>) => {
  const u = params.data?.user;
  const userName = u?.name || "Unknown User";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2.5 h-full py-1">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 font-bold text-primary text-xs shadow-2xs">
        {initial}
      </div>
      <span className="font-semibold text-xs text-text truncate">{userName}</span>
    </div>
  );
};

// 2. Email Cell Renderer
export const EmailCellRenderer = (params: ICellRendererParams<UserRoleAssignment>) => {
  const email = params.data?.user?.email || "N/A";
  return (
    <div className="flex items-center h-full">
      <span className="text-xs text-text-light font-mono truncate">{email}</span>
    </div>
  );
};

// 3. Assigned Role Cell Renderer
export const AssignedRoleCellRenderer = (params: ICellRendererParams<UserRoleAssignment>) => {
  const r = params.data?.role;
  const rawName = r?.name || r?.key;
  const roleName = rawName
    ? rawName.includes("-")
      ? rawName.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
      : rawName
    : "No Role";
  const isSystem = r?.isSystemRole;

  return (
    <div className="flex items-center gap-1.5 h-full">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        {roleName}
      </span>
      {isSystem && (
        <span className="text-[9px] font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
          SYSTEM
        </span>
      )}
    </div>
  );
};

// 4. Account Type Cell Renderer
export const AccountTypeCellRenderer = (params: ICellRendererParams<UserRoleAssignment>) => {
  const type = params.data?.user?.accountType || "admin";
  const formattedType = type === "system_admin" ? "System Admin" : type === "admin" ? "Admin" : "Customer";
  const colorStyle =
    type === "system_admin"
      ? "text-purple-700 dark:text-purple-300"
      : type === "admin"
      ? "text-blue-700 dark:text-blue-300"
      : "text-slate-700 dark:text-slate-300";

  return (
    <div className="flex items-center h-full">
      <span className={`text-[11px] font-semibold capitalize ${colorStyle}`}>
        {formattedType}
      </span>
    </div>
  );
};

// 5. Status Cell Renderer
export const StatusCellRenderer = (params: ICellRendererParams<UserRoleAssignment>) => {
  const expiresAt = params.data?.expiresAt;
  const isExpired = expiresAt && new Date(expiresAt).getTime() <= Date.now();
  const status = (params.data?.status || (isExpired ? "EXPIRED" : "ACTIVE")).toUpperCase();

  let colorClass = "text-emerald-700 dark:text-emerald-400";
  let dotClass = "bg-emerald-500";
  let label = "ACTIVE";

  if (isExpired || status === "EXPIRED") {
    colorClass = "text-rose-700 dark:text-rose-400";
    dotClass = "bg-rose-500";
    label = "EXPIRED";
  } else if (status === "DRAFT") {
    colorClass = "text-amber-700 dark:text-amber-400";
    dotClass = "bg-amber-500";
    label = "DRAFT";
  } else if (status === "SUBMITTED" || status === "PENDING_APPROVAL" || status === "IN_REVIEW") {
    colorClass = "text-indigo-700 dark:text-indigo-400";
    dotClass = "bg-indigo-500";
    label = "IN REVIEW";
  } else if (status === "REJECTED") {
    colorClass = "text-rose-700 dark:text-rose-400";
    dotClass = "bg-rose-500";
    label = "REJECTED";
  }

  return (
    <div className="flex items-center h-full">
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${colorClass}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
        {label}
      </span>
    </div>
  );
};

// 6. Is Verified Cell Renderer
export const IsVerifiedCellRenderer = (params: ICellRendererParams<UserRoleAssignment>) => {
  const u = params.data?.user;
  const isVerified = u?.emailVerified !== false && u?.isVerified !== false;

  return (
    <div className="flex items-center h-full">
      {isVerified ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={12} className="text-emerald-500" /> Verified
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          <XCircle size={12} className="text-amber-500" /> Unverified
        </span>
      )}
    </div>
  );
};

// 7. Expire Date Cell Renderer
export const ExpireDateCellRenderer = (params: ICellRendererParams<UserRoleAssignment>) => {
  const expiresAt = params.data?.expiresAt;
  const text = expiresAt ? dayjs(expiresAt).format("DD MMM YYYY, hh:mm A") : "Permanent Access";

  return (
    <div className="flex items-center h-full text-xs font-medium text-text">
      {text}
    </div>
  );
};

// 8. Actions Cell Renderer
export interface ActionsCellRendererProps extends ICellRendererParams<UserRoleAssignment> {
  currentUserId?: string;
  onViewDetails?: (assignment: UserRoleAssignment) => void;
  onSubmitForReview?: (assignment: UserRoleAssignment) => void;
  onApproveAssignment?: (assignment: UserRoleAssignment) => void;
  onRejectAssignment?: (assignment: UserRoleAssignment) => void;
  onDeleteAssignment?: (id: string) => void;
}

export const ActionsCellRenderer = (params: ActionsCellRendererProps) => {
  const assignment = params.data;
  if (!assignment) return null;

  const status = (assignment.status || "ACTIVE").toUpperCase();
  const isDraft = status === "DRAFT";
  const isPending = status === "SUBMITTED" || status === "PENDING_APPROVAL" || status === "IN_REVIEW";
  const isOwnRole = Boolean(params.currentUserId && assignment.userId === params.currentUserId);

  return (
    <div className="flex items-center gap-1.5 justify-center h-full">
      {/* Eye: View Details */}
      <button
        type="button"
        onClick={() => params.onViewDetails?.(assignment)}
        className="p-1.5 rounded-lg text-xs font-bold text-text-light hover:text-primary hover:bg-primary/10 border border-border transition cursor-pointer"
        title="View Assignment Details"
      >
        <Eye className="h-3.5 w-3.5" />
      </button>

      {/* Submit for Review (if Draft) */}
      {isDraft && (
        <button
          type="button"
          onClick={() => params.onSubmitForReview?.(assignment)}
          className="p-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 transition cursor-pointer"
          title="Submit for Review"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Approve (ONLY if Pending/Submitted/In_Review, NOT if Draft) */}
      {isPending && (
        <button
          type="button"
          onClick={() => params.onApproveAssignment?.(assignment)}
          className="p-1.5 rounded-lg text-xs font-bold text-green-600 hover:bg-green-50 border border-green-200 transition cursor-pointer"
          title="Approve Assignment"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Reject (if Pending/Submitted/In_Review) */}
      {isPending && (
        <button
          type="button"
          onClick={() => params.onRejectAssignment?.(assignment)}
          className="p-1.5 rounded-lg text-xs font-bold text-amber-600 hover:bg-amber-50 border border-amber-200 transition cursor-pointer"
          title="Reject Assignment"
        >
          <XCircle className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Delete / Revoke (Disabled if own role!) */}
      <button
        type="button"
        disabled={isOwnRole}
        onClick={() => {
          if (isOwnRole) return;
          params.onDeleteAssignment?.(assignment.id);
        }}
        className={`p-1.5 rounded-lg text-xs font-bold border transition ${
          isOwnRole
            ? "opacity-30 cursor-not-allowed border-slate-200 text-slate-400"
            : "text-red-600 hover:bg-red-50 border-red-200 cursor-pointer"
        }`}
        title={isOwnRole ? "You cannot revoke your own role assignment" : "Revoke / Delete Assignment"}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
