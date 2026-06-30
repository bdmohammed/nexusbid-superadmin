"use client";

import { useState } from "react";

import Pagination from "@/components/common/Pagination";
import ConfirmModal from "@/components/common/ConfirmModal";

import UserRow from "./UserRow";

export default function UserTable({
  data,
  currentPage,
  pageSize,
  onPageChange,
}) {
  const [userToDelete, setUserToDelete] = useState(null);

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
              {paginatedData.map((user,i) => (
                <UserRow
                  key={i+1}
                  user={user}
                  onView={(user) => console.log("View", user)}
                  onEdit={(user) => console.log("Edit", user)}
                  onResetPassword={(user) =>
                    console.log("Reset Password", user)
                  }
                  onChangeRole={(user) => console.log("Change Role", user)}
                  onToggleStatus={(user) =>
                    console.log("Suspend / Activate", user)
                  }
                  onLoginHistory={(user) => console.log("History", user)}
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
