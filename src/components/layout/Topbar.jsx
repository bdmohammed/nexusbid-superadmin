"use client";

import { Bell, Menu, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { navigation } from "@/constants/navigation";
import useTheme from "@/hooks/useTheme";
import Avatar from "../common/Avatar";

const pageTitles = Object.fromEntries(
  navigation?.map((item) => [item.href, item.title]),
);

export default function Topbar({ toggleSidebar }) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] ?? "Dashboard";
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-xl">
      <div className="flex h-14 w-full items-center px-4 py-1 sm:h-16 sm:px-5 lg:px-6 xl:px-8">

        <div className="flex flex-1 items-center gap-3 min-w-0">

          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface p-1 text-text-light transition-colors hover:bg-sidebar-hover lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface p-1 text-text-light transition-colors hover:bg-sidebar-hover"
            aria-label="Toggle dark mode"
          >
            {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface p-1 text-text-light transition-colors hover:bg-sidebar-hover"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1 py-1.5 pl-1.5 pr-2 sm:gap-3 sm:p-2 sm:pr-3">
            <Avatar name="Admin" size="sm" />
            <div className="hidden min-w-0 px-1 md:block">
              <p className="truncate text-sm font-medium leading-none text-text">
                Admin
              </p>
              <p className="mt-0.5 truncate text-xs text-text-light">
                Super Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}        