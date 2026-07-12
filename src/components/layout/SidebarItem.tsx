"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationItem } from "@/constants/navigation";
import { cn } from "@/lib/tailwind/utils";

export interface SidebarItemProps {
  item: NavigationItem;
  onClick?: () => void;
}

export default function SidebarItem({ item, onClick }: SidebarItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;

  const active =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-sidebar-active text-primary"
          : "text-text-light hover:bg-sidebar-hover hover:text-text",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "bg-background text-text-light group-hover:bg-white group-hover:text-text",
        )}
      >
        <Icon size={18} />
      </span>
      <span className="px-1">{item.title}</span>
    </Link>
  );
}
