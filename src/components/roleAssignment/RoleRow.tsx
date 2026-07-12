"use client";

import type { UserRoleAssignment } from "@/features/rbac/types";
import Button from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

export interface RoleRowProps {
  assignment: UserRoleAssignment;
  onDelete: (id: string) => void;
}

export default function RoleRow({ assignment, onDelete }: RoleRowProps) {
  const userName = assignment.user?.name || "Unknown User";
  const userEmail = assignment.user?.email || "N/A";
  const roleName = assignment.role?.name || "No Role";
  const assignedBy = typeof assignment.assignedBy === "object" && assignment.assignedBy !== null
    ? assignment.assignedBy.name || assignment.assignedBy.email || "System"
    : "System";
  
  const isExpired = assignment.expiresAt && new Date(assignment.expiresAt).getTime() < Date.now();
  const expiryText = assignment.expiresAt
    ? new Date(assignment.expiresAt).toLocaleString()
    : "Permanent";

  return (
    <tr className="border-b border-border transition hover:bg-background">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
            {userName[0]}
          </div>

          <div>
            <h4 className="font-semibold text-sm text-text">{userName}</h4>
            <p className="text-xs text-text-light">{userEmail}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {roleName}
        </span>
      </td>

      <td className="px-5 py-4">
        {isExpired ? (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
            Expired
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            Active
          </span>
        )}
      </td>

      <td className="px-5 py-4 text-xs text-text-light">
        <div>
          <p className="font-medium text-text">Expires: {expiryText}</p>
          <p className="mt-0.5">Assigned by: {assignedBy}</p>
        </div>
      </td>

      <td className="px-5 py-4 text-center">
        <Button
          leftIcon={Trash2}
          variant="outline"
          size="sm"
          className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          onClick={() => onDelete(assignment.id)}
        >
          Remove
        </Button>
      </td>
    </tr>
  );
}
