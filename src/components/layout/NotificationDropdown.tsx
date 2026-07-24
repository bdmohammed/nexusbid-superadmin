"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, ShieldAlert, Check, Settings, Eye, Info, AlertTriangle } from "lucide-react";
import {
  useNotifications, useMarkAllRead, useNotificationStats, notificationQueryKeys
} from "@/features/notifications";
import type { Notification } from "@/types";
import { clientEnv } from "@/env/client";

export default function NotificationDropdown() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: stats } = useNotificationStats();
  const { data: listData } = useNotifications({
    status: "UNREAD",
    page: 1,
    limit: 5,
  });

  const markAllReadMut = useMarkAllRead();
  const unreadNotifications = (listData?.notifications ?? []) as unknown as Notification[];

  // Live SSE listener for real-time unread updates
  useEffect(() => {
    const url = `${clientEnv.NEXT_PUBLIC_API_URL}/api/v1/notifications/stream`;
    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.addEventListener("notification:new", () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    });

    eventSource.addEventListener("error", () => {
      // Quiet fail to allow retries in background
    });

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const severityIcons: Record<string, React.ReactNode> = {
    critical: <ShieldAlert size={14} className="text-red-500" />,
    high: <AlertTriangle size={14} className="text-orange-500" />,
    medium: <AlertTriangle size={14} className="text-yellow-500" />,
    low: <Info size={14} className="text-blue-500" />,
    info: <Info size={14} className="text-green-500" />,
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface p-1 text-text-light transition-colors hover:bg-sidebar-hover cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {stats && stats.unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-surface">
            {stats.unread > 99 ? "99+" : stats.unread}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-surface shadow-2xl p-4 transition-all duration-200">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="text-sm font-bold text-text flex items-center gap-1.5">
              <Bell size={16} className="text-primary" />
              Notifications Cockpit
            </h4>
            {stats && stats.unread > 0 && (
              <button
                onClick={() => markAllReadMut.mutate()}
                disabled={markAllReadMut.isPending}
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Check size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* Severity Stats Grid */}
          <div className="grid grid-cols-3 gap-2 py-2.5 my-2 rounded-xl bg-sidebar-hover/40 text-center text-xs">
            <div>
              <p className="font-semibold text-red-500">{stats?.critical ?? 0}</p>
              <p className="text-[10px] text-text-light font-medium uppercase tracking-wider">Critical</p>
            </div>
            <div className="border-x border-border">
              <p className="font-semibold text-orange-500">{stats?.warning ?? 0}</p>
              <p className="text-[10px] text-text-light font-medium uppercase tracking-wider">Warnings</p>
            </div>
            <div>
              <p className="font-semibold text-green-500">{stats?.info ?? 0}</p>
              <p className="text-[10px] text-text-light font-medium uppercase tracking-wider">Info</p>
            </div>
          </div>

          {/* Unread Items List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-border/60">
            {unreadNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-light">
                No unread notifications
              </div>
            ) : (
              unreadNotifications.map((notif) => {
                const sevKey = (notif.severity || "info").toLowerCase();
                return (
                  <Link
                    key={notif.id}
                    href="/notifications"
                    onClick={() => setIsOpen(false)}
                    className="flex items-start gap-3 py-3 hover:bg-sidebar-hover/30 px-1 rounded-lg transition-colors group"
                  >
                    <span className="mt-0.5 shrink-0">
                      {severityIcons[sevKey] || severityIcons.info}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text group-hover:text-primary transition-colors truncate">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-text-light line-clamp-2 mt-0.5 leading-snug">
                        {notif.message}
                      </p>
                      <p className="text-[9px] text-text-light/80 mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-border pt-3 mt-2 text-xs font-semibold">
            <Link
              href="/profile?tab=preferences"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 text-text-light hover:text-text transition-colors"
            >
              <Settings size={12} />
              Settings
            </Link>
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 text-primary hover:text-primary-hover transition-colors"
            >
              <Eye size={12} />
              View All Notifications
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
