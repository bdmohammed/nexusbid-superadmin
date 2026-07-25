"use client";

import { navigation, systemNavigation } from "@/constants/navigation";
import Logo from "../common/Logo";
import SidebarItem from "./SidebarItem";
import { usePermissions } from "@/hooks/usePermissions";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";

import { useSidebarStore } from "@/store";
import { cn } from "@/lib/tailwind/utils";

export interface SidebarContentProps {
  onNavigate?: () => void;
}

export default function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { isInitializing, hasPermission } = usePermissions();
  const { logout, isLoggingOut } = useAuth();
  const router = useRouter();
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.replace("/login");
      if (onNavigate) onNavigate();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "flex h-14 shrink-0 items-center transition-all duration-300",
            isCollapsed ? "justify-center px-2" : "px-4 py-1 sm:h-16 sm:px-5",
          )}
        >
          <Logo showText={!isCollapsed} />
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

  const filteredNavigation = navigation
    .map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: item.children.filter(
            (child) =>
              !child.requiredPermission ||
              hasPermission(child.requiredPermission),
          ),
        };
      }
      return item;
    })
    .filter((item) => {
      if (item.children) {
        return item.children.length > 0;
      }
      return !item.requiredPermission || hasPermission(item.requiredPermission);
    });

  const filteredSystemNavigation = systemNavigation
    .map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: item.children.filter(
            (child) =>
              !child.requiredPermission ||
              hasPermission(child.requiredPermission),
          ),
        };
      }
      return item;
    })
    .filter((item) => {
      if (item.children) {
        return item.children.length > 0;
      }
      return !item.requiredPermission || hasPermission(item.requiredPermission);
    });

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-14 shrink-0 items-center transition-all duration-300",
          isCollapsed ? "justify-center px-2" : "px-4 py-1 sm:h-16 sm:px-5",
        )}
      >
        <Logo showText={!isCollapsed} />
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto py-3 transition-all duration-300",
          isCollapsed ? "px-2" : "px-3 sm:px-5",
        )}
      >
        {filteredNavigation.length > 0 && (
          <>
            {!isCollapsed && (
              <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-text-light">
                Menu
              </p>
            )}

            <nav className="space-y-2">
              {filteredNavigation.map((item) => (
                <SidebarItem key={item.href} item={item} onClick={onNavigate} />
              ))}
            </nav>
          </>
        )}

        {filteredSystemNavigation.length > 0 && (
          <>
            {isCollapsed ? (
              <div className="border-t border-border/50 my-4" />
            ) : (
              <p className="mt-6 mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-text-light">
                System
              </p>
            )}

            <nav className="space-y-2">
              {filteredSystemNavigation.map((item) => (
                <SidebarItem key={item.href} item={item} onClick={onNavigate} />
              ))}
            </nav>
          </>
        )}
      </div>

      <div
        className={cn(
          "border-t border-border bg-sidebar transition-all duration-300",
          isCollapsed ? "p-2 flex justify-center" : "p-4",
        )}
      >
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 text-red-500 hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
            isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full",
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-red-500 transition-colors group-hover:bg-white group-hover:text-red-600">
            {isLoggingOut ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <LogOut size={18} />
            )}
          </span>
          {!isCollapsed && (
            <span className="px-1 font-semibold">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
