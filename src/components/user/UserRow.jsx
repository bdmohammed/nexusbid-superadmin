"use client";

import Avatar from "@/components/common/Avatar";

import UserRoleBadge from "./UserRoleBadge";
import UserStatusBadge from "./UserStatusBadge";
import UserActionMenu from "./UserActionMenu";

export default function UserRow({
  user,
  onView,
  onEdit,
  onDelete,
  onResetPassword,
  onChangeRole,
  onToggleStatus,
  onLoginHistory,
}) {
  return (
    <tr className="border-b border-border transition hover:bg-background">

      <td className="w-14 px-5 py-4">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border accent-primary"
        />
      </td>

      <td className="px-5 py-4">

        <div className="flex items-center gap-3">

          <Avatar
            name={`${user.firstName} ${user.lastName}`}
            size="md"
          />

          <div>

            <h4 className="font-semibold text-text">
              {user.firstName} {user.lastName}
            </h4>

            <p className="text-sm text-text-light">
              {user.email}
            </p>

          </div>

        </div>

      </td>

      <td className="px-5 py-4 text-sm text-text-light">
        {user.phone}
      </td>

      <td className="px-5 py-4">
        <UserRoleBadge role={user.role} />
      </td>

      <td className="px-5 py-4">
        <UserStatusBadge status={user.status} />
      </td>

      <td className="px-5 py-4">
        <div>

          <p className="font-medium">
            {user.subscription}
          </p>

          <p className="text-xs text-text-light">
            Plan
          </p>

        </div>
      </td>

      <td className="px-5 py-4 text-sm text-text-light">
        {user.lastLogin}
      </td>

      <td className="px-5 py-4 text-sm text-text-light">
        {user.created}
      </td>

      <td className="w-20 px-5 py-4">

        <UserActionMenu
          user={user}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onResetPassword={onResetPassword}
          onChangeRole={onChangeRole}
          onToggleStatus={onToggleStatus}
          onLoginHistory={onLoginHistory}
        />

      </td>

    </tr>
  );
}