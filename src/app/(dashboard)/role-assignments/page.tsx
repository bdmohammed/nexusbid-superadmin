"use client";

import { Plus, ShieldAlert } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import TableToolbar from "@/components/common/TableToolbar";
import RoleCreateDrawer from "@/components/roleAssignment/RoleCreateDrawer";

import RoleStats from "@/components/roleAssignment/RoleStats";
import RoleTable from "@/components/roleAssignment/RoleTable";
import Button from "@/components/ui/Button";
import { rbacApi } from "@/features/rbac/api/api";
import { UserRoleAssignment } from "@/features/rbac/types";

export default function RoleAssignmentsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const pageSize = 10;

  async function loadAssignments() {
    setLoading(true);
    try {
      const res = await rbacApi.getAssignments();
      setAssignments(res.data.success ? res.data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  const filteredData = assignments.filter((item) => {
    const userName = item.user?.name || "";
    const userEmail = item.user?.email || "";
    const roleName = item.role?.name || "";
    return (
      userName.toLowerCase().includes(search.toLowerCase()) ||
      userEmail.toLowerCase().includes(search.toLowerCase()) ||
      roleName.toLowerCase().includes(search.toLowerCase())
    );
  });

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setCurrentPage(1);
  }

  async function handleCreateAssignment(data: { userId: string; roleId: string; expiresAt: string | null }) {
    try {
      await rbacApi.createAssignment({
        userId: data.userId,
        roleId: data.roleId,
        expiresAt: data.expiresAt,
      });
      loadAssignments();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteAssignment(id: string) {
    if (confirm("Are you sure you want to remove this role assignment?")) {
      try {
        const res = await rbacApi.deleteAssignment(id);
        if (res.data.success) {
          loadAssignments();
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShieldAlert className="text-primary h-8 w-8" />
              Role Assignments
            </h1>
            <p className="mt-1 text-text-light">
              Manage administrative roles assigned to users, including time-bound access.
            </p>
          </div>

          <Button leftIcon={Plus} onClick={() => setDrawerOpen(true)}>
            Assign Role User
          </Button>
        </div>

        {/* Statistics */}
        <RoleStats />

        {/* Toolbar */}
        <TableToolbar
          search={search}
          total={filteredData.length}
          name="role user"
          placeholder="Search administrator..."
          handleSearch={handleSearch}
        />

        {/* Table */}
        {loading ? (
          <div className="h-60 rounded-2xl border border-border bg-surface flex items-center justify-center animate-pulse">
            <span className="text-sm text-text-light">Loading role assignments...</span>
          </div>
        ) : (
          <RoleTable
            data={filteredData}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onDeleteAssignment={handleDeleteAssignment}
          />
        )}
      </div>
      <RoleCreateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreateAssignment}
      />
    </>
  );
}
