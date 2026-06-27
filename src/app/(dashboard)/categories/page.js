"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import CategoryTable from "@/components/category/CategoryTable";
import CategoryModal from "@/components/category/CategoryModal";
import categoryData from "@/data/categoryData";
import TableToolbar from "@/components/common/TableToolbar";

export default function CategoriesPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const filteredData = categoryData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="mt-1 text-text-light">
            Manage all marketplace categories.
          </p>
        </div>

        <Button leftIcon={Plus} onClick={() => setOpen(true)}>
          Create Category
        </Button>
      </div>

      {/* Toolbar (search, filters, actions) */}
      <TableToolbar
        search={search}
        total={filteredData.length}
        handleSearch={handleSearch}
      />

      {/* Listing Table */}
      <CategoryTable
        data={filteredData}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Create Category Modal */}
      <CategoryModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
