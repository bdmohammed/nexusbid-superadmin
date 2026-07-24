"use client";

import React from "react";
import { X, Check, Trash2, Archive, Link2, Info, AlertTriangle, AlertCircle } from "lucide-react";
import type { Notification } from "@/types";
import { useMarkRead, useArchiveNotification, useDismissNotification, useExecuteAction } from "@/features/notifications";

interface NotificationDrawerProps {
  notification: Notification | null;
  onClose: () => void;
}

export default function NotificationDrawer({ notification, onClose }: NotificationDrawerProps) {
  const markReadMut = useMarkRead();
  const archiveMut = useArchiveNotification();
  const dismissMut = useDismissNotification();
  const executeMut = useExecuteAction();

  if (!notification) return null;

  const sevKey = (notification.severity || "info").toLowerCase();

  const severityColors: Record<string, string> = {
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    info: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  const severityIcons: Record<string, React.ReactNode> = {
    critical: <AlertCircle size={16} className="text-red-500" />,
    high: <AlertTriangle size={16} className="text-orange-500" />,
    medium: <AlertTriangle size={16} className="text-yellow-500" />,
    low: <Info size={16} className="text-blue-500" />,
    info: <Info size={16} className="text-green-500" />,
  };

  const handleAction = async (actionId: string) => {
    try {
      await executeMut.mutateAsync({ id: notification.id, actionId });
      onClose();
    } catch (err) {
      console.error("Action execution failed", err);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-md border-l border-border bg-surface p-6 shadow-2xl transition-transform duration-300 sm:max-w-lg flex flex-col justify-between">
        
        {/* Top Header Section */}
        <div>
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${severityColors[sevKey] || severityColors.info}`}>
                {notification.severity}
              </span>
              <span className="text-xs text-text-light capitalize">
                {notification.category}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="rounded-lg p-1 text-text-light hover:bg-sidebar-hover hover:text-text transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Title & Detail Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-text leading-snug flex items-center gap-2">
              {severityIcons[sevKey] || severityIcons.info}
              {notification.title}
            </h3>
            
            <p className="mt-4 text-sm text-text-light leading-relaxed bg-sidebar-hover p-4 rounded-xl border border-border">
              {notification.message}
            </p>

            {notification.metadata && typeof notification.metadata === "object" && (
              <div className="mt-6 rounded-xl border border-border bg-sidebar-hover/40 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-light">
                  Contextual Info & Metadata
                </h4>
                <div className="mt-2 space-y-2 text-xs">
                  {Object.entries(notification.metadata).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-border/40 last:border-0">
                      <span className="font-medium text-text-light capitalize">{key}</span>
                      <span className="text-text font-mono truncate max-w-[200px]">{JSON.stringify(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions section */}
        <div className="border-t border-border pt-6 mt-auto">
          {/* Smart Actions Block */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-light mb-2">
                Resolve Task (Smart Actions)
              </h4>
              <div className="flex flex-wrap gap-2">
                {[...notification.actions]
                  .sort((a, b) => (a.btnOrder ?? 0) - (b.btnOrder ?? 0))
                  .map((act) => (
                    <button
                      key={act.id}
                      onClick={() => handleAction(act.id)}
                      disabled={executeMut.isPending}
                      className="flex-1 min-w-[120px] rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {act.label}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Standard Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                markReadMut.mutate(notification.id);
                onClose();
              }}
              disabled={markReadMut.isPending}
              className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-2.5 text-xs font-medium text-text hover:bg-sidebar-hover transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Check size={16} className="mb-1 text-green-500" />
              Mark Read
            </button>
            <button
              onClick={() => {
                archiveMut.mutate(notification.id);
                onClose();
              }}
              disabled={archiveMut.isPending}
              className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-2.5 text-xs font-medium text-text hover:bg-sidebar-hover transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Archive size={16} className="mb-1 text-yellow-500" />
              Archive
            </button>
            <button
              onClick={() => {
                dismissMut.mutate(notification.id);
                onClose();
              }}
              disabled={dismissMut.isPending}
              className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-2.5 text-xs font-medium text-text hover:bg-sidebar-hover transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 size={16} className="mb-1 text-red-500" />
              Dismiss
            </button>
          </div>

          {notification.actionUrl && (
            <a
              href={notification.actionUrl}
              onClick={onClose}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-sidebar-hover border border-border py-2 text-center text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              <Link2 size={14} />
              {notification.actionLabel || "View Details"}
            </a>
          )}
        </div>

      </div>
    </>
  );
}
