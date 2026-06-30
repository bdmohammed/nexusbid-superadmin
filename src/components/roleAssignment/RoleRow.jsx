"use client";

import StatusBadge from "@/components/common/StatusBadge";
import RoleActionMenu from "./RoleActionMenu";

function initials(first, last) {
  return `${first[0]}${last[0]}`;
}

function roleColor(role) {
  switch (role) {
    case "Super Admin":
      return "bg-purple-100 text-purple-700";

    case "Subscription Manager":
      return "bg-blue-100 text-blue-700";

    case "Category Admin":
      return "bg-orange-100 text-orange-700";

    case "Vendor Manager":
      return "bg-green-100 text-green-700";

    case "Support Admin":
      return "bg-pink-100 text-pink-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function RoleRow({ user, onDelete }) {
  return (
    <tr className="border-b border-border transition hover:bg-background">
      <td className="px-5 py-4">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border accent-primary"
        />
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-semibold text-white">
            {initials(user.firstName, user.lastName)}
          </div>

          <div>
            <h4 className="font-semibold">
              {user.firstName} {user.lastName}
            </h4>

            <p className="text-sm text-text-light">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${roleColor(
            user.role,
          )}`}
        >
          {user.role}
        </span>
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={user.status} />
      </td>

      <td className="px-5 py-4">
        <div>
          <p className="text-sm">{user.lastActivity}</p>

          <p className="text-xs text-text-light">{user.location}</p>
        </div>
      </td>

      <td className="px-5 py-4 text-center">
        <RoleActionMenu
          user={user}
          onDelete={onDelete}
          onEdit={(user) => console.log("Edit", user)}
          onAssignPermission={(user) => console.log("Permission", user)}
          onResetPassword={(user) => console.log("Reset Password", user)}
          onDeactivate={(user) => console.log("Deactivate", user)}
          onActivate={(user) => console.log("Activate", user)}
        />
      </td>
    </tr>
  );
}
