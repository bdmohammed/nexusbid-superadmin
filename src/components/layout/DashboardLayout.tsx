"use client";

import { type ReactNode, useEffect } from "react";
import MobileSidebar from "./MobileSidebar";
import Overlay from "./Overlay";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSidebarStore } from "@/store";
import ImpersonationBanner from "../common/ImpersonationBanner";
import { cn } from "@/lib/tailwind/utils";

export interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window !== "undefined" && window.innerWidth >= 1024) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <ImpersonationBanner />
      <Sidebar />
      <Overlay />
      <MobileSidebar />
      <div className={cn(
        "min-h-screen flex-1 transition-all duration-300",
        isCollapsed ? "lg:ml-[72px]" : "lg:ml-(--sidebar-width)"
      )}>
        <Topbar />
        <main className="w-full p-4 sm:p-5 md:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
