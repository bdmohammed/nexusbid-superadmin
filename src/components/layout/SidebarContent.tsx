"use client";

import { navigation, systemNavigation } from "@/constants/navigation";
import Logo from "../common/Logo";
import SidebarItem from "./SidebarItem";
import { usePermissions } from "@/hooks/usePermissions";

export interface SidebarContentProps {
  onNavigate?: () => void;
}

export default function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { isInitializing, hasPermission } = usePermissions();

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
    </div>
  );
}
