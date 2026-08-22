"use client";

import SearchInput from "./SearchInput";
import Select from "./Select";
import TableAction from "./TableAction";

import type { ChangeEvent } from "react";

export interface TableToolbarProps {
  search: string;
  total: number;
  name: string;
  placeholder: string;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function TableToolbar({
  search,
  total,
  name,
  placeholder,
  handleSearch,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="shrink-0">
        <h2 className="text-lg font-semibold text-text">
          {name.charAt(0).toUpperCase() + name.slice(1)} List
        </h2>
        <p className="text-sm text-text-light">
          {total} {name.charAt(0).toUpperCase() + name.slice(1)} Available
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:justify-end">
        <SearchInput
          placeholder={placeholder}
          value={search}
          onChange={handleSearch}
        />

        <Select>
          <option>Newest</option>
          <option>Oldest</option>
          <option>Active</option>
          <option>Draft</option>
        </Select>

        <TableAction />
      </div>
    </div>
  );
}
