"use client";

import { useState } from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import Pagination from "@/components/common/Pagination";
import type { User } from "@/types";
import UserRow from "./UserRow";

export interface UserTableProps {
  data: User[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function UserTable({
  data,
  currentPage,
  pageSize,
  onPageChange,
}: UserTableProps) {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function handleDeleteConfirm() {
    console.log("Delete User :", userToDelete);
    setUserToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-background">
              <tr className="border-b border-border">
                <th className="w-14 px-5 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  User
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Mobile
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Role
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Subscription
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Last Login
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Created
                </th>
                <th className="w-20 px-5 py-4 text-center text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((user, i) => (
                <UserRow
                  key={user.id || i + 1}
                  user={user}
                  onView={(u) => console.log("View", u)}
                  onEdit={(u) => console.log("Edit", u)}
                  onResetPassword={(u) => console.log("Reset Password", u)}
                  onChangeRole={(u) => console.log("Change Role", u)}
                  onToggleStatus={(u) => console.log("Suspend / Activate", u)}
                  onLoginHistory={(u) => console.log("History", u)}
                  onDelete={setUserToDelete}
                />
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={data.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </div>

      <ConfirmModal
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.firstName} ${userToDelete?.lastName}" ? This action cannot be undone.`}
        confirmText="Delete User"
      />
    </>
  );
}
