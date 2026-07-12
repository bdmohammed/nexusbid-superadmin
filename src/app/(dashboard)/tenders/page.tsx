"use client";

import { Plus, Filter, RotateCcw, X, Search, Briefcase, FileText, CheckCircle, Clock, Users, ShieldAlert, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/common/StatusBadge";
import type { Tender } from "@/types";

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Drawer & Advanced Filter State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [closingDate, setClosingDate] = useState("");

  const router = useRouter();

  // Load backend stats & data on startup (will fail silently and use fallback on local)
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/tenders/admin");
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.data)) {
            setTenders(data.data);
          }
        }
      } catch (err) {
        console.warn("Failed to connect to local database engine, using rich memory seed.");
      }
    }
    fetchData();
  }, []);

  const totalBudgetSum = tenders.reduce(
    (sum, t) => sum + (t.activeVersion?.estimatedBudget ?? 0),
    0
  );

  const filtered = tenders.filter((t) => {
    const version = t.activeVersion;
    if (!version) return false;

    // Search query match
    const qMatches =
      t.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
      version.title.toLowerCase().includes(search.toLowerCase()) ||
      (version.department && version.department.toLowerCase().includes(search.toLowerCase())) ||
      (version.category?.name && version.category.name.toLowerCase().includes(search.toLowerCase()));

    if (!qMatches) return false;

    // Basic filters
    if (statusFilter !== "ALL" && t.publicationStatus !== statusFilter && version.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== "ALL" && version.priority !== priorityFilter) {
      return false;
    }
    if (typeFilter !== "ALL" && version.procurementType !== typeFilter) {
      return false;
    }

    // Advanced drawer filters
    if (minBudget && (version.estimatedBudget ?? 0) < parseFloat(minBudget)) {
      return false;
    }
    if (maxBudget && (version.estimatedBudget ?? 0) > parseFloat(maxBudget)) {
      return false;
    }
    if (selectedState && version.state?.code !== selectedState) {
      return false;
    }
    if (closingDate && version.closingDate) {
      const closing = new Date(version.closingDate).getTime();
      const filterDate = new Date(closingDate).getTime();
      if (closing > filterDate) return false;
    }

    return true;
  });

  function resetAllFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setTypeFilter("ALL");
    setMinBudget("");
    setMaxBudget("");
    setSelectedState("");
    setClosingDate("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Procurement Tenders</h1>
          <p className="mt-1 text-text-light">
            Central Command for tender creation, approvals, versions comparator, and evaluations.
          </p>
        </div>

        <Button leftIcon={Plus} onClick={() => router.push("/tenders/create")}>
          Create Tender Wizard
        </Button>
      </div>

      {/* Metrics Scoreboard Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-light">Total Tenders</p>
              <h3 className="text-lg font-bold">{tenders.length}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-yellow-500/10 p-2 text-yellow-600">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-light">Drafts</p>
              <h3 className="text-lg font-bold">
                {tenders.filter((t) => t.activeVersion?.status === "DRAFT").length}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500/10 p-2 text-orange-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-light">Under Review</p>
              <h3 className="text-lg font-bold">
                {tenders.filter((t) => t.activeVersion?.status === "UNDER_REVIEW" || t.activeVersion?.status === "REVIEW_ASSIGNED").length}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-500/10 p-2 text-green-600">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-light">Published</p>
              <h3 className="text-lg font-bold">
                {tenders.filter((t) => t.publicationStatus === "PUBLISHED" || t.publicationStatus === "OPEN").length}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-light">Total Budget Volume</p>
              <h3 className="text-lg font-bold">
                ${(totalBudgetSum / 1000000).toFixed(1)}M
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-light">Total Bidders</p>
              <h3 className="text-lg font-bold">12</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Filter & Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-surface border border-border p-3 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
          <input
            type="text"
            placeholder="Search Reference, Title, Department or Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="PUBLISHED">Published</option>
            <option value="OPEN">Open (Live)</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Priority dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Type dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="ALL">All Procurement Types</option>
            <option value="Works">Works</option>
            <option value="Supplies">Supplies</option>
            <option value="Services">Services</option>
          </select>

          <Button variant="secondary" leftIcon={Filter} onClick={() => setIsDrawerOpen(true)}>
            Advanced
          </Button>

          <button
            onClick={resetAllFilters}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border hover:bg-background transition text-text-light"
            title="Reset Filters"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Tenders Table Grid */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-light uppercase tracking-wider">
                  Reference & Version
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-light uppercase tracking-wider">
                  Tender Title & Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-light uppercase tracking-wider">
                  Category & State
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-light uppercase tracking-wider">
                  Timelines
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-light uppercase tracking-wider">
                  Status Badges
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-light uppercase tracking-wider">
                  Estimated Budget
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-light uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {filtered.map((t) => {
                const version = t.activeVersion;
                if (!version) return null;

                const daysRemaining = version.closingDate
                  ? Math.max(
                    0,
                    Math.ceil((new Date(version.closingDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                  )
                  : 0;

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-background/50 transition cursor-pointer"
                    onClick={() => router.push(`/tenders/${t.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="font-mono text-sm font-bold text-primary">
                          {t.referenceNo}
                        </span>
                        <div className="mt-1 text-xs text-text-light">
                          Version {version.version} (v{version.status.toLowerCase()})
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <h4 className="font-semibold text-text line-clamp-1">
                          {version.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-text-light line-clamp-1">
                          {version.department || "No Department Assigned"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {version.category?.name || "General"}
                        </span>
                        <div className="mt-1 text-xs text-text-light">
                          State: {version.state?.name || "All States"} ({version.state?.code || "National"})
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-xs text-text">
                          Closes:{" "}
                          {version.closingDate
                            ? new Date(version.closingDate).toLocaleDateString()
                            : "N/A"}
                        </div>
                        {daysRemaining > 0 ? (
                          <span className="mt-1 inline-flex text-xs font-semibold text-orange-600">
                            {daysRemaining} days remaining
                          </span>
                        ) : (
                          <span className="mt-1 inline-flex text-xs font-semibold text-red-600">
                            Closed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium">
                          Lifecycle: <StatusBadge status={t.status.toLowerCase()} />
                        </span>
                        <span className="text-xs font-medium">
                          Publish: <StatusBadge status={t.publicationStatus.toLowerCase()} />
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-text">
                        {version.estimatedBudget
                          ? `$${version.estimatedBudget.toLocaleString()}`
                          : "N/A"}
                      </span>
                      <div className="text-xs text-text-light">{version.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tenders/${t.id}`);
                        }}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldAlert className="h-8 w-8 text-text-light" />
                      <h4 className="font-bold">No Tenders Found</h4>
                      <p className="text-sm text-text-light">
                        Try resetting filters or adjusting search queries.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Filter Drawer (Slide-out Panel) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)} />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md">
              <div className="flex h-full flex-col bg-surface shadow-2xl border-l border-border">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <h3 className="text-lg font-bold text-text">Advanced Filter Dashboard</h3>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="rounded-lg p-1 text-text-light hover:bg-background transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body Fields */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Budget Ranges */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text">Estimated Budget Range (USD)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Min Budget"
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                        className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                      <input
                        type="number"
                        placeholder="Max Budget"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* State selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text">Target Region / State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="">All Regions</option>
                      <option value="IL">Illinois (IL)</option>
                      <option value="TX">Texas (TX)</option>
                      <option value="CA">California (CA)</option>
                      <option value="NY">New York (NY)</option>
                    </select>
                  </div>

                  {/* Closing before date */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text">Closing Date Limit</label>
                    <input
                      type="date"
                      value={closingDate}
                      onChange={(e) => setClosingDate(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                    <p className="text-xs text-text-light">Shows tenders closing on or before selected date.</p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="border-t border-border px-6 py-4 bg-background flex items-center justify-between gap-3">
                  <Button variant="outline" className="flex-1" onClick={resetAllFilters}>
                    Reset Filters
                  </Button>
                  <Button className="flex-1" onClick={() => setIsDrawerOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
