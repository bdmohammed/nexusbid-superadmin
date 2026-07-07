"use client";

import rolePermissions from "@/data/rolePermissions";

export interface PermissionMatrixProps {
  selectedPermissions: string[];
  setSelectedPermissions: (permissions: string[]) => void;
}

export default function PermissionMatrix({
  selectedPermissions,
  setSelectedPermissions,
}: PermissionMatrixProps) {
  function togglePermission(permission: string) {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(
        selectedPermissions.filter((item) => item !== permission),
      );
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
          Permissions
        </h3>

        <p className="mt-1 text-sm text-text-light">
          Choose the permissions available for this role.
        </p>
      </div>

      {rolePermissions.map((group) => (
        <div
          key={group.category}
          className="rounded-2xl border border-border bg-background p-5"
        >
          <h4 className="mb-5 font-semibold text-text">{group.category}</h4>

          <div className="grid gap-4 md:grid-cols-2">
            {group.permissions.map((permission) => (
              <label
                key={permission}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-sidebar-hover"
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                  className="h-4 w-4 rounded accent-primary"
                />

                <span className="text-sm text-text">{permission}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
