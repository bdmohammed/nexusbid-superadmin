'use client';

import RoleRow from './RoleRow';

import type { UserRoleAssignment } from '@/features/rbac/types';
import Pagination from '@/components/common/Pagination';

export interface RoleTableProps {
  data: UserRoleAssignment[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onDeleteAssignment: (id: string) => void;
}

export default function RoleTable({
  data,
  currentPage,
  pageSize,
  onPageChange,
  onDeleteAssignment,
}: RoleTableProps) {
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-background">
            <tr className="border-b border-border">
              <th className="px-5 py-4 text-left text-sm font-semibold">User</th>
              <th className="px-5 py-4 text-left text-sm font-semibold">Assigned Role</th>
              <th className="px-5 py-4 text-left text-sm font-semibold">Status</th>
              <th className="px-5 py-4 text-left text-sm font-semibold">Expiration & Auditing</th>
              <th className="w-20 px-5 py-4 text-center text-sm font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-text-light italic">
                  No role assignments found.
                </td>
              </tr>
            ) : (
              paginatedData.map((assignment) => (
                <RoleRow
                  key={assignment.id}
                  assignment={assignment}
                  onDelete={onDeleteAssignment}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalItems={data.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
