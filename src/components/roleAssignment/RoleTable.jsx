"use client";

import { useState } from "react";

import Pagination from "@/components/common/Pagination";
import ConfirmModal from "@/components/common/ConfirmModal";

import RoleRow from "./RoleRow";

export default function RoleTable({
  data,
  currentPage,
  pageSize,
  onPageChange,
}) {
  const [deleteUser, setDeleteUser] = useState(null);

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function handleDelete() {
    console.log("Delete :", deleteUser);
    setDeleteUser(null);
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
                  Role
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Last Activity
                </th>

                <th className="w-20 px-5 py-4 text-center text-sm font-semibold">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>
              {paginatedData.map((user) => (
                <RoleRow
                  key={user.id}
                  user={user}
                  onDelete={setDeleteUser}
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
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        title="Delete User Role"
        message={`Are you sure you want to remove role assignment for "${deleteUser?.firstName} ${deleteUser?.lastName}"?`}
        confirmText="Delete"
      />
    </>
  );
}