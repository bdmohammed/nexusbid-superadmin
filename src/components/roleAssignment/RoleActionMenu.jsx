"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

export default function RoleActionMenu({
  user,
  onDelete,
  onEdit,
  onAssignPermission,
  onResetPassword,
  onDeactivate,
  onActivate,
}) {
  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div
      ref={menuRef}
      className="relative inline-block text-left"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-lg p-2 transition hover:bg-sidebar-hover"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">

          {/* View Profile */}

          <Link
            href={`/users/${user.id}`}
            onClick={closeMenu}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-background"
          >
            <Eye size={17} />
            View Profile
          </Link>

          {/* Edit Role */}

          <button
            onClick={() => {
              closeMenu();
              onEdit?.(user);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-background"
          >
            <Pencil size={17} />
            Edit Role
          </button>

          {/* Assign Permissions */}

          <button
            onClick={() => {
              closeMenu();
              onAssignPermission?.(user);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-background"
          >
            <Shield size={17} />
            Assign Permissions
          </button>

          {/* Reset Password */}

          <button
            onClick={() => {
              closeMenu();
              onResetPassword?.(user);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-background"
          >
            <KeyRound size={17} />
            Reset Password
          </button>

          {/* Activity */}

          <button
            onClick={() => {
              closeMenu();
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-background"
          >
            <History size={17} />
            Activity Log
          </button>

          {/* Suspend / Activate */}

          {user.status === "Active" ? (
            <button
              onClick={() => {
                closeMenu();
                onDeactivate?.(user);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-background"
            >
              <UserX size={17} />
              Suspend User
            </button>
          ) : (
            <button
              onClick={() => {
                closeMenu();
                onActivate?.(user);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-background"
            >
              <UserCheck size={17} />
              Activate User
            </button>
          )}

          <div className="border-t border-border" />

          {/* Delete */}

          <button
            onClick={() => {
              closeMenu();
              onDelete(user);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <Trash2 size={17} />
            Delete Assignment
          </button>
        </div>
      )}
    </div>
  );
}