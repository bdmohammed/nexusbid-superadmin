"use client";

import SidebarContent from "./SidebarContent";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-(--sidebar-width) flex-col border-r border-border bg-sidebar shadow-sm lg:flex">
      <SidebarContent />
    </aside>
  );
}
