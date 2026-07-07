"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Download,
  Upload,
  History,
  Pencil,
  Trash2,
  FolderOpen,
  User,
  AlertCircle,
  FolderKanban,
  CheckCircle2,
  XCircle,
  Filter,
  Loader2,
  Copy,
} from "lucide-react";
import { apiClient } from "@/lib/http";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";

// Local Interfaces
interface Category {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  activeTenderCount?: number;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  tendersCount: number;
}

interface AuditLog {
  id: string;
  actorId: string | null;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  before: Record<string, any> | null;
  after: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function CategoriesPage() {
  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    archived: 0,
    tendersCount: 0,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "ARCHIVED" | "ALL">("ALL");
  const [createdBy, setCreatedBy] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [unusedOnly, setUnusedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Selection & UI States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  
  // Modals & Drawers States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCategory, setHistoryCategory] = useState<Category | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [importLoading, setImportLoading] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Fetch Categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: pageSize,
      };
      if (search) params.search = search;
      if (status !== "ALL") params.status = status;
      if (createdBy) params.createdBy = createdBy;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (unusedOnly) params.unusedOnly = true;

      const { data } = await apiClient.get("/categories", { params });
      if (data.success && data.data) {
        setCategories(data.data.categories || []);
        setTotalItems(data.data.total || 0);
        if (data.data.stats) {
          setStats(data.data.stats);
        }
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to fetch categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, status, unusedOnly, dateFrom, dateTo]);

  // Toast Handler
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Search/Filters Actions
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCategories();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("ALL");
    setCreatedBy("");
    setDateFrom("");
    setDateTo("");
    setUnusedOnly(false);
    setCurrentPage(1);
  };

  // Create / Edit Action Form Submit
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: currentCategory.name,
        code: currentCategory.code || undefined,
        description: currentCategory.description || null,
        isActive: currentCategory.isActive !== undefined ? currentCategory.isActive : true,
      };

      if (drawerMode === "create") {
        await apiClient.post("/categories", payload);
        showToast("Category created successfully", "success");
      } else if (drawerMode === "edit" && currentCategory.id) {
        await apiClient.patch(`/categories/${currentCategory.id}`, payload);
        showToast("Category updated successfully", "success");
      }
      setDrawerOpen(false);
      fetchCategories();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to save category", "error");
    }
  };

  // Open Drawer helper
  const openCategoryDrawer = (mode: "create" | "edit" | "view", cat: Partial<Category> = {}) => {
    setDrawerMode(mode);
    setCurrentCategory({
      id: cat.id || "",
      name: cat.name || "",
      code: cat.code || "",
      description: cat.description || "",
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setDrawerOpen(true);
  };

  // Duplicate Category Helper
  const handleDuplicate = (cat: Category) => {
    openCategoryDrawer("create", {
      name: `${cat.name} (Copy)`,
      description: cat.description,
      isActive: cat.isActive,
    });
  };

  // View Category Audit History
  const viewAuditHistory = async (cat: Category) => {
    setHistoryCategory(cat);
    setHistoryOpen(true);
    setLogsLoading(true);
    try {
      const { data } = await apiClient.get(`/categories/${cat.id}/history`);
      if (data.success) {
        setAuditLogs(data.data || []);
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to fetch audit history", "error");
    } finally {
      setLogsLoading(false);
    }
  };

  // Delete category request
  const handleDeleteRequest = (cat: Category) => {
    if ((cat.activeTenderCount || 0) > 0) {
      showToast(`Cannot delete category. Used by ${cat.activeTenderCount} tenders.`, "error");
      return;
    }
    setCategoryToDelete(cat);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await apiClient.delete(`/categories/${categoryToDelete.id}`);
      showToast("Category deleted successfully", "success");
      setDeleteConfirmOpen(false);
      fetchCategories();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to delete category", "error");
    }
  };

  // Toggle Category Activation
  const toggleCategoryStatus = async (cat: Category) => {
    try {
      await apiClient.patch(`/categories/${cat.id}`, {
        isActive: !cat.isActive,
      });
      showToast(`Category ${!cat.isActive ? "activated" : "deactivated"} successfully`, "success");
      fetchCategories();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to update category status", "error");
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (categories.length === 0) return;
    const headers = ["ID", "Code", "Name", "Slug", "Description", "Status", "Tender Count", "Created At"];
    const rows = categories.map((cat) => [
      cat.id,
      cat.code,
      cat.name,
      cat.slug,
      cat.description || "",
      cat.isDeleted ? "Archived" : cat.isActive ? "Active" : "Inactive",
      cat.activeTenderCount || 0,
      new Date(cat.createdAt).toLocaleString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `categories_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import Submit
  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;
    setImportLoading(true);
    try {
      const { data } = await apiClient.post("/categories/batch", csvText, {
        headers: { "Content-Type": "text/csv" },
      });
      if (data.success && data.data) {
        showToast(
          `Batch processed: Created ${data.data.created}, Updated ${data.data.updated}, Deleted ${data.data.deleted} categories`,
          "success"
        );
        setImportOpen(false);
        setCsvText("");
        fetchCategories();
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to import CSV", "error");
    } finally {
      setImportLoading(false);
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = async (action: "activate" | "disable" | "archive") => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      const batchPayload = selectedIds.map((id) => {
        const cat = categories.find((c) => c.id === id);
        if (action === "archive") {
          return { action: "delete", code: cat?.code };
        } else {
          return {
            action: "upsert",
            code: cat?.code,
            name: cat?.name,
            isActive: action === "activate",
          };
        }
      });

      const { data } = await apiClient.post("/categories/batch", batchPayload);
      if (data.success) {
        showToast(`Bulk action processed successfully`, "success");
        setSelectedIds([]);
        fetchCategories();
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to process bulk status change", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    // Check if any has active tenders
    const inUse = categories.filter((c) => selectedIds.includes(c.id) && (c.activeTenderCount || 0) > 0);
    if (inUse.length > 0) {
      showToast(`Cannot delete selected categories. ${inUse.map((c) => c.name).join(", ")} are in use by tenders.`, "error");
      return;
    }

    setLoading(true);
    try {
      const batchPayload = selectedIds.map((id) => {
        const cat = categories.find((c) => c.id === id);
        return { action: "delete", code: cat?.code };
      });

      const { data } = await apiClient.post("/categories/batch", batchPayload);
      if (data.success) {
        showToast(`Bulk deleted selected categories`, "success");
        setSelectedIds([]);
        fetchCategories();
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to delete categories", "error");
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(categories.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Categories</h1>
          <p className="mt-1 text-text-light">
            Manage marketplace categories, active tender usages, and CSV batch processing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" leftIcon={Upload} onClick={() => setImportOpen(true)}>
            Import CSV
          </Button>
          <Button variant="secondary" leftIcon={Download} onClick={handleExportCSV}>
            Export
          </Button>
          <Button leftIcon={Plus} onClick={() => openCategoryDrawer("create")}>
            Create Category
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { title: "Total Categories", value: stats.total, color: "bg-blue-100 text-blue-600", icon: FolderKanban },
          { title: "Active Categories", value: stats.active, color: "bg-green-100 text-green-600", icon: CheckCircle2 },
          { title: "Inactive/Disabled", value: stats.inactive, color: "bg-yellow-100 text-yellow-600", icon: XCircle },
          { title: "Archived Categories", value: stats.archived, color: "bg-red-100 text-red-600", icon: Trash2 },
          { title: "Tenders Using Categories", value: stats.tendersCount, color: "bg-indigo-100 text-indigo-600", icon: FolderOpen },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-2xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition duration-200">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="mt-5 text-sm text-text-light">{card.title}</p>
              <h3 className="mt-1 text-3xl font-bold text-text">{card.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearchSubmit} className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Filter size={16} className="text-text-light" />
          <span className="text-sm font-semibold">Search & Advanced Filters</span>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search Name or Code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full pl-10 pr-4 rounded-xl border border-border bg-surface text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition focus:border-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
              <option value="ARCHIVED">Archived Only</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="Created By (Creator UUID)"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              className="h-11 w-full px-4 rounded-xl border border-border bg-surface text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-11 w-full px-3 rounded-xl border border-border bg-surface text-xs outline-none transition focus:border-primary"
              />
              <span className="absolute -top-2 left-3 bg-surface px-1 text-[10px] text-text-light font-medium">Created From</span>
            </div>
            <div className="relative flex-1">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-11 w-full px-3 rounded-xl border border-border bg-surface text-xs outline-none transition focus:border-primary"
              />
              <span className="absolute -top-2 left-3 bg-surface px-1 text-[10px] text-text-light font-medium">Created To</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unusedOnly}
              onChange={(e) => setUnusedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-text font-medium">Only unused categories (Tenders count = 0)</span>
          </label>

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button type="submit" leftIcon={Search}>
              Filter
            </Button>
          </div>
        </div>
      </form>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="w-14 px-5 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={categories.length > 0 && selectedIds.length === categories.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-text">Name</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-text">Code</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-text">Slug</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-text">Tenders</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-text">Status</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-text">Created By</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-text">Created At</th>
                <th className="w-24 px-5 py-4 text-center text-sm font-semibold text-text">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border bg-surface">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-text-light">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={20} />
                      Loading categories...
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-text-light">
                    No categories found. Try clearing filters or creating a new category.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  return (
                    <tr key={cat.id} className="hover:bg-background/50 transition duration-150">
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(cat.id)}
                          onChange={() => handleSelectOne(cat.id)}
                          className="h-4 w-4 rounded border-border accent-primary"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <span className="text-sm font-semibold text-text">
                            {cat.name}
                          </span>
                          {cat.description && (
                            <p className="text-xs text-text-light line-clamp-1 mt-0.5 max-w-xs">{cat.description}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-mono text-text">{cat.code}</td>
                      <td className="px-5 py-4 text-sm text-text-light">{cat.slug}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-text">{cat.activeTenderCount || 0}</td>

                      <td className="px-5 py-4">
                        <StatusBadge status={cat.isDeleted ? "Archived" : cat.isActive ? "Active" : "Inactive"} />
                      </td>

                      <td className="px-5 py-4 text-xs text-text-light">
                        {cat.createdByUser ? (
                          <div>
                            <p className="font-medium text-text">{cat.createdByUser.name}</p>
                            <p className="text-[10px]">{cat.createdByUser.email}</p>
                          </div>
                        ) : (
                          <span className="italic">System</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs text-text-light">
                        {new Date(cat.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="View Audit Logs"
                            onClick={() => viewAuditHistory(cat)}
                            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 transition"
                          >
                            <History size={16} />
                          </button>
                          <button
                            title="Edit Category"
                            onClick={() => openCategoryDrawer("edit", cat)}
                            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 transition"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            title="Duplicate Category"
                            onClick={() => handleDuplicate(cat)}
                            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 transition"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            title={cat.isActive ? "Deactivate" : "Activate"}
                            onClick={() => toggleCategoryStatus(cat)}
                            className={`p-1.5 rounded hover:bg-zinc-100 transition ${cat.isActive ? "text-amber-600" : "text-green-600"}`}
                          >
                            {cat.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                          </button>
                          <button
                            title="Delete"
                            onClick={() => handleDeleteRequest(cat)}
                            className={`p-1.5 rounded hover:bg-red-50 text-red-500 transition ${(cat.activeTenderCount || 0) > 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bulk Action Bar & Pagination */}
        <div className="flex flex-col gap-4 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between bg-zinc-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mr-2">
              {selectedIds.length} Selected
            </span>
            <Button
              variant="secondary"
              disabled={selectedIds.length === 0}
              onClick={() => handleBulkStatusChange("activate")}
            >
              Activate
            </Button>
            <Button
              variant="secondary"
              disabled={selectedIds.length === 0}
              onClick={() => handleBulkStatusChange("disable")}
            >
              Disable
            </Button>
            <Button
              variant="secondary"
              disabled={selectedIds.length === 0}
              onClick={() => handleBulkStatusChange("archive")}
            >
              Archive
            </Button>
            <Button
              className="!bg-red-50 hover:!bg-red-100 !text-red-600 border border-red-200"
              disabled={selectedIds.length === 0}
              onClick={handleBulkDelete}
            >
              Delete
            </Button>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Drawer: Create / Edit / View */}
      <Modal
        open={drawerOpen}
        title={drawerMode === "create" ? "Create New Category" : drawerMode === "edit" ? "Edit Category" : "Category Details"}
        width="max-w-2xl"
        onClose={() => setDrawerOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            {drawerMode !== "view" && (
              <Button onClick={handleSaveCategory}>
                {drawerMode === "create" ? "Create Category" : "Save Changes"}
              </Button>
            )}
          </>
        }
      >
        <form onSubmit={handleSaveCategory} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Category Name"
              name="name"
              placeholder="e.g. Civil Engineering"
              value={currentCategory.name || ""}
              onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
              required
              disabled={drawerMode === "view"}
            />

            <Input
              label="Category Code (3-digit NAICS)"
              name="code"
              placeholder={drawerMode === "create" ? "Auto-generates if empty" : ""}
              value={currentCategory.code || ""}
              onChange={(e) => setCurrentCategory({ ...currentCategory, code: e.target.value })}
              disabled={drawerMode !== "create"}
              maxLength={3}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              rows={4}
              placeholder="Detailed description of category activities..."
              value={currentCategory.description || ""}
              onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
              disabled={drawerMode === "view"}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <div className="flex items-center gap-4 h-11">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentCategory.isActive !== undefined ? currentCategory.isActive : true}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, isActive: e.target.checked })}
                  disabled={drawerMode === "view"}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ms-3 text-sm font-semibold text-text">
                  {currentCategory.isActive ? "Active / Enabled" : "Inactive / Disabled"}
                </span>
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Import CSV */}
      <Modal
        open={importOpen}
        title="Import Categories CSV"
        width="max-w-2xl"
        onClose={() => setImportOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportCSV} disabled={importLoading}>
              {importLoading ? "Processing..." : "Run Batch Import"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleImportCSV} className="space-y-4">
          <p className="text-sm text-text-light leading-relaxed">
            Format: CSV with headers <code className="bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded font-mono text-xs">action,code,name,slug,description,is_active</code>.
          </p>

          <div className="rounded-xl border border-border bg-background p-4 font-mono text-xs text-text-light space-y-1">
            <p className="text-text font-semibold mb-1">CSV Template Example:</p>
            <p>action,code,name,slug,description,is_active</p>
            <p>upsert,090,Demolition,demolition-works,Building demolition tasks,true</p>
            <p>upsert,091,Concrete Crush,concrete-crush,Concrete recycling operations,true</p>
            <p>delete,010,,,,</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Paste CSV Text</label>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="action,code,name,slug,description,is_active..."
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none font-mono text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Single Category Delete */}
      <Modal
        open={deleteConfirmOpen}
        title="Confirm Delete"
        width="max-w-md"
        onClose={() => setDeleteConfirmOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button className="!bg-red-600 hover:!bg-red-700 !text-white" onClick={handleConfirmDelete}>
              Delete Category
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <Trash2 size={24} />
          </div>
          <h4 className="text-lg font-bold text-text">Are you absolutely sure?</h4>
          <p className="text-sm text-text-light leading-relaxed">
            This will permanently remove the category <strong>{categoryToDelete?.name} ({categoryToDelete?.code})</strong>. This action cannot be undone.
          </p>
        </div>
      </Modal>

      {/* Modal: Audit Log History */}
      <Modal
        open={historyOpen}
        title={`Audit History: ${historyCategory?.name || "Category"}`}
        width="max-w-3xl"
        onClose={() => setHistoryOpen(false)}
        footer={
          <Button variant="secondary" onClick={() => setHistoryOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
          {logsLoading ? (
            <div className="py-10 text-center text-sm text-text-light flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-primary" size={18} />
              Loading history...
            </div>
          ) : auditLogs.length === 0 ? (
            <p className="text-sm text-text-light text-center py-10 italic">
              No audit logs recorded for this category yet.
            </p>
          ) : (
            <div className="relative border-l border-zinc-200 ml-4 space-y-6">
              {auditLogs.map((log) => {
                const changes = [];
                if (log.before && log.after) {
                  for (const key of Object.keys(log.after)) {
                    if (JSON.stringify(log.before[key]) !== JSON.stringify(log.after[key])) {
                      changes.push({
                        field: key,
                        from: log.before[key],
                        to: log.after[key],
                      });
                    }
                  }
                }

                return (
                  <div key={log.id} className="relative pl-6">
                    {/* Circle marker */}
                    <span className="absolute -left-[6px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-white"></span>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-text capitalize">
                          {log.action.replace("category.", "")} action
                        </span>
                        <span className="text-xs text-text-light font-mono">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-text-light mt-0.5">
                        <User size={12} />
                        <span>{log.actorEmail}</span>
                        {log.ipAddress && (
                          <span className="bg-zinc-100 text-zinc-600 px-1 rounded font-mono text-[10px]">
                            {log.ipAddress}
                          </span>
                        )}
                      </div>

                      {/* Diff Box */}
                      {changes.length > 0 && (
                        <div className="mt-2 text-xs border border-border rounded-xl p-3 bg-zinc-50/50 space-y-1.5">
                          <p className="font-semibold text-text-light text-[10px] uppercase tracking-wider">
                            Field Changes:
                          </p>
                          {changes.map((ch) => (
                            <div key={ch.field} className="grid grid-cols-3 gap-2">
                              <span className="font-semibold text-text">{ch.field}:</span>
                              <span className="text-red-600 line-through truncate">
                                {ch.from === null ? "null" : String(ch.from)}
                              </span>
                              <span className="text-green-600 font-medium truncate">
                                → {ch.to === null ? "null" : String(ch.to)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 max-w-md bg-zinc-900/95 text-white px-4 py-3.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <div className={`p-2 rounded-xl bg-white/10 ${toast.type === "error" ? "text-red-400" : toast.type === "success" ? "text-green-400" : "text-amber-400"}`}>
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-white/90 leading-tight">
              {toast.type === "error" ? "Action Failed" : toast.type === "success" ? "Action Completed" : "Notification"}
            </span>
            <span className="text-[11px] text-white/70 leading-normal">{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white/40 hover:text-white/80 text-sm ml-2 self-start p-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
