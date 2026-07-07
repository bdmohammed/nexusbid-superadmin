"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Layers,
  DollarSign,
  Briefcase,
  Globe,
  Tag,
  Users,
  History,
  FileText,
  ShieldAlert,
  Send,
  CheckCircle,
  AlertTriangle,
  Play,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/ui/Button";

type TabName =
  | "overview"
  | "pricing"
  | "features"
  | "restrictions"
  | "countries"
  | "categories"
  | "coupons"
  | "subscribers"
  | "history"
  | "review";

export default function PlanWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const planId = resolvedParams.id;
  const [activeTab, setActiveTab] = useState<TabName>("overview");
  const [migrationOpen, setMigrationOpen] = useState(false);
  const [selectedTargetVersion, setSelectedTargetVersion] = useState("v3");

  // Mock workspace plan details
  const planDetails = {
    id: planId,
    referenceNo: "PLN-001",
    name: "Professional Plan",
    status: "ACTIVE",
    activeVersion: {
      version: 2,
      status: "PUBLISHED",
      price: "$49/month",
      description: "Standard plan for medium organizations with full analytical access.",
      setupFee: "$0",
      trialDays: 14,
      durationDays: 30,
    },
    versions: [
      { version: 3, status: "APPROVED", date: "2026-07-05", author: "Sarah Jenkins" },
      { version: 2, status: "PUBLISHED", date: "2026-06-12", author: "Mike Ross" },
      { version: 1, status: "ARCHIVED", date: "2026-04-01", author: "Mike Ross" },
    ],
    features: [
      { key: "max_tenders", value: "50 bids/month" },
      { key: "api_access", value: "Restricted (Read-Only)" },
      { key: "ai_search", value: "Included" },
    ],
    restrictions: [
      { key: "concurrent_bids", value: "5 active bids max" },
      { key: "email_notifications", value: "Daily digest only" },
    ],
    countries: [
      { name: "United States", currency: "USD", price: "$49.00" },
      { name: "Canada", currency: "CAD", price: "$65.00" },
      { name: "United Kingdom", currency: "GBP", price: "£38.00" },
    ],
    categories: ["IT & Technology", "Medical Equipment", "General Construction"],
    coupons: [
      { code: "JULY4TH", discount: "20% off", status: "Active", used: "12 / 100" },
      { code: "WELCOME50", discount: "$50 off setup", status: "Expired", used: "50 / 50" },
    ],
    subscribers: [
      { company: "Vertex Labs LLC", email: "billing@vertex.io", since: "2026-05-18", status: "Active", nextBilling: "2026-07-18" },
      { company: "Prime Tech Corp", email: "admin@primetech.net", since: "2026-06-01", status: "Active", nextBilling: "2026-07-01" },
      { company: "Apex Logistics", email: "ap@apexlog.com", since: "2026-02-14", status: "Suspended", nextBilling: "N/A" },
    ],
    history: [
      { event: "Plan Version 3 Approved", user: "Sarah Jenkins", timestamp: "2026-07-05 14:22" },
      { event: "Plan Version 3 Submitted for Review", user: "John Doe", timestamp: "2026-07-04 11:05" },
      { event: "Plan Version 2 Published", user: "Mike Ross", timestamp: "2026-06-12 09:00" },
    ],
    reviews: {
      status: "UNDER_REVIEW",
      reviewer: "Sarah Jenkins",
      comments: [
        { author: "Sarah Jenkins", text: "Approved the version 3 pricing increase. Let's schedule the migration.", date: "2026-07-05 14:20" },
        { author: "John Doe", text: "Please review the updated features list for v3.", date: "2026-07-04 11:00" },
      ]
    }
  };

  const tabsList: { name: TabName; label: string; icon: any }[] = [
    { name: "overview", label: "Overview", icon: FileText },
    { name: "pricing", label: "Pricing", icon: DollarSign },
    { name: "features", label: "Features", icon: Layers },
    { name: "restrictions", label: "Restrictions", icon: ShieldAlert },
    { name: "countries", label: "Countries", icon: Globe },
    { name: "categories", label: "Categories", icon: Briefcase },
    { name: "coupons", label: "Coupons", icon: Tag },
    { name: "subscribers", label: "Subscribers", icon: Users },
    { name: "history", label: "Audit History", icon: History },
    { name: "review", label: "Review Board", icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/subscriptions"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-light hover:text-text transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text">{planDetails.name}</h1>
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {planDetails.referenceNo}
              </span>
            </div>
            <p className="text-xs text-text-light mt-0.5">
              Aggregate Root ID: <code className="text-primary">{planId}</code>
            </p>
          </div>
        </div>

        {/* Top bar controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMigrationOpen(true)}>
            Migrate Subscribers
          </Button>
          <Button size="sm">Create New Version Draft</Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex overflow-x-auto border-b border-border bg-surface p-1 rounded-xl">
        {tabsList.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-light hover:bg-background hover:text-text"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm min-h-[400px]">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-light">Active Version</span>
                    <p className="font-semibold text-text mt-0.5">v{planDetails.activeVersion.version}</p>
                  </div>
                  <div>
                    <span className="text-text-light">Billing Status</span>
                    <p className="font-semibold text-emerald-500 mt-0.5">{planDetails.status}</p>
                  </div>
                  <div>
                    <span className="text-text-light">Trial Period</span>
                    <p className="font-semibold text-text mt-0.5">{planDetails.activeVersion.trialDays} Days</p>
                  </div>
                  <div>
                    <span className="text-text-light">Duration Cycle</span>
                    <p className="font-semibold text-text mt-0.5">{planDetails.activeVersion.durationDays} Days</p>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-text-light">Description</span>
                  <p className="mt-1 text-text leading-relaxed">{planDetails.activeVersion.description}</p>
                </div>
              </div>

              <div className="border-l border-border pl-6 space-y-4">
                <h3 className="text-lg font-bold text-text">Version Management</h3>
                <div className="space-y-3">
                  {planDetails.versions.map((v) => (
                    <div key={v.version} className="flex items-center justify-between border border-border p-3 rounded-xl bg-background">
                      <div>
                        <p className="font-bold text-sm text-text">Version {v.version}</p>
                        <p className="text-xs text-text-light">Created on {v.date} by {v.author}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        v.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : v.status === "APPROVED"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-text-light/10 text-text-light"
                      }`}>
                        {v.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-text">Pricing Overrides</h3>
            <p className="text-xs text-text-light">Geographical pricing and category overrides assigned to this plan version.</p>
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-xs uppercase text-text-light">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Scope/Region</th>
                    <th className="px-6 py-3 font-semibold">Currency</th>
                    <th className="px-6 py-3 font-semibold">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 font-semibold">Base Price (Default)</td>
                    <td className="px-6 py-4">USD</td>
                    <td className="px-6 py-4 font-bold">{planDetails.activeVersion.price}</td>
                  </tr>
                  {planDetails.countries.map((c) => (
                    <tr key={c.name} className="hover:bg-background/40">
                      <td className="px-6 py-4">{c.name} (Regional)</td>
                      <td className="px-6 py-4">{c.currency}</td>
                      <td className="px-6 py-4 font-bold">{c.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "features" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-text">Included Features</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {planDetails.features.map((feat) => (
                <div key={feat.key} className="flex items-center justify-between border border-border p-4 rounded-xl bg-background">
                  <div>
                    <p className="font-bold text-sm text-text capitalize">{feat.key.replace("_", " ")}</p>
                    <p className="text-xs text-text-light mt-0.5">Feature catalog rule value</p>
                  </div>
                  <span className="rounded bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {feat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "restrictions" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-text">System Restrictions</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {planDetails.restrictions.map((r) => (
                <div key={r.key} className="flex items-center justify-between border border-border p-4 rounded-xl bg-background">
                  <div>
                    <p className="font-bold text-sm text-text capitalize">{r.key.replace("_", " ")}</p>
                    <p className="text-xs text-text-light mt-0.5">Usage block limit</p>
                  </div>
                  <span className="rounded bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500">
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "countries" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text">Country Targeting</h3>
            <div className="flex flex-wrap gap-2">
              {planDetails.countries.map((c) => (
                <span key={c.name} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-text">
                  <Globe size={12} className="text-primary" />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text">Procurement Categories Scope</h3>
            <div className="flex flex-wrap gap-2">
              {planDetails.categories.map((cat) => (
                <span key={cat} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-text">
                  <Briefcase size={12} className="text-primary" />
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === "coupons" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-text">Associated Coupons</h3>
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-xs uppercase text-text-light">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Coupon Code</th>
                    <th className="px-6 py-3 font-semibold">Value Discount</th>
                    <th className="px-6 py-3 font-semibold">Redemptions</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {planDetails.coupons.map((c) => (
                    <tr key={c.code} className="hover:bg-background/40">
                      <td className="px-6 py-4"><code className="font-bold text-primary">{c.code}</code></td>
                      <td className="px-6 py-4 font-semibold">{c.discount}</td>
                      <td className="px-6 py-4 text-xs text-text-light">{c.used}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          c.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "subscribers" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-text">Active Plan Subscribers</h3>
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-xs uppercase text-text-light">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Company Name</th>
                    <th className="px-6 py-3 font-semibold">Billing Email</th>
                    <th className="px-6 py-3 font-semibold">Active Since</th>
                    <th className="px-6 py-3 font-semibold">Next Invoice</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {planDetails.subscribers.map((s) => (
                    <tr key={s.company} className="hover:bg-background/40">
                      <td className="px-6 py-4 font-bold">{s.company}</td>
                      <td className="px-6 py-4 text-text-light">{s.email}</td>
                      <td className="px-6 py-4">{s.since}</td>
                      <td className="px-6 py-4 font-semibold">{s.nextBilling}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          s.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-text">Audit History Trail</h3>
            <div className="relative border-l border-border pl-6 ml-3 space-y-6">
              {planDetails.history.map((hist, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary border-2 border-surface" />
                  <p className="text-sm font-semibold text-text">{hist.event}</p>
                  <p className="text-xs text-text-light mt-0.5">by {hist.user} on {hist.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "review" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text">Plan Approval Review Board</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-500">
                <AlertTriangle size={12} />
                {planDetails.reviews.status}
              </span>
            </div>

            <div className="space-y-4">
              {planDetails.reviews.comments.map((comment, idx) => (
                <div key={idx} className="border border-border p-4 rounded-xl bg-background">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-text">{comment.author}</span>
                    <span className="text-xs text-text-light">{comment.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-text leading-relaxed">{comment.text}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="font-semibold text-sm">Submit Review Comment</h4>
              <textarea
                placeholder="Leave review comments here..."
                rows={3}
                className="w-full rounded-xl border border-border p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <div className="flex gap-2">
                <Button size="sm">Approve Version</Button>
                <Button variant="outline" size="sm">Request Changes</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Migration Batch Drawer / Modal */}
      {migrationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
          <div className="h-full w-full max-w-md border-l border-border bg-surface p-6 shadow-2xl transition-transform">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text">Batch Subscription Migration</h3>
              <button
                onClick={() => setMigrationOpen(false)}
                className="text-text-light hover:text-text font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <p className="text-xs text-text-light leading-relaxed">
                Migrate subscribers in batch from the current active version (v2) to another approved version. This action updates subscriber plan configuration records.
              </p>

              <div>
                <label className="text-xs font-semibold text-text-light uppercase tracking-wider">Source Version</label>
                <div className="mt-1.5 rounded-lg border border-border bg-background p-3 font-semibold text-sm">
                  v2 (Active)
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-light uppercase tracking-wider">Target Approved Version</label>
                <select
                  value={selectedTargetVersion}
                  onChange={(e) => setSelectedTargetVersion(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                >
                  <option value="v3">v3 (Approved on 2026-07-05)</option>
                </select>
              </div>

              <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-xs text-amber-600 leading-relaxed flex gap-2">
                <AlertTriangle size={18} className="shrink-0" />
                <span>
                  <strong>Caution:</strong> This will affect 2 active subscribers on this plan. Batch updates will process in the background.
                </span>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex gap-3">
              <Button
                className="flex-1"
                leftIcon={Play}
                onClick={() => {
                  alert("Subscription migration triggered successfully in the background!");
                  setMigrationOpen(false);
                }}
              >
                Start Migration
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setMigrationOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
