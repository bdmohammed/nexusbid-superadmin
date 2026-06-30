"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Eye,
  Pencil,
  Shield,
  KeyRound,
  History,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserActionMenu({
  user,
  onView,
  onEdit,
  onDelete,
  onResetPassword,
  onChangeRole,
  onToggleStatus,
  onLoginHistory,
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (!menuRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }

    window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleView = (user) => {
    onView(user);
    router.push(`/users/${user.id}`);
  }

  return (
    <div
      ref={menuRef}
      className="relative flex justify-center"
    >
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 transition hover:bg-sidebar-hover"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">

          <button
            onClick={() => {
              handleView(user);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-background"
          >
            <Eye size={16} />

            View Profile
          </button>

          <button
            onClick={() => {
              onEdit(user);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-background"
          >
            <Pencil size={16} />

            Edit User
          </button>

          <button
            onClick={() => {
              onChangeRole(user);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-background"
          >
            <Shield size={16} />

            Change Role
          </button>

          <button
            onClick={() => {
              onResetPassword(user);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-background"
          >
            <KeyRound size={16} />

            Reset Password
          </button>

          <button
            onClick={() => {
              onLoginHistory(user);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-background"
          >
            <History size={16} />

            Login History
          </button>

          <button
            onClick={() => {
              onToggleStatus(user);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-background"
          >
            {user.status === "Suspended" ? (
              <>
                <UserCheck size={16} />
                Activate User
              </>
            ) : (
              <>
                <UserX size={16} />
                Suspend User
              </>
            )}
          </button>

          <div className="border-t border-border" />

          <button
            onClick={() => {
              onDelete(user);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />

            Delete User
          </button>
        </div>
      )}
    </div>
  );
}