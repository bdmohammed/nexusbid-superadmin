"use client";

import { useState, useMemo } from "react";
import { LayoutGrid, Table, Search, SlidersHorizontal, Plus, Edit, Copy, Eye, EyeOff, Archive } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

import type { SubscriptionPlan } from "@/types";

interface PricingPlansProps {
  plans: SubscriptionPlan[];
  loading: boolean;
}

export default function PricingPlans({ plans, loading }: PricingPlansProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "ARCHIVED">("ALL");

  const mappedPlans = useMemo(() => {
    return plans.map((plan) => {
      const version = plan.activeVersion;
      return {
        id: plan.id,
        name: version?.name || "Unnamed Plan",
        subtitle: version?.subtitle || "",
        price: `$${((version?.priceCents || 0) / 100).toFixed(0)}`,
        duration: version?.durationDays === 30 ? "month" : version?.durationDays === 365 ? "year" : `${version?.durationDays} days`,
        isRecurring: version?.isRecurring || false,
        featured: version?.isFeatured || false,
        badge: version?.badge || null,
        countries: version?.targetCountry || "Global",
        categories: version?.targetCategoryId ? "Category-Specific" : "All",
        users: 0,
        status: plan.status,
        version: version?.version || 1,
        planType: version?.planType || "all-access",
      };
    });
  }, [plans]);

  const filteredPlans = useMemo(() => {
    return mappedPlans.filter((plan) => {
      const matchesSearch = plan.name.toLowerCase().includes(search.toLowerCase()) ||
        plan.countries.toLowerCase().includes(search.toLowerCase()) ||
        plan.categories.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || plan.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [mappedPlans, search, statusFilter]);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="h-6 w-32 bg-border animate-pulse rounded" />
          <div className="h-9 w-40 bg-border animate-pulse rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-6 shadow-sm h-64 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-6 w-2/3 bg-border rounded" />
                <div className="h-4 w-full bg-border rounded" />
                <div className="h-4 w-5/6 bg-border rounded" />
              </div>
              <div className="h-8 w-1/2 bg-border rounded" />
              <div className="h-8 w-full bg-border rounded mt-4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Section Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text">Subscription Plans</h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {filteredPlans.length} Plans
          </span>
        </div>

        {/* View Toggle and Search bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
            <input
              type="text"
              placeholder="Search plans, countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-60 rounded-lg border border-border bg-surface pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Mode Toggles */}
          <div className="flex h-9 items-center rounded-lg border border-border bg-surface p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex h-7 w-8 items-center justify-center rounded-md transition ${
                viewMode === "cards" ? "bg-primary text-white shadow-sm" : "text-text-light hover:text-text"
              }`}
              title="Card View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex h-7 w-8 items-center justify-center rounded-md transition ${
                viewMode === "table" ? "bg-primary text-white shadow-sm" : "text-text-light hover:text-text"
              }`}
              title="Table View"
            >
              <Table size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Plans Render Container */}
      {viewMode === "cards" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl border bg-surface p-6 shadow-sm transition hover:shadow-md ${
                plan.featured ? "border-primary ring-1 ring-primary/20" : "border-border"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                  {plan.badge}
                </span>
              )}

              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/subscriptions/${plan.id}`}
                      className="text-lg font-bold text-text hover:text-primary transition"
                    >
                      {plan.name}
                    </Link>
                    <p className="mt-1 text-xs text-text-light line-clamp-2">{plan.subtitle}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-light border border-border rounded px-1.5 py-0.5 bg-background">
                    v{plan.version}
                  </span>
                </div>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-text">{plan.price}</span>
                  <span className="text-xs text-text-light">/{plan.duration}</span>
                </div>

                {/* Scope Details */}
                <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-text">
                  <div className="flex justify-between">
                    <span className="text-text-light">Countries:</span>
                    <span className="font-semibold">{plan.countries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Categories:</span>
                    <span className="font-semibold truncate max-w-[150px]">{plan.categories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Active Subscribers:</span>
                    <span className="font-semibold">{plan.users}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex gap-2 border-t border-border pt-4">
                <Link href={`/subscriptions/${plan.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Workspace
                  </Button>
                </Link>
                <div className="flex gap-1">
                  <button className="rounded p-1.5 text-text-light hover:bg-background hover:text-text" title="Duplicate">
                    <Copy size={14} />
                  </button>
                  <button className="rounded p-1.5 text-text-light hover:bg-background hover:text-text" title="Disable">
                    <EyeOff size={14} />
                  </button>
                  <button className="rounded p-1.5 text-text-light hover:bg-background hover:text-red-500" title="Archive">
                    <Archive size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full border-collapse text-left text-sm text-text">
            <thead className="bg-background text-xs uppercase text-text-light">
              <tr>
                <th className="px-6 py-4 font-semibold">Plan Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Pricing</th>
                <th className="px-6 py-4 font-semibold">Version</th>
                <th className="px-6 py-4 font-semibold">Target Scope</th>
                <th className="px-6 py-4 font-semibold">Subscribers</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-background/50 transition">
                  <td className="px-6 py-4 font-medium">
                    <Link href={`/subscriptions/${plan.id}`} className="hover:text-primary transition">
                      {plan.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold">{plan.planType}</td>
                  <td className="px-6 py-4 font-bold">{plan.price}/{plan.duration}</td>
                  <td className="px-6 py-4">v{plan.version}</td>
                  <td className="px-6 py-4 text-xs text-text-light">
                    {plan.countries} • {plan.categories}
                  </td>
                  <td className="px-6 py-4 font-semibold">{plan.users} users</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/subscriptions/${plan.id}`}>
                        <button className="rounded p-1 text-text-light hover:bg-background hover:text-text" title="Workspace">
                          <SlidersHorizontal size={14} />
                        </button>
                      </Link>
                      <button className="rounded p-1 text-text-light hover:bg-background hover:text-text" title="Duplicate">
                        <Copy size={14} />
                      </button>
                      <button className="rounded p-1 text-text-light hover:bg-background hover:text-text" title="Disable">
                        <EyeOff size={14} />
                      </button>
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
