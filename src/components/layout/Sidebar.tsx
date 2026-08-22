"use client";

import SidebarContent from "./SidebarContent";

import { cn } from "@/lib/tailwind/utils";
import { useSidebarStore } from "@/store";

export default function Sidebar() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border bg-sidebar shadow-sm lg:flex transition-all duration-300",
        isCollapsed ? "w-[72px]" : "w-(--sidebar-width)",
      )}
    >
      <SidebarContent />
    </aside>
  );
}
