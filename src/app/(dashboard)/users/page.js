"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import TableToolbar from "@/components/common/TableToolbar";
import UserStats from "@/components/user/UserStats";
import UserTable from "@/components/user/UserTable";
import userData from "@/data/userData";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const filteredUsers = userData.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="mt-1 text-text-light">Manage all system users.</p>
        </div>
        <Button leftIcon={Plus}>Create User</Button>
      </div>

      <UserStats />

      <TableToolbar
        search={search}
        name="user"
        placeholder="Search User..."
        handleSearch={handleSearch}
        total={filteredUsers.length}
      />

      <UserTable
        data={filteredUsers}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
