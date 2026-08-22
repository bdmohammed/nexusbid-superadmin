//@ts-nocheck
"use client";

import { usePathname } from "next/navigation";
import { Menu, Moon, Sun } from "lucide-react";

import Avatar from "../common/Avatar";

import NotificationDropdown from "./NotificationDropdown";

import { navigation, systemNavigation } from "@/constants/navigation";
import { useCurrentUser } from "@/features/auth/api/queries";
import { useAuthStore } from "@/features/auth/store/store";
import { useSidebarStore, useThemeStore } from "@/store";

export default function Topbar() {
  const pathname = usePathname();

  const { data: currentUserData } = useCurrentUser();
  const storeUser = useAuthStore((state) => state.user);
  const user = currentUserData || storeUser;

  const userName = user?.name || "Admin";

  const userRole = (() => {
    const rawRoles = user?.roles || (user as any)?.role;
    if (Array.isArray(rawRoles) && rawRoles.length > 0) {
      return rawRoles
        .map((r) => {
          const str = typeof r === "string" ? r : r?.name || r?.slug || "";
          return str
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
        })
        .filter(Boolean)
        .join(", ");
    }
    if (typeof rawRoles === "string" && rawRoles.trim()) {
      return rawRoles
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
    if ((user as any)?.adminRole) {
      return (user as any).adminRole
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char: string) => char.toUpperCase());
    }
    if ((user as any)?.accountType) {
      const acc = (user as any).accountType;
      return acc.charAt(0).toUpperCase() + acc.slice(1);
    }
    return "Super Admin";
  })();

  const currentNav = [...navigation, ...systemNavigation].find(
    (item) => item.href === pathname,
  );

  const title = currentNav?.headerTitle || currentNav?.title || "Dashboard";
  const subtitle = currentNav?.subtitle;

  const toggleSidebar = useSidebarStore((state) => state.toggle);
  const toggleCollapse = useSidebarStore((state) => state.toggleCollapse);
  const theme = useThemeStore((state) => state.theme);
  const mounted = useThemeStore((state) => state.mounted);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const handleMenuClick = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      toggleCollapse();
    } else {
      toggleSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-xl">
      <div className="flex h-14 w-full items-center px-4 py-1 sm:h-16 sm:px-5 lg:px-6 xl:px-8">
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleMenuClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface p-1 text-text-light transition-colors hover:bg-sidebar-hover cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu size={18} />
          </button>

          <div className="hidden md:block min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-text truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[10px] text-text-light leading-none mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface p-1 text-text-light transition-colors hover:bg-sidebar-hover"
            aria-label="Toggle dark mode"
          >
            {mounted && theme === "dark" ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          <NotificationDropdown />

          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1 py-1.5 pl-1.5 pr-2 sm:gap-3 sm:p-2 sm:pr-3">
            <Avatar name={userName} size="sm" />
            <div className="hidden min-w-0 px-1 md:block">
              <p className="truncate text-sm font-medium leading-none text-text">
                {userName}
              </p>
              <p className="mt-0.5 truncate text-xs text-text-light">
                {userRole}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
