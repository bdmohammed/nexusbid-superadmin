//@ts-nocheck
'use client';

import React from 'react';
import dayjs from 'dayjs';
import {
  BarChart2,
  CheckCircle,
  Clock,
  FolderKanban,
  FolderOpen,
  GitCommit,
  History,
  Layers,
  Lock,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import Select from 'react-select';
import { toast } from 'sonner';

import StatusBadge from '@/components/common/StatusBadge';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/features/auth/store/store';

const customReactSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: 'var(--surface)',
    borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    borderRadius: '0.75rem',
    minHeight: '44px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      borderColor: 'var(--border)',
    },
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 99999,
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  }),
  menuList: (base: any) => ({
    ...base,
    padding: '6px',
    maxHeight: '220px',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--primary)'
      : state.isFocused
        ? 'var(--background)'
        : 'transparent',
    color: state.isSelected ? '#ffffff' : 'var(--text)',
    fontSize: '0.875rem',
    borderRadius: '0.5rem',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    padding: '8px 12px',
    fontWeight: state.isSelected ? '600' : '500',
    '&:active': {
      backgroundColor: 'var(--background)',
    },
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'var(--text)',
    fontSize: '0.875rem',
    fontWeight: '500',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'var(--text-light)',
    fontSize: '0.875rem',
  }),
};

export interface Category {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  parentId?: string | null;
  parentCategory?: { id: string; code: string; name: string } | null;
  activeVersionId?: string | null;
  activeVersion?: {
    id: string;
    versionNumber: string;
    majorVersion: number;
    minorVersion: number;
    status: string;
  } | null;
  displayOrder?: number;
  icon?: string | null;
  color?: string | null;
  isActive: boolean;
  tenderCount?: number;
  childrenCount?: number;
  createdAt: string;
  updatedAt: string;
  createdByUser?: { id: string; name: string; email: string } | null;
}

export interface CategoryVersionItem {
  id: string;
  versionNumber: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  createdAt: string;
  createdByUser?: { name: string; email: string };
  approvedByUser?: { name: string; email: string };
}

export interface CategoryReviewItem {
  id: string;
  status: string;
  submittedAt: string;
  decisionComment: string | null;
  assignments: {
    id: string;
    reviewer: { name: string; email: string };
    status: string;
  }[];
  comments: {
    id: string;
    comment: string;
    action: string;
    createdAt: string;
    user: { name: string };
  }[];
}

export interface CategoryActivityItem {
  id: string;
  event: string;
  details: Record<string, any> | null;
  createdAt: string;
  actor: { name: string; email: string };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export type DrawerTab =
  'general' | 'hierarchy' | 'review' | 'comments' | 'versions' | 'activity' | 'usage';

interface CategoryFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  drawerMode: 'create' | 'edit' | 'view';
  selectedCategory: Category | null;
  currentCategoryForm: Partial<Category>;
  setCurrentCategoryForm: React.Dispatch<React.SetStateAction<Partial<Category>>>;
  categories: Category[];

  // Tab states & data
  drawerTab: DrawerTab;
  setDrawerTab: (tab: DrawerTab) => void;
  versions: CategoryVersionItem[];
  reviews: CategoryReviewItem[];
  activities: CategoryActivityItem[];
  usageStats: {
    tendersCount: number;
    activeTendersCount: number;
    subcategoriesCount: number;
  };

  // Actions states & handlers
  onSave: (e?: React.FormEvent | React.MouseEvent) => void;
  onStartNewDraft: () => void;
  onOpenSubmitReviewModal: () => void;
  onOpenReviewActionModal: () => void;
  onRefreshGovernance?: (categoryId: string) => void;
  currentUserId?: string;
}

export const CategoryFormDrawer: React.FC<CategoryFormDrawerProps> = ({
  isOpen,
  onClose,
  drawerMode,
  selectedCategory,
  currentCategoryForm,
  setCurrentCategoryForm,
  categories,
  drawerTab,
  setDrawerTab,
  versions,
  reviews,
  activities,
  usageStats,
  onSave,
  onStartNewDraft,
  onOpenSubmitReviewModal,
  onOpenReviewActionModal,
  onRefreshGovernance,
  currentUserId,
}) => {
  const [newCommentText, setNewCommentText] = React.useState('');
  const [postingComment, setPostingComment] = React.useState(false);
  const authUser = useAuthStore((state) => state.user);

  const activeUserId = currentUserId || authUser?.id;

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory?.id || !newCommentText.trim()) return;
    try {
      setPostingComment(true);
      const res = await categoryApi.addCategoryComment(selectedCategory.id, newCommentText.trim());
      if (res.data?.success) {
        toast.success('Governance note posted successfully');
        setNewCommentText('');
        onRefreshGovernance?.(selectedCategory.id);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to post note');
    } finally {
      setPostingComment(false);
    }
  };

  const assignments = reviews[0]?.assignments || (selectedCategory as any)?.reviewAssignments || [];

  const reviewerIds: string[] = assignments
    .map((a: any) => a.reviewerId || a.reviewer?.id)
    .filter(Boolean);

  const isAssignedReviewer =
    reviewerIds.length === 0 || (Boolean(activeUserId) && reviewerIds.includes(activeUserId!));

  const categoryStatus = selectedCategory?.status || currentCategoryForm.status || 'DRAFT';

  const isInReview =
    categoryStatus === 'IN_REVIEW' ||
    categoryStatus === 'SUBMITTED' ||
    categoryStatus === 'PENDING_REVIEW';

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity"
      />
      <div className="fixed right-0 top-0 z-[100] flex h-screen w-full max-w-2xl flex-col bg-surface shadow-2xl transition-all duration-300 border-l border-border overflow-hidden text-text">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {currentCategoryForm.name
                  ? `Category: ${currentCategoryForm.name}`
                  : 'Create New Category'}
              </h2>
              <p className="text-xs text-text-light font-mono">
                ID: {selectedCategory?.id || 'Unsaved Draft'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={selectedCategory?.status || 'DRAFT'} />
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition hover:bg-background text-text-light hover:text-text cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-border bg-background/60 px-6 py-2 shrink-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs font-semibold">
          {[
            {
              id: 'general',
              label: 'General',
              icon: Layers,
              isUnlocked: true,
            },
            {
              id: 'hierarchy',
              label: 'Hierarchy',
              icon: FolderOpen,
              isUnlocked: true,
            },
            {
              id: 'review',
              label: 'Workflow Review',
              icon: ShieldCheck,
              isUnlocked: !!selectedCategory?.id,
            },
            {
              id: 'comments',
              label: 'Comments',
              icon: MessageSquare,
              isUnlocked: !!selectedCategory?.id,
            },
            {
              id: 'versions',
              label: 'Versions',
              icon: GitCommit,
              isUnlocked: !!selectedCategory?.id,
            },
            {
              id: 'activity',
              label: 'Activity Log',
              icon: Clock,
              isUnlocked: !!selectedCategory?.id,
            },
            {
              id: 'usage',
              label: 'Usage Stats',
              icon: BarChart2,
              isUnlocked: !!selectedCategory?.id,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = drawerTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={!tab.isUnlocked}
                onClick={() => tab.isUnlocked && setDrawerTab(tab.id as DrawerTab)}
                title={
                  !tab.isUnlocked ? 'Save draft category first to unlock workflow governance' : ''
                }
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : tab.isUnlocked
                      ? 'text-text-light hover:text-text hover:bg-surface'
                      : 'text-text-light/40 opacity-50 cursor-not-allowed bg-background/30'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {!tab.isUnlocked && <Lock className="h-3 w-3 ml-0.5 text-text-light/50" />}
              </button>
            );
          })}
        </div>

        {/* Drawer Body Container */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab 1: General */}
          {drawerTab === 'general' && (
            <div className="space-y-4">
              {isInReview && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 font-medium">
                  <Lock className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>
                    <strong>Status: In Review</strong> — Editing and saving draft changes are
                    disabled while this category is under governance review.
                  </span>
                </div>
              )}

              <Input
                label="Category Name"
                placeholder="e.g. Infrastructure & Works"
                value={currentCategoryForm.name || ''}
                onChange={(e) =>
                  setCurrentCategoryForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                disabled={drawerMode === 'view' || isInReview}
                required
              />

              <Input
                label={
                  drawerMode === 'create'
                    ? 'Category Code (Auto-Generated)'
                    : 'Category Code (3 digits)'
                }
                placeholder={drawerMode === 'create' ? 'Auto-generated on Save (e.g. 001)' : '001'}
                value={currentCategoryForm.code || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                  setCurrentCategoryForm((prev) => ({
                    ...prev,
                    code: val,
                  }));
                }}
                disabled={
                  drawerMode === 'view' ||
                  isInReview ||
                  (drawerMode === 'create' && !currentCategoryForm.code)
                }
                error={
                  currentCategoryForm.code && !/^\d{3}$/.test(currentCategoryForm.code)
                    ? 'Category Code must be exactly 3 digits (e.g. 080)'
                    : undefined
                }
              />

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-text">Description</label>
                <textarea
                  placeholder="Category definition and scope..."
                  value={currentCategoryForm.description || ''}
                  onChange={(e) =>
                    setCurrentCategoryForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={drawerMode === 'view' || isInReview}
                  className="w-full min-h-[120px] p-3 rounded-xl border border-border bg-surface text-sm outline-none transition focus:border-primary text-text disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Hierarchy */}
          {drawerTab === 'hierarchy' && (
            <div className="space-y-4">
              {isInReview && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 font-medium">
                  <Lock className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>
                    <strong>Status: In Review</strong> — Hierarchy configuration is locked during
                    governance review.
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-text">Parent Category</label>
                <Select
                  isDisabled={drawerMode === 'view' || isInReview}
                  options={[
                    { value: '', label: '-- No Parent (Root Category) --' },
                    ...categories
                      .filter(
                        (c) =>
                          c.id !== selectedCategory?.id &&
                          c.status === 'PUBLISHED' &&
                          c.isActive !== false,
                      )
                      .map((c) => ({
                        value: c.id,
                        label: `${c.code} - ${c.name}`,
                      })),
                  ]}
                  value={
                    currentCategoryForm.parentId
                      ? {
                          value: currentCategoryForm.parentId,
                          label: (() => {
                            const p = categories.find((c) => c.id === currentCategoryForm.parentId);
                            return p ? `${p.code} - ${p.name}` : currentCategoryForm.parentId;
                          })(),
                        }
                      : { value: '', label: '-- No Parent (Root Category) --' }
                  }
                  onChange={(selected: any) => {
                    const val = selected?.value || null;
                    setCurrentCategoryForm((prev) => ({
                      ...prev,
                      parentId: val,
                      parentCategoryId: val,
                    }));
                  }}
                  styles={customReactSelectStyles}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                />
              </div>

              {currentCategoryForm.parentId && (
                <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                  <span className="text-xs font-bold text-text-light uppercase tracking-wider block border-b border-border/60 pb-1">
                    Inherited Hierarchy Path
                  </span>
                  {(() => {
                    const path: Category[] = [];
                    let currId = currentCategoryForm.parentId;
                    let count = 0;
                    while (currId && count < 10) {
                      const found = categories.find((c) => c.id === currId);
                      if (found) {
                        path.unshift(found);
                        currId = found.parentId;
                      } else {
                        break;
                      }
                      count++;
                    }
                    return (
                      <div className="space-y-1.5">
                        {path.map((node, index) => (
                          <div
                            key={node.id}
                            className="flex items-center gap-2 text-xs font-medium text-text"
                          >
                            <span className="font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border">
                              {node.code}
                            </span>
                            <span>{node.name}</span>
                            {index < path.length - 1 && <span className="text-text-light">→</span>}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Workflow Review */}
          {drawerTab === 'review' && (
            <div className="flex-1 overflow-y-auto space-y-6 max-w-3xl">
              <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-text">
                      Maker-Checker Governance Review
                    </h3>
                    <p className="text-xs text-text-light mt-0.5">
                      Submit draft version to designated reviewers for evaluation and release.
                    </p>
                  </div>
                  <Badge
                    color={
                      selectedCategory?.status === 'PUBLISHED'
                        ? 'green'
                        : selectedCategory?.status === 'IN_REVIEW'
                          ? 'indigo'
                          : 'yellow'
                    }
                  >
                    {selectedCategory?.status || 'DRAFT'}
                  </Badge>
                </div>

                {/* Maker & Submission Metadata */}
                <div className="p-3.5 rounded-xl bg-background border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-light">Category Maker (Author):</span>
                    <span className="font-bold text-text flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" />
                      {(selectedCategory as any)?.createdByUser?.name ||
                        (selectedCategory as any)?.createdByUser?.email ||
                        'System Maker'}
                    </span>
                  </div>
                  {selectedCategory?.createdAt && (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-light">Created At:</span>
                      <span className="text-text font-mono">
                        {dayjs(selectedCategory.createdAt).format('DD MMM YYYY, hh:mm A')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Assigned Reviewers List */}
                {reviews.length > 0 &&
                  reviews[0]?.assignments &&
                  reviews[0].assignments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-text-light uppercase tracking-wider text-[11px]">
                        Designated Governance Reviewers ({reviews[0].assignments.length})
                      </h4>
                      <div className="space-y-2">
                        {reviews[0].assignments.map((a: any) => (
                          <div
                            key={a.id || a.reviewerId}
                            className="p-3 rounded-xl border border-border bg-background flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/20">
                                {(a.reviewer?.name || a.reviewer?.email || 'R')
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-text">
                                  {a.reviewer?.name || 'Governance Reviewer'}
                                </p>
                                <p className="text-[11px] text-text-light font-mono">
                                  {a.reviewer?.email}
                                </p>
                              </div>
                            </div>
                            <Badge
                              color={
                                a.status === 'APPROVED'
                                  ? 'green'
                                  : a.status === 'REJECTED'
                                    ? 'red'
                                    : a.status === 'CHANGES_REQUESTED'
                                      ? 'yellow'
                                      : 'indigo'
                              }
                            >
                              {a.status || 'PENDING'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="space-y-4 border-t border-border pt-4">
                  {selectedCategory?.status === 'PUBLISHED' ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-emerald-700 dark:text-emerald-400">
                          ● Status: Governance Approved & Released
                        </div>
                        <div className="text-text-light mt-0.5">
                          This category has passed Maker-Checker review and is active in production.
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color="green">APPROVED</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={Plus}
                          onClick={onStartNewDraft}
                        >
                          Create New Draft
                        </Button>
                      </div>
                    </div>
                  ) : selectedCategory?.status === 'DRAFT' ? (
                    <div className="space-y-2">
                      <Button disabled={!selectedCategory?.id} onClick={onOpenSubmitReviewModal}>
                        Submit Draft for Governance Review
                      </Button>
                      {!selectedCategory?.id && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                          ⚠️ Please click "Save Draft Changes" in the footer first before submitting
                          for governance review.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-indigo-700 dark:text-indigo-300">
                          ● Status: Pending Reviewer Decision
                        </div>
                        <div className="text-text-light mt-0.5">
                          Assigned reviewers must approve or request changes for this category
                          version.
                        </div>
                        {!isAssignedReviewer && (
                          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
                            ⚠️ Only designated assigned reviewers can execute a review decision on
                            this draft.
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        leftIcon={CheckCircle}
                        onClick={onOpenReviewActionModal}
                        disabled={!isAssignedReviewer}
                        title={
                          !isAssignedReviewer
                            ? 'You are not an assigned reviewer for this category draft'
                            : undefined
                        }
                      >
                        Execute Decision
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Comments Thread */}
          {drawerTab === 'comments' && (
            <div className="flex-1 overflow-y-auto space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" /> Governance Discussion Thread
                  </h3>
                  <p className="text-xs text-text-light">
                    Post review notes, questions, or change rationales.
                  </p>
                </div>
                <Badge color="indigo">
                  {reviews.flatMap((r) => r.comments || []).length} Notes
                </Badge>
              </div>

              <form
                onSubmit={handlePostComment}
                className="space-y-3 bg-surface p-4 rounded-2xl border border-border"
              >
                <textarea
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Type a governance note or rationale..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-text focus:outline-none focus:border-primary resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    leftIcon={Send}
                    disabled={!newCommentText.trim() || postingComment}
                  >
                    {postingComment ? 'Posting...' : 'Post Note'}
                  </Button>
                </div>
              </form>

              <div className="space-y-3">
                {reviews.flatMap((r) => r.comments || []).length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-surface/50">
                    <MessageSquare className="h-8 w-8 text-text-light/40 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-text">No Governance Comments</p>
                    <p className="text-[11px] text-text-light mt-0.5">
                      Comments and notes from reviewers will appear here during governance review.
                    </p>
                  </div>
                ) : (
                  reviews
                    .flatMap((r) => r.comments || [])
                    .map((c) => (
                      <div
                        key={c.id || c.createdAt}
                        className="p-4 rounded-2xl border border-border bg-surface space-y-2 text-xs shadow-xs"
                      >
                        <div className="flex justify-between items-center font-bold text-text">
                          <span className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] border border-primary/20">
                              {(c.user?.name || c.user?.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-text font-semibold">
                              {c.user?.name || c.user?.email || 'Governance Reviewer'}
                            </span>
                          </span>
                          <span className="text-[10px] text-text-light font-mono">
                            {dayjs(c.createdAt).format('DD MMM YYYY, hh:mm A')}
                          </span>
                        </div>
                        <p className="text-text-light pl-8 italic">"{c.comment}"</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Version History */}
          {drawerTab === 'versions' && (
            <div className="flex-1 overflow-y-auto space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" /> Category Version Releases
                  </h3>
                  <p className="text-xs text-text-light">
                    Audit past version releases, statuses, and governance locks.
                  </p>
                </div>
                <Badge color="indigo">{versions.length} Releases</Badge>
              </div>

              <div className="space-y-3">
                {versions.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-surface/50">
                    <GitCommit className="h-8 w-8 text-text-light/40 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-text">No Version History</p>
                  </div>
                ) : (
                  versions.map((v: any) => (
                    <div
                      key={v.id || v.version}
                      className="p-4 bg-surface border border-border rounded-2xl space-y-2.5 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-text font-mono bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg border border-primary/20">
                            v{v.versionNumber || v.version || '1.0'}
                          </span>
                          <Badge
                            color={
                              v.status === 'PUBLISHED' || v.status === 'APPROVED'
                                ? 'green'
                                : v.status === 'DRAFT'
                                  ? 'yellow'
                                  : v.status === 'SUPERSEDED'
                                    ? 'gray'
                                    : 'indigo'
                            }
                          >
                            {v.status || 'RELEASED'}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-text-light font-mono">
                          {v.createdAt ? dayjs(v.createdAt).format('DD MMM YYYY, HH:mm') : 'N/A'}
                        </span>
                      </div>

                      {v.name && <p className="text-text font-semibold text-xs">{v.name}</p>}

                      {v.description && <p className="text-text-light text-xs">{v.description}</p>}

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-text-light">
                        <span>
                          Maker:{' '}
                          <strong className="text-text">
                            {v.createdByUser?.name || v.createdByUser?.email || 'Admin'}
                          </strong>
                        </span>
                        {v.approvedByUser?.name && (
                          <span>
                            Checker: <strong className="text-text">{v.approvedByUser.name}</strong>
                          </span>
                        )}
                        {v.parentCategory?.name && (
                          <span>
                            Parent: <strong className="text-text">{v.parentCategory.name}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 6: Activity Log & Audit Trail */}
          {drawerTab === 'activity' && (
            <div className="flex-1 overflow-y-auto space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" /> Category Activity Log & Audit Trail
                  </h3>
                  <p className="text-xs text-text-light">
                    Forensic timeline of category creations, hierarchy modifications, and reviews.
                  </p>
                </div>
                <Badge color="indigo">{activities.length} Events</Badge>
              </div>

              <div className="space-y-3">
                {activities.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-surface/50">
                    <Clock className="h-8 w-8 text-text-light/40 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-text">No Activity Logged</p>
                    <p className="text-[11px] text-text-light mt-0.5">
                      Audit trail logs for modifications will be listed here.
                    </p>
                  </div>
                ) : (
                  activities.map((a: any) => (
                    <div
                      key={a.id || a.createdAt}
                      className="p-3.5 bg-background border border-border rounded-2xl text-xs space-y-1.5 shadow-xs"
                    >
                      <div className="flex justify-between items-center font-semibold text-text">
                        <span className="font-bold text-primary font-mono text-xs">
                          {a.event || a.action || 'CATEGORY_UPDATED'}
                        </span>
                        <span className="text-[10px] text-text-light font-mono">
                          {a.createdAt ? dayjs(a.createdAt).format('DD MMM YYYY, HH:mm') : 'N/A'}
                        </span>
                      </div>
                      <p className="text-text text-xs flex items-center gap-1.5">
                        <User className="h-3 w-3 text-text-light" />
                        <span>Actor: </span>
                        <span className="font-semibold">
                          {a.actor?.name || a.actor?.email || a.actorEmail || 'System Admin'}
                        </span>
                      </p>
                      {(a.changes || a.metadata) && (
                        <pre className="p-2.5 rounded-xl bg-surface border border-border text-[10px] font-mono text-text-light overflow-x-auto">
                          {JSON.stringify(a.changes || a.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 7: Category Analytics & Usage */}
          {drawerTab === 'usage' && (
            <div className="flex-1 overflow-y-auto space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" /> Category Impact & Analytics
                  </h3>
                  <p className="text-xs text-text-light">
                    Real-time metrics for tenders and child subcategories bound to this category.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-border bg-surface text-center space-y-1 shadow-xs">
                  <p className="text-xs font-semibold text-text-light">Total Tenders</p>
                  <h4 className="text-3xl font-bold text-text">{usageStats.tendersCount}</h4>
                </div>
                <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-1 shadow-xs">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Active Tenders
                  </p>
                  <h4 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {usageStats.activeTendersCount}
                  </h4>
                </div>
                <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 text-center space-y-1 shadow-xs">
                  <p className="text-xs font-semibold text-primary">Subcategories</p>
                  <h4 className="text-3xl font-bold text-primary">
                    {usageStats.subcategoriesCount}
                  </h4>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-border bg-surface px-6 py-4 flex items-center justify-between shrink-0">
          <div className="text-xs text-text-light flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {selectedCategory?.status === 'PUBLISHED'
                ? 'Published master record'
                : selectedCategory?.status === 'IN_REVIEW'
                  ? 'Pending reviewer action'
                  : 'Draft version - editable'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            {(drawerTab === 'general' || drawerTab === 'hierarchy') && drawerMode !== 'view' && (
              <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={
                  isInReview ||
                  !currentCategoryForm.name?.trim() ||
                  !currentCategoryForm.description?.trim()
                }
                title={
                  isInReview
                    ? 'Editing and saving changes are disabled while this category is under governance review'
                    : undefined
                }
              >
                Save Draft Changes
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
