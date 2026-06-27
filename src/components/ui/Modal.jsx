"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({
  open,
  title,
  children,
  footer,
  width = "max-w-lg",
  onClose,
}) {
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    if (open) {
      window.addEventListener("keydown", handler);
    }

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className={`w-full ${width} overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl`}
        >
          {/* Header */}

          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-text">{title}</h2>

            <button
              onClick={onClose}
              className="rounded-lg p-2 transition hover:bg-sidebar-hover"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}

          <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>

          {/* Footer */}

          {footer && (
            <div className="flex justify-end gap-3 border-t border-border bg-background px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
