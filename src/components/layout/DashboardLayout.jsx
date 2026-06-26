"use client";

import { useEffect } from "react";
import useSidebar from "@/hooks/useSidebar";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import Overlay from "./Overlay";
import Topbar from "./Topbar";

export default function DashboardLayout({ children }) {
  const { open, toggle, close } = useSidebar();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Sidebar />
      <Overlay show={open} onClick={close} />
      <MobileSidebar open={open} close={close} />
      <div className="min-h-screen flex-1 lg:ml-(--sidebar-width)">
        <Topbar toggleSidebar={toggle} />
        <main className="w-full p-4 sm:p-5 md:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
