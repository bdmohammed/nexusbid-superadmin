// "use client";

// import SearchInput from "./SearchInput";
// import Select from "./Select";
// import TableAction from "./TableAction";

// export default function TableToolbar({ search, setSearch, total }) {
//   return (
//     <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
//       <div>
//         <h2 className="text-lg font-semibold text-text">Category List</h2>
//         <p className="text-sm text-text-light">
//           {total} Categories Available
//         </p>
//       </div>

//       <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
//         <SearchInput
//           placeholder="Search Category..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         <Select>
//           <option>Newest</option>
//           <option>Oldest</option>
//           <option>Active</option>
//           <option>Draft</option>
//         </Select>

//         <TableAction />
//       </div>
//     </div>
//   );
// }

"use client";

import SearchInput from "./SearchInput";
import Select from "./Select";
import TableAction from "./TableAction";

export default function TableToolbar({ search, total, handleSearch }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="shrink-0">
        <h2 className="text-lg font-semibold text-text">Category List</h2>
        <p className="text-sm text-text-light">{total} Categories Available</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:justify-end">
        <SearchInput
          placeholder="Search Category..."
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
