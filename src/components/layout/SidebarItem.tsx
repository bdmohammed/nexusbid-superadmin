'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

import type { NavigationItem } from '@/constants/navigation';
import { cn } from '@/lib/tailwind/utils';
import { useSidebarStore } from '@/store';

export interface SidebarItemProps {
  item: NavigationItem;
  onClick?: () => void;
}

export default function SidebarItem({ item, onClick }: SidebarItemProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const Icon = item.icon;
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  // Check if this item is currently active
  const active =
    item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);

  const hasChildren = !!item.children && item.children.length > 0;

  // Set isOpen if pathname matches or if we expand it manually
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (active && hasChildren) {
      setIsOpen(true);
    }
  }, [active, hasChildren]);

  const handleToggle = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  // Helper to check if a specific child link is active (including query params)
  const isChildActive = (childHref: string) => {
    const [path, query] = childHref.split('?');
    if (pathname !== path) return false;
    if (query) {
      const [key, val] = query.split('=');
      return searchParams.get(key as string) === val;
    }
    return !searchParams.get('view');
  };

  const renderItemContent = () => (
    <>
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
          active
            ? 'bg-primary/10 text-primary'
            : 'bg-background text-text-light group-hover:bg-white group-hover:text-text',
        )}
      >
        <Icon size={18} />
      </span>
      {!isCollapsed && (
        <>
          <span className="px-1 transition-all duration-300 font-semibold">{item.title}</span>
          {hasChildren && (
            <ChevronDown
              size={14}
              className={cn(
                'ml-auto text-text-light transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
            />
          )}
        </>
      )}
    </>
  );

  return (
    <div className="flex flex-col">
      {hasChildren ? (
        <button
          onClick={handleToggle}
          title={isCollapsed ? item.title : undefined}
          className={cn(
            'group relative flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 w-full text-left cursor-pointer',
            isCollapsed ? 'justify-center px-2' : '',
            active && !isOpen
              ? 'bg-sidebar-active text-primary'
              : 'text-text-light hover:bg-sidebar-hover hover:text-text',
          )}
        >
          {renderItemContent()}
        </button>
      ) : (
        <Link
          href={item.href}
          {...(onClick ? { onClick } : {})}
          title={isCollapsed ? item.title : undefined}
          className={cn(
            'group relative flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
            isCollapsed ? 'justify-center px-2' : '',
            active
              ? 'bg-sidebar-active text-primary'
              : 'text-text-light hover:bg-sidebar-hover hover:text-text',
          )}
        >
          {renderItemContent()}
        </Link>
      )}

      {/* Render sub-items if expanded */}
      {hasChildren && isOpen && (
        <div
          className={cn(
            'transition-all duration-300 overflow-hidden flex flex-col gap-1 mt-1',
            isCollapsed ? 'items-center pl-0' : 'pl-12',
          )}
        >
          {item.children?.map((child) => {
            const childActive = isChildActive(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                {...(onClick ? { onClick } : {})}
                className={cn(
                  'relative flex items-center transition-all duration-200 font-semibold rounded-lg',
                  isCollapsed
                    ? 'w-8 h-8 justify-center text-[10px] bg-background hover:bg-sidebar-hover text-text-light hover:text-text'
                    : 'px-3 py-1.5 text-xs text-text-light hover:text-text',
                  childActive
                    ? isCollapsed
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-primary font-bold animate-fade-in'
                    : '',
                )}
              >
                {childActive && !isCollapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
                {isCollapsed ? child.title[0] : child.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
