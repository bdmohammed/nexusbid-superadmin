"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  Send,
  Archive,
  Trash2,
} from "lucide-react";

export default function TenderActionMenu({
  tender,
  onView,
  onEdit,
  onDuplicate,
  onPublish,
  onArchive,
  onDelete,
}) {
  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    {
      label: "View Tender",
      icon: Eye,
      action: () => onView?.(tender),
    },

    {
      label: "Edit Tender",
      icon: Pencil,
      action: () => onEdit?.(tender),
    },

    {
      label: "Duplicate Tender",
      icon: Copy,
      action: () => onDuplicate?.(tender),
    },

    {
      label: "Publish Tender",
      icon: Send,
      action: () => onPublish?.(tender),
      hidden: tender.status === "Published",
    },

    {
      label: "Archive Tender",
      icon: Archive,
      action: () => onArchive?.(tender),
      hidden: tender.status === "Closed",
    },

    {
      label: "Delete Tender",
      icon: Trash2,
      danger: true,
      action: () => onDelete?.(tender),
    },
  ];

  return (
    <div
      ref={menuRef}
      className="relative inline-block text-left"
    >
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 transition hover:bg-background"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          {menuItems
            .filter((item) => !item.hidden)
            .map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action();
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition
                  ${
                    item.danger
                      ? "text-red-600 hover:bg-red-50"
                      : "hover:bg-background"
                  }`}
                >
                  <Icon size={17} />

                  <span>{item.label}</span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}