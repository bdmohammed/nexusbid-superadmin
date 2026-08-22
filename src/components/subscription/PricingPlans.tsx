"use client";

import { useMemo,useState } from "react";
import Link from "next/link";
import {
  Copy,
  EyeOff,
  Globe,
  Layers,
  LayoutGrid,
  RefreshCw,
  Search,
  Sparkles,
  Table,
  Users,
} from "lucide-react";

import type { SubscriptionPlan } from "@/types";
import StatusBadge from "@/components/common/StatusBadge";
import Button from "@/components/ui/Button";

interface PricingPlansProps {
  plans: SubscriptionPlan[];
  loading: boolean;
  onRefresh?: () => void;
}

export default function PricingPlans({
  plans,
  loading,
  onRefresh,
}: PricingPlansProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "ARCHIVED"
  >("ALL");

  const mappedPlans = useMemo(() => {
    return plans.map((plan) => {
      const version = plan.activeVersion;
      return {
        id: plan.id,
        referenceNo:
          plan.referenceNo || `PLN-${plan.id.slice(0, 4).toUpperCase()}`,
        name: version?.name || "Unnamed Plan",
        subtitle:
          version?.subtitle ||
          version?.description ||
          "No description provided.",
        price: `$${((version?.priceCents || 0) / 100).toFixed(0)}`,
        duration:
          version?.durationDays === 30
            ? "month"
            : version?.durationDays === 365
              ? "year"
              : `${version?.durationDays || 30} days`,
        isRecurring: version?.isRecurring ?? true,
        featured: version?.isFeatured || false,
        badge: version?.badge || null,
        countries: version?.targetCountry || "Global",
        categories: version?.targetCategoryId
          ? "Category-Specific"
          : "All Categories",
        users: 0,
        status: plan.status || "ACTIVE",
        version: version?.version || 1,
        planType: version?.planType || "all-access",
      };
    });
  }, [plans]);

  const filteredPlans = useMemo(() => {
    return mappedPlans.filter((plan) => {
      const matchesSearch =
        plan.name.toLowerCase().includes(search.toLowerCase()) ||
        plan.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
        plan.countries.toLowerCase().includes(search.toLowerCase()) ||
        plan.categories.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || plan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [mappedPlans, search, statusFilter]);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="h-6 w-40 bg-border animate-pulse rounded-lg" />
          <div className="h-9 w-48 bg-border animate-pulse rounded-lg" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-border bg-surface p-6 shadow-xs h-72 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-6 w-2/3 bg-border rounded-lg" />
                <div className="h-4 w-full bg-border rounded-lg" />
                <div className="h-4 w-5/6 bg-border rounded-lg" />
              </div>
              <div className="h-8 w-1/2 bg-border rounded-lg" />
              <div className="h-9 w-full bg-border rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Section Header Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight text-text">
                Subscription Tiers
              </h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {filteredPlans.length} Plans
              </span>
            </div>
            <p className="text-xs text-text-light mt-0.5">
              Overview of active billing tiers, target scopes, and pricing
              packages.
            </p>
          </div>
        </div>

        {/* View Toggle, Search bar & Refresh Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={onRefresh}
              className="text-xs py-2 px-3.5 h-10 font-semibold rounded-xl"
            >
              Refresh
            </Button>
          )}

          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
            <input
              type="text"
              placeholder="Search plans by name, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full sm:w-64 rounded-xl border border-border bg-surface-secondary pl-10 pr-8 text-xs sm:text-sm text-text placeholder:text-text-light outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-light hover:text-text text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 rounded-xl border border-border bg-surface-secondary px-3 text-xs sm:text-sm font-semibold text-text outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Card / Table Mode Switcher */}
          <div className="flex h-10 items-center rounded-xl border border-border bg-surface-secondary p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex h-8 w-9 items-center justify-center rounded-lg transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-light hover:text-text"
              }`}
              title="Card View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex h-8 w-9 items-center justify-center rounded-lg transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-light hover:text-text"
              }`}
              title="Table View"
            >
              <Table size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-surface/50">
          <Sparkles className="w-8 h-8 mx-auto text-text-light opacity-50 mb-2" />
          <h3 className="text-sm font-bold text-text">
            No subscription plans found
          </h3>
          <p className="text-xs text-text-light mt-1">
            Try adjusting your search keywords or status filters.
          </p>
        </div>
      )}

      {/* Plans Render Container */}
      {viewMode === "cards" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl border bg-surface p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:border-primary/50 ${
                plan.featured
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              }`}
            >
              {/* Featured Badge */}
              {plan.badge && (
                <span className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {plan.badge}
                </span>
              )}

              <div>
                {/* Header Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 truncate">
                    <Link
                      href={`/subscriptions/${plan.id}`}
                      className="text-base font-extrabold text-text hover:text-primary transition truncate block"
                    >
                      {plan.name}
                    </Link>
                    <span className="text-[10px] font-mono font-semibold text-text-light">
                      {plan.referenceNo}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-text-light border border-border rounded-md px-2 py-0.5 bg-surface-secondary shrink-0">
                    v{plan.version}
                  </span>
                </div>

                <p className="mt-2 text-xs text-text-light line-clamp-2 min-h-[32px]">
                  {plan.subtitle}
                </p>

                {/* Price Display */}
                <div className="mt-4 pt-4 border-t border-border flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-text tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs font-semibold text-text-light">
                    /{plan.duration}
                  </span>
                </div>

                {/* Scope & Details */}
                <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-text">
                  <div className="flex justify-between items-center">
                    <span className="text-text-light flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      Scope:
                    </span>
                    <span className="font-semibold text-xs">
                      {plan.countries}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-text-light flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Categories:
                    </span>
                    <span className="font-semibold text-xs truncate max-w-[140px]">
                      {plan.categories}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-text-light flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Status:
                    </span>
                    <StatusBadge
                      status={plan.status === "ACTIVE" ? "Active" : "Inactive"}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
                <Link href={`/subscriptions/${plan.id}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold py-1.5"
                  >
                    Workspace
                  </Button>
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    className="rounded-lg p-2 text-text-light hover:bg-surface-secondary hover:text-text transition cursor-pointer"
                    title="Duplicate Plan"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    className="rounded-lg p-2 text-text-light hover:bg-surface-secondary hover:text-text transition cursor-pointer"
                    title="Disable"
                  >
                    <EyeOff size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs">
          <table className="w-full border-collapse text-left text-sm text-text">
            <thead className="bg-surface-secondary text-[11px] font-bold uppercase tracking-wider text-text-light border-b border-border">
              <tr>
                <th className="px-6 py-3.5 font-bold">Plan Name</th>
                <th className="px-6 py-3.5 font-bold">Ref No</th>
                <th className="px-6 py-3.5 font-bold">Type</th>
                <th className="px-6 py-3.5 font-bold">Pricing</th>
                <th className="px-6 py-3.5 font-bold">Version</th>
                <th className="px-6 py-3.5 font-bold">Scope</th>
                <th className="px-6 py-3.5 font-bold">Status</th>
                <th className="px-6 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPlans.map((plan) => (
                <tr
                  key={plan.id}
                  className="hover:bg-surface-secondary/50 transition"
                >
                  <td className="px-6 py-4 font-semibold text-xs">
                    <Link
                      href={`/subscriptions/${plan.id}`}
                      className="hover:text-primary transition font-bold"
                    >
                      {plan.name}
                    </Link>
                    <p className="text-[11px] text-text-light font-normal line-clamp-1">
                      {plan.subtitle}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-text-light font-semibold">
                    {plan.referenceNo}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-light">
                    {plan.planType}
                  </td>
                  <td className="px-6 py-4 font-bold text-xs">
                    {plan.price}/{plan.duration}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium">
                    v{plan.version}
                  </td>
                  <td className="px-6 py-4 text-xs text-text-light font-medium">
                    {plan.countries} • {plan.categories}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={plan.status === "ACTIVE" ? "Active" : "Inactive"}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/subscriptions/${plan.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs py-1 px-2.5 h-7"
                        >
                          Workspace
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
