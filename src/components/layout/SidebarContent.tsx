"use client";

import { navigation, systemNavigation } from "@/constants/navigation";
import Logo from "../common/Logo";
import SidebarItem from "./SidebarItem";
import { usePermissions } from "@/hooks/usePermissions";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";

export interface SidebarContentProps {
  onNavigate?: () => void;
}

export default function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { isInitializing, hasPermission } = usePermissions();
  const { logout, isLoggingOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      router.refresh();
      if (onNavigate) onNavigate();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-14 shrink-0 items-center px-4 py-1 sm:h-16 sm:px-5">
          <Logo />
        </div>
        <div className="flex-1 px-3 py-3 sm:px-5 animate-pulse space-y-4">
          <div className="h-4 bg-sidebar-hover rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-sidebar-hover rounded"></div>
            <div className="h-10 bg-sidebar-hover rounded"></div>
            <div className="h-10 bg-sidebar-hover rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredNavigation = navigation.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  const filteredSystemNavigation = systemNavigation.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center px-4 py-1 sm:h-16 sm:px-5">
        <Logo />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-5">
        {filteredNavigation.length > 0 && (
          <>
            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-text-light">
              Menu
            </p>

            <nav className="space-y-2">
              {filteredNavigation.map((item) => (
                <SidebarItem key={item.href} item={item} onClick={onNavigate} />
              ))}
            </nav>
          </>
        )}

        {filteredSystemNavigation.length > 0 && (
          <>
            <p className="mt-6 mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-text-light">
              System
            </p>

            <nav className="space-y-2">
              {filteredSystemNavigation.map((item) => (
                <SidebarItem key={item.href} item={item} onClick={onNavigate} />
              ))}
            </nav>
          </>
        )}
      </div>

      <div className="border-t border-border p-4 bg-sidebar">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="group relative flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 text-red-500 hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-red-500 transition-colors group-hover:bg-white group-hover:text-red-600">
            {isLoggingOut ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <LogOut size={18} />
            )}
          </span>
          <span className="px-1 font-semibold">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </div>
  );
}
