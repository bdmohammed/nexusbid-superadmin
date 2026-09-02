'use client';

import { X } from 'lucide-react';

import SidebarContent from './SidebarContent';

import { useSidebarStore } from '@/store';

export default function MobileSidebar() {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const close = useSidebarStore((state) => state.close);

  return (
    <aside
      className={`fixed left-0 top-0 z-50 h-[100dvh] w-[min(280px,calc(100vw-1rem))] border-r border-border bg-sidebar shadow-xl transition-transform duration-300 ease-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={close}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-text-light transition-colors hover:bg-sidebar-hover hover:text-text sm:top-4"
        aria-label="Close menu"
      >
        <X size={18} />
      </button>
      <SidebarContent onNavigate={close} />
    </aside>
  );
}
