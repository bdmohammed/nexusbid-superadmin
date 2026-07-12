"use client";

import { useSidebarStore } from "@/store";

export default function Overlay() {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const close = useSidebarStore((state) => state.close);

  if (!isOpen) return null;

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity lg:hidden"
      aria-hidden="true"
    />
  );
}
