"use client";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import StatusBadge from "../common/StatusBadge";

export default function CategoryRow({ category, onDeleteRequest }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr className="group border-b border-border transition hover:bg-background">
      <td className="w-14 px-5 py-4">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border accent-primary"
        />
      </td>

      <td className="px-5 py-4">
        <div>
          <h4 className="font-semibold text-text">{category.name}</h4>
          <p className="mt-1 text-xs text-text-light">ID #{category.id}</p>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-text-light">{category.slug}</td>

      <td className="px-5 py-4">
        <p className="max-w-xs text-sm text-text-light">
          {category.description}
        </p>
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={category.status} />
      </td>

      <td className="px-5 py-4 text-sm text-text-light">
        {category.created}
      </td>

      <td className="relative px-5 py-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 transition hover:bg-sidebar-hover"
        >
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-5 top-12 z-30 w-40 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
            <button className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-yellow-50">
              <Pencil size={16} />
              Edit
            </button>

            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                setMenuOpen(false);
                onDeleteRequest(category);
              }}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}