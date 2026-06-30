"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import TableToolbar from "@/components/common/TableToolbar";

import RoleStats from "@/components/roleAssignment/RoleStats";
import RoleTable from "@/components/roleAssignment/RoleTable";

import roleData from "@/data/roleData";
import RoleCreateDrawer from "@/components/roleAssignment/RoleCreateDrawer";

export default function RoleAssignmentsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pageSize = 5;

  const filteredData = roleData.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function handleSearch(e) {
    setSearch(e.target.value);
    setCurrentPage(1);
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Role Assignments</h1>

            <p className="mt-1 text-text-light">
              Manage administrative roles and permissions.
            </p>
          </div>

          <Button leftIcon={Plus} onClick={() => setDrawerOpen(true)}>
            Create Role User
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

        <RoleTable
          data={filteredData}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
      <RoleCreateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={(data) => {
          console.log(data);
        }}
      />
    </>
  );
}
