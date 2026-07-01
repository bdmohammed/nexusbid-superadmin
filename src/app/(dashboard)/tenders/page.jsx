"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import TableToolbar from "@/components/common/TableToolbar";
import TenderTable from "@/components/tender/TenderTable";
import tenderData from "@/data/tenderData";
import { useRouter } from "next/navigation";

export default function TendersPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const pageSize = 5;

  const filteredTenders = tenderData.filter((tender) =>
    `${tender.title}
     ${tender.tenderId}
     ${tender.category}
     ${tender.location}
     ${tender.createdBy}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function handleSearch(e) {
    setSearch(e.target.value);

    setCurrentPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenders</h1>

          <p className="mt-1 text-text-light">
            Manage all tenders from one place.
          </p>
        </div>

        {/* <Button leftIcon={Plus}>Create Tender</Button> */}
        <Button leftIcon={Plus} onClick={() => router.push("/tenders/create")}>
          Create Tender
        </Button>
      </div>

      {/* Toolbar */}

      <TableToolbar
        search={search}
        total={filteredTenders.length}
        name="tender"
        placeholder="Search Tender..."
        handleSearch={handleSearch}
      />

      {/* Listing */}

      <TenderTable
        data={filteredTenders}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
