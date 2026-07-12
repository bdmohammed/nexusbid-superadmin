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
  ChevronDown,
  ChevronRight,
  GitCommit,
  GitPullRequest,
  Move,
  GitMerge,
  Eye,
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
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  parentId: string | null;
  level: number;
  path: string;
  sortOrder: number;
  tenderCount: number;
  childrenCount: number;
  activeChildren: number;
  dbVersion: number;
  createdAt: string;
  updatedAt: string;
  activeVersionId?: string;
  seo?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
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

interface Review {
  id: string;
  categoryId: string;
  categoryVersionId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
  policy: string;
  createdAt: string;
  category?: {
    id: string;
    code: string;
  };
  categoryVersion?: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    parentId: string | null;
    version: number;
  };
  assignments?: {
    id: string;
    reviewerId: string;
    status: string;
    reviewer?: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  comments?: {
    id: string;
    action: string;
    comment: string;
    createdAt: string;
    user?: {
      name: string;
    };
  }[];
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export default function CategoriesPage() {
  // Tab State: "tree" | "list" | "reviews"
  const [activeTab, setActiveTab] = useState<"tree" | "list" | "reviews">("tree");

  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [treeCategories, setTreeCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    archived: 0,
    tendersCount: 0,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "ARCHIVED" | "ALL">("ALL");
  const [createdBy, setCreatedBy] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [unusedOnly, setUnusedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Tree Expansion state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

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

  // Move parent state
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveCategory, setMoveCategory] = useState<Category | null>(null);
  const [selectedNewParentId, setSelectedNewParentId] = useState<string>("");
  const [moveLoading, setMoveLoading] = useState(false);

  // Merge state
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeSource, setMergeSource] = useState<Category | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>("");
  const [mergeLoading, setMergeLoading] = useState(false);

  // Submit Review State
  const [submitReviewOpen, setSubmitReviewOpen] = useState(false);
  const [submitReviewCategory, setSubmitReviewCategory] = useState<Category | null>(null);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>([]);
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);

  // Review Decision State
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [decisionAction, setDecisionAction] = useState<"APPROVE" | "REJECT" | "CHANGES_REQUESTED">("APPROVE");
  const [decisionComment, setDecisionComment] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);

  // Fetch Categories List (Tab: list)
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
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to fetch categories list", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Categories Tree (Tab: tree)
  const fetchCategoryTree = async () => {
    treeLoading || setTreeLoading(true);
    try {
      const { data } = await apiClient.get("/categories", { params: { tree: true } });
      if (data.success && data.data) {
        setTreeCategories(data.data.categories || []);
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to fetch category tree", "error");
    } finally {
      setTreeLoading(false);
    }
  };

  // Fetch Category Reviews (Tab: reviews)
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const { data } = await apiClient.get("/categories/reviews", { params: { status: "PENDING" } });
      if (data.success && data.data) {
        setReviews(data.data || []);
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to fetch category reviews", "error");
    } finally {
      setReviewsLoading(false);
    }
  };

  // Fetch Admin Users for Reviewer assignments
  const fetchAdminUsers = async () => {
    try {
      const { data } = await apiClient.get("/admin/users", { params: { limit: 100 } });
      if (data.success && data.data) {
        setAdminUsers(data.data.users || []);
      }
    } catch {
      // fallback
    }
  };

  // Fetch stats from analytics
  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get("/categories/analytics");
      if (data.success && data.data) {
        setStats({
          total: data.data.total || 0,
          active: data.data.total || 0,
          inactive: data.data.unused || 0,
          archived: 0,
          tendersCount: 0,
        });
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAdminUsers();
  }, []);

  useEffect(() => {
    if (activeTab === "tree") {
      fetchCategoryTree();
    } else if (activeTab === "list") {
      fetchCategories();
    } else if (activeTab === "reviews") {
      fetchReviews();
    }
  }, [activeTab, currentPage, status, unusedOnly, dateFrom, dateTo]);

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
    if (activeTab === "tree") {
      // Simple filter tree client-side or re-query tree
      fetchCategoryTree();
    } else {
      fetchCategories();
    }
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
        parentId: currentCategory.parentId || undefined,
        sortOrder: Number(currentCategory.sortOrder) || 0,
      };

      if (drawerMode === "create") {
        await apiClient.post("/categories", payload);
        showToast("Category draft created successfully", "success");
      } else if (drawerMode === "edit" && currentCategory.id) {
        await apiClient.patch(`/categories/${currentCategory.id}`, payload);
        showToast("Category draft updated successfully", "success");
      }
      setDrawerOpen(false);
      refreshActiveTab();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to save category", "error");
    }
  };

  const refreshActiveTab = () => {
    fetchStats();
    if (activeTab === "tree") {
      fetchCategoryTree();
    } else if (activeTab === "list") {
      fetchCategories();
    } else if (activeTab === "reviews") {
      fetchReviews();
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
      parentId: cat.parentId || null,
      sortOrder: cat.sortOrder !== undefined ? cat.sortOrder : 0,
    });
    setDrawerOpen(true);
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
    if ((cat.tenderCount || 0) > 0) {
      showToast(`Cannot archive category. Used by ${cat.tenderCount} active tenders.`, "error");
      return;
    }
    setCategoryToDelete(cat);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      // Patch category status to ARCHIVED directly or simulate
      await apiClient.patch(`/categories/${categoryToDelete.id}`, { status: "ARCHIVED" });
      showToast("Category archived successfully", "success");
      setDeleteConfirmOpen(false);
      refreshActiveTab();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to delete category", "error");
    }
  };

  // Submit Category to Review Workflow
  const handleSubmitReviewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitReviewCategory || selectedReviewerIds.length === 0) return;
    setSubmitReviewLoading(true);
    try {
      // Find highest version or use activeVersionId (For simplicity, activeVersionId is used or simulated)
      const versionId = submitReviewCategory.activeVersionId || submitReviewCategory.id; // Fallback to category ID if version not stored on client
      await apiClient.post(`/categories/${submitReviewCategory.id}/versions/${versionId}/submit`, {
        reviewerIds: selectedReviewerIds,
      });
      showToast("Submitted successfully for workflow review", "success");
      setSubmitReviewOpen(false);
      setSelectedReviewerIds([]);
      refreshActiveTab();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setSubmitReviewLoading(false);
    }
  };

  // Submit Review Decision
  const handleReviewDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview) return;
    setDecisionLoading(true);
    try {
      await apiClient.post(`/categories/reviews/${activeReview.id}/decision`, {
        action: decisionAction,
        comment: decisionComment || `${decisionAction} decision recorded by admin.`,
      });
      showToast(`Review decision ${decisionAction} submitted successfully`, "success");
      setDecisionOpen(false);
      setDecisionComment("");
      refreshActiveTab();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to record review decision", "error");
    } finally {
      setDecisionLoading(false);
    }
  };

  // Move parent action submit
  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveCategory) return;
    setMoveLoading(true);
    try {
      // Update parentId triggers version spawn or updates draft version
      await apiClient.patch(`/categories/${moveCategory.id}`, {
        parentId: selectedNewParentId || null,
      });
      showToast("Category proposed parent updated successfully. Submit draft for review.", "success");
      setMoveOpen(false);
      refreshActiveTab();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to update proposed parent", "error");
    } finally {
      setMoveLoading(false);
    }
  };

  // Merge categories submit
  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSource || !mergeTargetId) return;
    setMergeLoading(true);
    try {
      await apiClient.post("/categories/merge", {
        sourceId: mergeSource.id,
        targetId: mergeTargetId,
      });
      showToast("Categories merged successfully", "success");
      setMergeOpen(false);
      refreshActiveTab();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to merge categories", "error");
    } finally {
      setMergeLoading(false);
    }
  };

  // Toggle node expansion in tree
  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Render collapsible Tree recursively
  const renderTreeNode = (node: any, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedNodes[node.id];

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center justify-between border-b border-border/40 py-2.5 px-4 hover:bg-primary/5 transition duration-150 rounded-xl ${depth > 0 ? "ml-6 border-l border-dashed border-border" : ""
            }`}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNode(node.id)}
                className="text-text-light hover:text-text focus:outline-none"
              >
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
            ) : (
              <div className="w-[18px]" />
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-background text-text-light px-2 py-0.5 rounded border border-border">
                {node.code}
              </span>
              <span className="text-sm font-semibold text-text">{node.name}</span>
              {node.tenderCount > 0 && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {node.tenderCount} Tenders
                </span>
              )}
              {node.status === "ACTIVE" ? (
                <span className="text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Active
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                  Draft/Inactive
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={Plus}
              onClick={() => openCategoryDrawer("create", { parentId: node.id })}
              className="h-8"
            >
              Child
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={Pencil}
              onClick={() => openCategoryDrawer("edit", node)}
              className="h-8"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={Move}
              onClick={() => {
                setMoveCategory(node);
                setSelectedNewParentId(node.parentId || "");
                setMoveOpen(true);
              }}
              className="h-8 shadow-none"
            >
              Move
            </Button>
            {node.tenderCount > 0 && (
              <Button
                size="sm"
                variant="secondary"
                leftIcon={GitMerge}
                onClick={() => {
                  setMergeSource(node);
                  setMergeTargetId("");
                  setMergeOpen(true);
                }}
                className="h-8 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
              >
                Merge
              </Button>
            )}
            {node.status !== "ACTIVE" && (
              <Button
                size="sm"
                variant="primary"
                leftIcon={GitPullRequest}
                onClick={() => {
                  setSubmitReviewCategory(node);
                  setSubmitReviewOpen(true);
                }}
                className="h-8"
              >
                Submit Review
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              leftIcon={Trash2}
              onClick={() => handleDeleteRequest(node)}
              className="h-8 text-red-600 border-red-200 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {node.children.map((child: any) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // CSV Export
  const handleExportCSV = () => {
    const list = activeTab === "tree" ? flatTree(treeCategories) : categories;
    if (list.length === 0) return;
    const headers = ["ID", "Code", "Name", "Slug", "Description", "Status", "Tender Count", "Created At"];
    const rows = list.map((cat) => [
      cat.id,
      cat.code,
      cat.name,
      cat.slug,
      cat.description || "",
      cat.status,
      cat.tenderCount || 0,
      new Date(cat.createdAt).toLocaleString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `categories_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const flatTree = (list: any[]): any[] => {
    let result: any[] = [];
    for (const c of list) {
      result.push(c);
      if (c.children && c.children.length > 0) {
        result = [...result, ...flatTree(c.children)];
      }
    }
    return result;
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
        refreshActiveTab();
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
            status: action === "activate" ? "ACTIVE" : "INACTIVE",
          };
        }
      });

      const { data } = await apiClient.post("/categories/batch", batchPayload);
      if (data.success) {
        showToast(`Bulk action processed successfully`, "success");
        setSelectedIds([]);
        refreshActiveTab();
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to process bulk status change", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const inUse = categories.filter((c) => selectedIds.includes(c.id) && (c.tenderCount || 0) > 0);
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
        refreshActiveTab();
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

  // Build options list for new parents
  const buildParentOptions = (list: any[], excludeId: string, depth = 0): any[] => {
    let options: any[] = [];
    for (const c of list) {
      if (c.id === excludeId) continue;
      options.push({
        id: c.id,
        name: `${"─".repeat(depth)} ${c.name} (${c.code})`,
      });
      if (c.children && c.children.length > 0) {
        options = [...options, ...buildParentOptions(c.children, excludeId, depth + 1)];
      }
    }
    return options;
  };

  // Build target options for merging (only leaf nodes with childrenCount === 0)
  const buildMergeOptions = (list: any[], excludeId: string): any[] => {
    const flat = flatTree(list);
    return flat.filter(c => c.id !== excludeId && c.childrenCount === 0 && c.status === "ACTIVE");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Categories Workspace</h1>
          <p className="mt-1 text-text-light">
            Manage marketplace categories tree, leaf-node tender constraints, versioning, and approvals.
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

      {/* Tabs Menu */}
      <div className="flex border-b border-border">
        {[
          { id: "tree", label: "Hierarchical Tree", icon: FolderKanban },
          { id: "list", label: "Search & Flat List", icon: Filter },
          { id: "reviews", label: "Workflow Reviews", icon: GitPullRequest, badge: reviews.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all focus:outline-none ${isActive
                ? "border-primary text-primary"
                : "border-transparent text-text-light hover:text-text hover:border-border"
                }`}
            >
              <Icon size={16} />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { title: "Total Categories", value: stats.total, color: "bg-blue-100 text-blue-600", icon: FolderKanban },
          { title: "Active Categories", value: stats.active, color: "bg-green-100 text-green-600", icon: CheckCircle2 },
          { title: "Unused/Idle", value: stats.inactive, color: "bg-yellow-100 text-yellow-600", icon: XCircle },
          { title: "Review Backlog", value: reviews.length, color: "bg-red-100 text-red-600", icon: Trash2 },
          { title: "Tenders Active", value: stats.tendersCount, color: "bg-indigo-100 text-indigo-600", icon: FolderOpen },
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

      {/* Tab Contents: Tree */}
      {activeTab === "tree" && (
        <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <span className="text-sm font-semibold text-text">Category Hierarchy Structure</span>
            <Button size="sm" variant="secondary" onClick={fetchCategoryTree} leftIcon={Loader2}>
              Reload Tree
            </Button>
          </div>

          {treeLoading ? (
            <div className="flex py-12 justify-center items-center gap-2 text-text-light text-sm">
              <Loader2 className="animate-spin text-primary" size={20} />
              Loading tree structure...
            </div>
          ) : treeCategories.length === 0 ? (
            <div className="text-center py-12 text-sm text-text-light">
              No categories found. Create one to begin building the hierarchy.
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {treeCategories.map((node) => renderTreeNode(node))}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: List */}
      {activeTab === "list" && (
        <>
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

          {/* Table view */}
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
                    <th className="px-5 py-4 text-left text-sm font-semibold text-text">Created At</th>
                    <th className="w-24 px-5 py-4 text-center text-sm font-semibold text-text">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border bg-surface">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-sm text-text-light">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-primary" size={20} />
                          Loading categories...
                        </div>
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-sm text-text-light">
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

                          <td className="px-5 py-4">
                            <span className="text-xs font-mono font-bold text-text bg-background border border-border px-2.5 py-1 rounded-lg">
                              {cat.code}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-text-light">
                            {cat.slug}
                          </td>

                          <td className="px-5 py-4 text-sm font-bold text-primary">
                            {cat.tenderCount || 0}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={cat.status === "ACTIVE" ? "active" : "inactive"} />
                          </td>

                          <td className="px-5 py-4 text-sm text-text-light">
                            {new Date(cat.createdAt).toLocaleDateString()}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="sm"
                                variant="secondary"
                                leftIcon={Eye}
                                onClick={() => openCategoryDrawer("view", cat)}
                              />
                              <Button
                                size="sm"
                                variant="secondary"
                                leftIcon={Pencil}
                                onClick={() => openCategoryDrawer("edit", cat)}
                              />
                              <Button
                                size="sm"
                                variant="secondary"
                                leftIcon={History}
                                onClick={() => viewAuditHistory(cat)}
                              />
                              <Button
                                size="sm"
                                variant="secondary"
                                leftIcon={Trash2}
                                onClick={() => handleDeleteRequest(cat)}
                                className="text-red-500 hover:bg-red-50 border-red-200"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bulk actions footer */}
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between border-t border-border bg-background/50 px-5 py-4">
                <span className="text-sm text-text-light font-medium">
                  {selectedIds.length} categories selected
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleBulkStatusChange("activate")}>
                    Bulk Activate
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleBulkStatusChange("disable")}>
                    Bulk Deactivate
                  </Button>
                  <Button size="sm" variant="secondary" className="text-red-500 border-red-200" onClick={handleBulkDelete}>
                    Bulk Archive
                  </Button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalItems > pageSize && (
              <div className="border-t border-border p-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab Contents: Reviews */}
      {activeTab === "reviews" && (
        <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <span className="text-sm font-semibold text-text">Workflow Review Proposals Queue</span>
            <Button size="sm" variant="secondary" onClick={fetchReviews} leftIcon={Loader2}>
              Reload Queue
            </Button>
          </div>

          {reviewsLoading ? (
            <div className="flex py-12 justify-center items-center gap-2 text-text-light text-sm">
              <Loader2 className="animate-spin text-primary" size={20} />
              Loading reviews backlog...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-sm text-text-light">
              All categories are up-to-date. No pending reviews in backlog.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="border border-border rounded-xl p-5 hover:shadow-sm transition bg-background/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <GitPullRequest size={20} className="text-primary" />
                      <div>
                        <h4 className="text-sm font-bold text-text">
                          {rev.categoryVersion?.name} (Version {rev.categoryVersion?.version})
                        </h4>
                        <p className="text-xs text-text-light">
                          Category Code: <span className="font-mono">{rev.category?.code}</span> | Submitted on {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-lg">
                        {rev.status}
                      </span>
                      <Button
                        size="sm"
                        leftIcon={CheckCircle2}
                        onClick={() => {
                          setActiveReview(rev);
                          setDecisionAction("APPROVE");
                          setDecisionOpen(true);
                        }}
                      >
                        Action
                      </Button>
                    </div>
                  </div>

                  {/* Diff visualization */}
                  <div className="grid md:grid-cols-2 gap-4 text-xs font-mono bg-background p-4 rounded-xl border border-border/60">
                    <div>
                      <h5 className="font-bold text-text-light mb-1 border-b border-border/30 pb-1">Proposed Version</h5>
                      <p className="text-text font-semibold"><span className="text-green-600">+</span> Name: {rev.categoryVersion?.name}</p>
                      <p className="text-text"><span className="text-green-600">+</span> Description: {rev.categoryVersion?.description || "(null)"}</p>
                      <p className="text-text"><span className="text-green-600">+</span> Slug: {rev.categoryVersion?.slug}</p>
                      <p className="text-text"><span className="text-green-600">+</span> Parent ID: {rev.categoryVersion?.parentId || "(Root)"}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-text-light mb-1 border-b border-border/30 pb-1">Assignments & Activity</h5>
                      <div className="space-y-1">
                        {rev.assignments?.map((a) => (
                          <div key={a.id} className="flex justify-between items-center text-[10px]">
                            <span>{a.reviewer?.name} ({a.reviewer?.email})</span>
                            <span className="font-bold uppercase tracking-wider text-yellow-600">{a.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Add/Edit Drawer Modal */}
      <Modal open={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${drawerMode === "create" ? "Create" : drawerMode === "edit" ? "Edit" : "View"} Category`}>
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Infrastructure, Roads"
            value={currentCategory.name || ""}
            onChange={(e) => setCurrentCategory((prev) => ({ ...prev, name: e.target.value }))}
            disabled={drawerMode === "view"}
            required
          />

          <Input
            label="Category Code (Optional, leave blank to auto-generate)"
            placeholder="e.g. CAT-000123"
            value={currentCategory.code || ""}
            onChange={(e) => setCurrentCategory((prev) => ({ ...prev, code: e.target.value }))}
            disabled={drawerMode !== "create"}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text">Description</label>
            <textarea
              placeholder="Provide context and keywords about this marketplace category"
              value={currentCategory.description || ""}
              onChange={(e) => setCurrentCategory((prev) => ({ ...prev, description: e.target.value }))}
              disabled={drawerMode === "view"}
              className="w-full min-h-[80px] p-3 rounded-xl border border-border bg-surface text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sort Order"
              type="number"
              value={currentCategory.sortOrder !== undefined ? currentCategory.sortOrder : 0}
              onChange={(e) => setCurrentCategory((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
              disabled={drawerMode === "view"}
            />
          </div>

          {drawerMode !== "view" && (
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Category Draft
              </Button>
            </div>
          )}
        </form>
      </Modal>

      {/* Move Category Modal */}
      <Modal open={moveOpen} onClose={() => setMoveOpen(false)} title="Change Category Parent Node">
        <form onSubmit={handleMoveSubmit} className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-800 text-xs flex gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <div>
              <p className="font-semibold">Important Workflow Node Rules:</p>
              <p>1. Changing the parent category triggers a workflow version change.</p>
              <p>2. Circular hierarchies and nesting deeper than 10 levels are automatically blocked.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text">Choose New Parent Category</label>
            <select
              value={selectedNewParentId}
              onChange={(e) => setSelectedNewParentId(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition focus:border-primary"
            >
              <option value="">[Root Category / No Parent]</option>
              {buildParentOptions(treeCategories, moveCategory?.id || "").map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setMoveOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={moveLoading}>
              {moveLoading ? "Updating..." : "Update Proposed Parent"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Merge Categories Modal */}
      <Modal open={mergeOpen} onClose={() => setMergeOpen(false)} title="Merge Categories">
        <form onSubmit={handleMergeSubmit} className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs flex gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <div>
              <p className="font-semibold">Destructive Action Warning:</p>
              <p>1. This will reassign all tenders from <b>{mergeSource?.name} ({mergeSource?.code})</b> to the selected target.</p>
              <p>2. The source category will be permanently ARCHIVED.</p>
              <p>3. Tenders can only be assigned to active leaf-nodes (categories with no children).</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text">Merge Tenders Into Target Category</label>
            <select
              value={mergeTargetId}
              onChange={(e) => setMergeTargetId(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition focus:border-primary"
              required
            >
              <option value="">[Select active target leaf category]</option>
              {buildMergeOptions(treeCategories, mergeSource?.id || "").map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name} ({opt.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setMergeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mergeLoading} className="bg-red-600 text-white hover:bg-red-700">
              {mergeLoading ? "Merging..." : "Confirm & Merge Categories"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submit for Review Modal */}
      <Modal open={submitReviewOpen} onClose={() => setSubmitReviewOpen(false)} title="Submit Version for Workflow Review">
        <form onSubmit={handleSubmitReviewRequest} className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-xs flex gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <div>
              <p className="font-semibold">Review Policy:</p>
              <p>This will locks the draft version and assign the following reviewer(s). Once approved, the changes will immediately be integrated into the active category tree.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text font-bold">Assign Reviewers</label>
            <div className="border border-border rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 bg-surface">
              {adminUsers.length === 0 ? (
                <p className="text-xs text-text-light">No admin users found. Type reviewer UUID below instead.</p>
              ) : (
                adminUsers.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 text-sm text-text cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedReviewerIds.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReviewerIds(prev => [...prev, user.id]);
                        } else {
                          setSelectedReviewerIds(prev => prev.filter(id => id !== user.id));
                        }
                      }}
                      className="h-4 w-4 accent-primary rounded"
                    />
                    <span>{user.name} ({user.email})</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setSubmitReviewOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitReviewLoading || selectedReviewerIds.length === 0}>
              {submitReviewLoading ? "Submitting..." : "Submit to Workflow"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Review Decision Modal */}
      <Modal open={decisionOpen} onClose={() => setDecisionOpen(false)} title="Record Category Review Decision">
        <form onSubmit={handleReviewDecisionSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text">Choose Workflow Decision</label>
            <select
              value={decisionAction}
              onChange={(e: any) => setDecisionAction(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition focus:border-primary"
            >
              <option value="APPROVE">APPROVE (Accept and Merge into Tree)</option>
              <option value="REJECT">REJECT (Decline draft changes)</option>
              <option value="CHANGES_REQUESTED">CHANGES REQUESTED (Send back for edits)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text font-bold">Feedback / Audit Comments</label>
            <textarea
              placeholder="Provide reasons, suggestions, or checklist comments for the audit log..."
              value={decisionComment}
              onChange={(e) => setDecisionComment(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-xl border border-border bg-surface text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setDecisionOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={decisionLoading}>
              {decisionLoading ? "Submitting..." : "Submit Decision"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* History Log Modal */}
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title={`Audit Logs: ${historyCategory?.name}`}>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {logsLoading ? (
            <div className="flex py-8 justify-center items-center gap-2 text-text-light text-sm">
              <Loader2 className="animate-spin text-primary" size={20} />
              Loading history...
            </div>
          ) : auditLogs.length === 0 ? (
            <p className="text-center py-6 text-sm text-text-light">No modification history found.</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="border border-border p-4 rounded-xl text-xs space-y-1.5 bg-background/5">
                  <div className="flex justify-between font-bold text-text">
                    <span>Action: {log.action}</span>
                    <span className="text-text-light font-normal">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-text-light">Actor: {log.actorEmail || "System/Unknown"}</p>
                  {log.before && (
                    <div className="p-2.5 bg-background rounded-lg mt-1 font-mono text-[10px] text-text-light max-h-24 overflow-y-auto">
                      <p className="font-bold border-b border-border/20 pb-0.5 mb-1 text-[9px]">Changes:</p>
                      <pre>{JSON.stringify({ before: log.before, after: log.after }, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* CSV Import Modal */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import Categories (Batch processing)">
        <form onSubmit={handleImportCSV} className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-xs space-y-1">
            <p className="font-semibold">CSV Format Requirement:</p>
            <p>1. Column headers must be: <span className="font-mono">action, code, name, isActive</span></p>
            <p>2. <span className="font-mono">action</span> can be: <span className="font-mono">upsert</span> or <span className="font-mono">delete</span></p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text">Paste CSV Text Content</label>
            <textarea
              placeholder={`action,code,name,isActive\nupsert,080,Professional Services,true\nupsert,090,Construction Services,true`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full min-h-[160px] p-3 rounded-xl border border-border bg-surface text-xs font-mono outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={importLoading}>
              {importLoading ? "Uploading..." : "Process Batch"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Archive Category">
        <div className="space-y-4">
          <p className="text-sm text-text-light">
            Are you sure you want to archive <b>{categoryToDelete?.name}</b>? This will hide it from the marketplace and prevent assigning new tenders.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Confirm Archive
            </Button>
          </div>
        </div>
      </Modal>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-surface border border-border p-4 shadow-xl flex items-center gap-3 animate-fade-in max-w-sm">
          {toast.type === "success" ? (
            <CheckCircle2 className="text-green-500" size={20} />
          ) : (
            <AlertCircle className="text-red-500" size={20} />
          )}
          <span className="text-sm font-medium text-text">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
