"use client";

import { Plus, Filter, RotateCcw, X, Search, Briefcase, FileText, CheckCircle, Clock, Users, ShieldAlert, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/common/StatusBadge";
import type { Tender, TenderPublicationStatus, TenderVersionStatus } from "@/types";

// Premium curated mock data as fallback
const fallbacks: Tender[] = [
  {
    id: "tender-1",
    referenceNo: "TDR-2026-000101",
    activeVersionId: "ver-1",
    status: "ACTIVE",
    publicationStatus: "PUBLISHED",
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-01-12T10:00:00Z",
    activeVersion: {
      id: "ver-1",
      tenderId: "tender-1",
      version: 1,
      status: "APPROVED",
      title: "Design & Construction of New City Administrative Complex",
      description: "Comprehensive tender invitation for the architectural design, structural layouts, and civil construction of the upcoming modern administrative complex.",
      procurementType: "Works",
      priority: "High",
      estimatedBudget: 4500000,
      currency: "USD",
      department: "Public Infrastructure Board",
      placeId: "chicago_id_101",
      formattedAddress: "Loop District, Chicago, IL, USA",
      siteVisitRequired: true,
      siteVisitDate: "2026-02-15T10:00:00Z",
      siteVisitInstructions: "Report to Main Gate with security clearances.",
      contactPerson: "Sarah Jenkins",
      contactDesignation: "Chief Infrastructure Evaluator",
      contactEmail: "sjenkins@cityinfra.gov",
      contactPhone: "+1-312-555-0199",
      contactAlternative: null,
      openingDate: "2026-02-01T09:00:00Z",
      closingDate: "2026-03-31T17:00:00Z",
      bidValidity: 90,
      projectDuration: "24 Months",
      emdAmount: 50000,
      securityDeposit: 150000,
      paymentTerms: "Milestone-based progress payments",
      visibility: "public",
      evaluationMethod: "Quality & Cost Based Selection (QCBS)",
      submissionMethod: "Online portal submission only",
      contractType: "Lump Sum",
      procurementMethod: "Open Competitive Bidding",
      eligibilityCriteria: "Min 10 years experience in tier-1 commercial developments.",
      specialConditions: "Performance guarantees required prior to award.",
      categoryId: "cat-1",
      stateId: "state-1",
      category: { id: "cat-1", name: "Construction & Works", slug: "construction" },
      state: { id: "state-1", name: "Illinois", code: "IL", slug: "illinois" },
      createdAt: "2026-01-10T08:00:00Z"
    }
  },
  {
    id: "tender-2",
    referenceNo: "TDR-2026-000102",
    activeVersionId: "ver-2",
    status: "ACTIVE",
    publicationStatus: "OPEN",
    createdAt: "2026-02-05T09:30:00Z",
    updatedAt: "2026-02-06T14:15:00Z",
    activeVersion: {
      id: "ver-2",
      tenderId: "tender-2",
      version: 2,
      status: "APPROVED",
      title: "Supply and Commissioning of Enterprise Data Centers",
      description: "Procuring high-density servers, cooling systems, and uninterrupted power supply modules for the primary server farms.",
      procurementType: "Supplies",
      priority: "Medium",
      estimatedBudget: 1250000,
      currency: "USD",
      department: "Information Security Division",
      placeId: "austin_id_202",
      formattedAddress: "Tech Corridor, Austin, TX, USA",
      siteVisitRequired: false,
      siteVisitDate: null,
      siteVisitInstructions: null,
      contactPerson: "David Miller",
      contactDesignation: "Director of IT Operations",
      contactEmail: "dmiller@itops.org",
      contactPhone: "+1-512-555-0311",
      contactAlternative: null,
      openingDate: "2026-02-10T08:00:00Z",
      closingDate: "2026-04-15T18:00:00Z",
      bidValidity: 60,
      projectDuration: "6 Months",
      emdAmount: 15000,
      securityDeposit: 60000,
      paymentTerms: "30% advance, 70% post commissioning",
      visibility: "public",
      evaluationMethod: "Lowest Price Technically Compliant",
      submissionMethod: "Hybrid (Digital upload + physical backup BOQ)",
      contractType: "Supply & Commissioning",
      procurementMethod: "Global Invitation",
      eligibilityCriteria: "Certified platinum partner of tier-1 server OEMs.",
      specialConditions: "Extended warranty of 5 years is mandatory.",
      categoryId: "cat-2",
      stateId: "state-2",
      category: { id: "cat-2", name: "IT & Telecommunications", slug: "it-telecom" },
      state: { id: "state-2", name: "Texas", code: "TX", slug: "texas" },
      createdAt: "2026-02-05T09:30:00Z"
    }
  },
  {
    id: "tender-3",
    referenceNo: "TDR-2026-000103",
    activeVersionId: "ver-3",
    status: "ACTIVE",
    publicationStatus: "SCHEDULED",
    createdAt: "2026-03-01T11:00:00Z",
    updatedAt: "2026-03-02T09:00:00Z",
    activeVersion: {
      id: "ver-3",
      tenderId: "tender-3",
      version: 1,
      status: "DRAFT",
      title: "Statewide Renewable Wind Energy Grid Feasibility Assessment",
      description: "Seeking consultations for wind speeds modeling, onshore grid connectivity, and regulatory environmental impact studies.",
      procurementType: "Services",
      priority: "Low",
      estimatedBudget: 320000,
      currency: "USD",
      department: "Energy Conservation Authority",
      placeId: "sac_id_303",
      formattedAddress: "Capital Drive, Sacramento, CA, USA",
      siteVisitRequired: false,
      siteVisitDate: null,
      siteVisitInstructions: null,
      contactPerson: "Dr. Elena Rostova",
      contactDesignation: "Grid Strategy Lead",
      contactEmail: "erostova@cleanenergy.state.gov",
      contactPhone: "+1-916-555-0812",
      contactAlternative: null,
      openingDate: "2026-04-01T09:00:00Z",
      closingDate: "2026-05-15T17:00:00Z",
      bidValidity: 120,
      projectDuration: "12 Months",
      emdAmount: 5000,
      securityDeposit: 20000,
      paymentTerms: "Quarterly payments on deliverable approvals",
      visibility: "public",
      evaluationMethod: "Quality Cost Ratio 80:20",
      submissionMethod: "Digital only",
      contractType: "Consultancy Services",
      procurementMethod: "National Competitive Bid",
      eligibilityCriteria: "Consultants must have completed at least 3 grid-scale wind energy studies.",
      specialConditions: "All survey raw assets must be hosted in secure state server repositories.",
      categoryId: "cat-3",
      stateId: "state-3",
      category: { id: "cat-3", name: "Consulting & Services", slug: "consulting" },
      state: { id: "state-3", name: "California", code: "CA", slug: "california" },
      createdAt: "2026-03-01T11:00:00Z"
    }
  }
];

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>(fallbacks);
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
