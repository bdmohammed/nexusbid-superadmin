"use client";

import React, { useEffect,useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Archive,
  Bell,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Info,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import NotificationDrawer from "./components/NotificationDrawer";

import type { Notification } from "@/types";
import { clientEnv } from "@/env/client";
import {
  notificationQueryKeys,
  useArchiveNotification,
  useDismissNotification,
  useMarkAllRead,
  useMarkRead,
  useNotificationCategories,
  useNotifications,
  useNotificationStats,
} from "@/features/notifications";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("UNREAD"); // UNREAD, READ, ARCHIVED
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const { data: categories = [] } = useNotificationCategories();
  const { data: stats } = useNotificationStats();

  const {
    data: listData,
    isLoading,
    refetch,
  } = useNotifications({
    status: activeTab,
    category: selectedCategory || undefined,
    severity: selectedSeverity || undefined,
    page,
    limit: 10,
  });

  const markAllReadMut = useMarkAllRead();
  const markReadMut = useMarkRead();
  const archiveMut = useArchiveNotification();
  const dismissMut = useDismissNotification();

  // Establish SSE connection for real-time notification push events
  useEffect(() => {
    const url = `${clientEnv.NEXT_PUBLIC_API_URL}/api/v1/notifications/stream`;
    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.addEventListener("notification:new", () => {
      // Invalidate the cache when a new notification arrives
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    });

    eventSource.addEventListener("error", (e) => {
      console.warn(
        "SSE Connection closed or failed. Retrying in background...",
        e,
      );
    });

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  const severityStyles: Record<string, string> = {
    critical: "border-red-500/30 bg-red-500/5 text-red-500",
    high: "border-orange-500/30 bg-orange-500/5 text-orange-500",
    medium: "border-yellow-500/30 bg-yellow-500/5 text-yellow-500",
    low: "border-blue-500/30 bg-blue-500/5 text-blue-500",
    info: "border-green-500/30 bg-green-500/5 text-green-500",
  };

  const notificationList = (listData?.notifications ??
    []) as unknown as Notification[];
  const total = listData?.total ?? 0;
  const totalPages = Math.ceil(total / 10) || 1;

  // Filter local search queries
  const filteredNotifications = notificationList.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-text-light">
            Manage your security notifications, review workflows, and platform
            events.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeTab === "UNREAD" && (
            <button
              onClick={() => markAllReadMut.mutate()}
              disabled={markAllReadMut.isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle size={16} />
              Mark All Read
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text hover:bg-sidebar-hover transition-colors cursor-pointer"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-light">
            Unread Events
          </p>
          <p className="mt-2 text-2xl font-bold text-text">
            {stats?.unread ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
            Critical Alerts
          </p>
          <p className="mt-2 text-2xl font-bold text-red-500">
            {stats?.critical ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
            Warnings
          </p>
          <p className="mt-2 text-2xl font-bold text-orange-500">
            {stats?.warning ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-500">
            System Info
          </p>
          <p className="mt-2 text-2xl font-bold text-green-500">
            {stats?.info ?? 0}
          </p>
        </div>
      </div>

      {/* Tabs and Filters Panel */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-4">
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {["UNREAD", "READ", "ARCHIVED"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? "bg-sidebar-hover text-primary"
                    : "text-text-light hover:text-text"
                }`}
              >
                {tab === "UNREAD"
                  ? "Unread"
                  : tab === "READ"
                    ? "Read"
                    : "Archived"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-light" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-4 text-sm text-text placeholder-text-light focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-text-light" />
            <span className="text-xs font-medium text-text-light">
              Category:
            </span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs font-medium text-text-light">
              Severity:
            </span>
          </div>
          <select
            value={selectedSeverity}
            onChange={(e) => {
              setSelectedSeverity(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text focus:outline-none cursor-pointer"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw size={24} className="animate-spin text-primary" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Bell size={40} className="text-text-light mb-3" />
            <h3 className="text-base font-semibold text-text">
              No notifications found
            </h3>
            <p className="mt-1 text-sm text-text-light">
              You are completely caught up! Enjoy your day.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNotifications.map((notif) => {
              const sevKey = (notif.severity || "info").toLowerCase();
              return (
                <div
                  key={notif.id}
                  onClick={() => setSelectedNotification(notif)}
                  className="group flex flex-col gap-4 p-5 transition-colors hover:bg-sidebar-hover cursor-pointer md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex gap-4 min-w-0">
                    <div className="mt-1 shrink-0">
                      <span
                        className={`inline-flex items-center justify-center rounded-xl border p-2 ${severityStyles[sevKey] || severityStyles.info}`}
                      >
                        {sevKey === "critical" || sevKey === "high" ? (
                          <AlertCircle size={16} />
                        ) : (
                          <Info size={16} />
                        )}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-text group-hover:text-primary transition-colors truncate">
                          {notif.title}
                        </h4>
                        <span className="shrink-0 rounded-lg bg-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-light">
                          {notif.category}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-text-light line-clamp-2 md:line-clamp-1">
                        {notif.message}
                      </p>
                      <p className="mt-1.5 text-[10px] text-text-light">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Inline Action Triggers */}
                  <div className="flex items-center justify-end gap-2 shrink-0 border-t border-border/40 pt-3 md:border-0 md:pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markReadMut.mutate(notif.id);
                      }}
                      disabled={markReadMut.isPending}
                      className="rounded-lg p-1.5 text-text-light hover:bg-surface hover:text-green-500 transition-colors cursor-pointer"
                      title="Mark as Read"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveMut.mutate(notif.id);
                      }}
                      disabled={archiveMut.isPending}
                      className="rounded-lg p-1.5 text-text-light hover:bg-surface hover:text-yellow-500 transition-colors cursor-pointer"
                      title="Archive"
                    >
                      <Archive size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissMut.mutate(notif.id);
                      }}
                      disabled={dismissMut.isPending}
                      className="rounded-lg p-1.5 text-text-light hover:bg-surface hover:text-red-500 transition-colors cursor-pointer"
                      title="Dismiss"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Panel */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border bg-sidebar-hover/40 px-6 py-4">
            <span className="text-xs text-text-light">
              Showing page <strong className="text-text">{page}</strong> of{" "}
              <strong className="text-text">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="rounded-lg border border-border bg-surface p-1.5 text-text hover:bg-sidebar-hover disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="rounded-lg border border-border bg-surface p-1.5 text-text hover:bg-sidebar-hover disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Drawer View */}
      {selectedNotification && (
        <NotificationDrawer
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
}
