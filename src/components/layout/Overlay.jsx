"use client";

export default function Overlay({ show, onClick }) {
  if (!show) return null;

  return (
    <div
      onClick={onClick}
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity lg:hidden"
      aria-hidden="true"
    />
  );
}