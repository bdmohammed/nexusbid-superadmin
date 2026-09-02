//@ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  Ban,
  BookOpen,
  CheckCircle,
  Clock,
  CreditCard,
  HardDrive,
  Key,
  LogOut,
  PlusCircle,
  Shield,
  ShieldAlert,
  Smartphone,
  User,
  UserCheck,
} from 'lucide-react';

import { UserApprovalModal } from '@/components/users/UserApprovalModal';
import { authApi } from '@/features/auth/api/api';
import {
  useActivateUser,
  useBlockUser,
  useCreateUserNote,
  useForcePasswordReset,
  useRevokeAllUserSessions,
  useRevokeUserSession,
  useSuspendUser,
} from '@/features/auth/api/mutations';

interface CountryItem {
  id?: number | string;
  code?: string;
  slug?: string;
  name?: string;
}

interface UserOverview {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  accountType: string;
  companyName: string | null;
  country: CountryItem | string | null;
  emailVerified: boolean;
  isBlocked: boolean;
  status: string;
  requestedRoleId?: string;
  requestedDescription?: string;
  reviewerId?: string;
  submittedById?: string;
  createdAt: string;
  lastLoginAt: string | null;
}

interface UserSecurityInfo {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  isBlocked: boolean;
  status: string;
  passwordChangedAt: string | null;
  forcePasswordChange: boolean;
  twoFactorEnabled: boolean;
}

interface UserRoleAssignment {
  id: string;
  roleId?: string;
  name?: string;
  description?: string;
  role?: {
    id?: string;
    name?: string;
    description?: string;
  };
  expiresAt?: string | null;
}

interface UserSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  location: string | null;
  isActive: boolean;
  lastActivityAt: string;
  createdAt: string;
}

interface UserDevice {
  id: string;
  deviceName: string;
  deviceType: string;
  osName: string;
  browserName: string;
  lastIpAddress: string;
  lastActiveAt: string;
}

interface UserSubscriptionInfo {
  id: string;
  plan: {
    id: string;
    name: string;
    price: number;
    billingInterval: string;
  } | null;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface UserNote {
  id: string;
  note: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  entityName: string;
  entityId: string;
  oldValues: any;
  newValues: any;
  createdAt: string;
  actor: {
    name: string;
    email: string;
  };
}

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  metadata: any;
  createdAt: string;
}

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'security' | 'sessions' | 'subscription' | 'notes' | 'activity' | 'timeline'
  >('overview');

  // Sub-resource states
  const [overview, setOverview] = useState<UserOverview | null>(null);
  const [security, setSecurity] = useState<UserSecurityInfo | null>(null);
  const [roles, setRoles] = useState<UserRoleAssignment[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [subscription, setSubscription] = useState<UserSubscriptionInfo | null>(null);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  // Loading and action state
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  // Auth Mutation Hooks
  const blockUserMutation = useBlockUser();
  const suspendUserMutation = useSuspendUser();
  const activateUserMutation = useActivateUser();
  const forcePasswordResetMutation = useForcePasswordReset();
  const revokeUserSessionMutation = useRevokeUserSession();
  const revokeAllUserSessionsMutation = useRevokeAllUserSessions();
  const createUserNoteMutation = useCreateUserNote();

  // Auto-clear Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Fetch handler by active sub-tab
  const fetchSubResource = async () => {
    if (!id) return;
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const res = await authApi.getUserOverview(id);
        setOverview(res.data.data);
      } else if (activeTab === 'security') {
        const [secRes, rolesRes] = await Promise.all([
          authApi.getUserSecurityLog(id),
          authApi.getUserRoles(id),
        ]);
        setSecurity(secRes.data.data);
        setRoles(rolesRes.data.data?.assigned || rolesRes.data.data || []);
      } else if (activeTab === 'sessions') {
        const [sessRes, devRes] = await Promise.all([
          authApi.getUserSessions(id),
          authApi.getUserDevices(id),
        ]);
        setSessions(sessRes.data.data ?? []);
        setDevices(devRes.data.data ?? []);
      } else if (activeTab === 'subscription') {
        const res = await authApi.getUserSubscription(id);
        setSubscription(res.data.data);
      } else if (activeTab === 'notes') {
        const res = await authApi.getUserNotes(id);
        setNotes(res.data.data ?? []);
      } else if (activeTab === 'activity') {
        const [actRes, auditRes] = await Promise.all([
          authApi.getUserActivity(id),
          authApi.getUserAuditLog(id),
        ]);
        setActivities(actRes.data.data ?? []);
        setAuditLogs(auditRes.data.data ?? []);
      } else if (activeTab === 'timeline') {
        const res = await authApi.getUserTimeline(id);
        setTimeline(res.data.data ?? []);
      }
    } catch (err: any) {
      showToast(err.message || err.response?.data?.message || 'Failed to load tab data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubResource();
  }, [activeTab, id]);

  // Initial load of overview to get user header details
  useEffect(() => {
    if (id && activeTab !== 'overview') {
      authApi
        .getUserOverview(id)
        .then((res) => setOverview(res.data.data))
        .catch(() => {});
    }
  }, [id]);

  // Actions
  const handleToggleBlock = () => {
    if (!overview) return;
    const nextBlocked = !overview.isBlocked;
    setConfirmAction({
      title: nextBlocked ? 'Block User Account' : 'Unblock User Account',
      message: `Are you sure you want to ${nextBlocked ? 'block' : 'unblock'} the account of "${overview.name}"?`,
      onConfirm: async () => {
        try {
          await blockUserMutation.mutateAsync({ id, isBlocked: nextBlocked });
          showToast(
            `Account for ${overview.name} is now ${nextBlocked ? 'blocked' : 'active'}`,
            'success',
          );
          fetchSubResource();
        } catch (err: any) {
          showToast(err.message || err.response?.data?.message || 'Action failed', 'error');
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleToggleSuspend = () => {
    if (!overview) return;
    const isSuspended = overview.status === 'suspended';
    setConfirmAction({
      title: isSuspended ? 'Activate User' : 'Suspend User',
      message: `Are you sure you want to ${isSuspended ? 'activate' : 'suspend'} "${overview.name}"?`,
      onConfirm: async () => {
        try {
          if (isSuspended) {
            await activateUserMutation.mutateAsync(id);
            showToast('User account activated successfully', 'success');
          } else {
            await suspendUserMutation.mutateAsync(id);
            showToast('User account suspended successfully', 'success');
          }
          fetchSubResource();
        } catch (err: any) {
          showToast(err.message || err.response?.data?.message || 'Action failed', 'error');
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleApproveUser = () => {
    if (!overview) return;
    setIsApprovalModalOpen(true);
  };

  const handleForcePasswordReset = () => {
    setConfirmAction({
      title: 'Force Password Change',
      message: 'Force user to change password on next login attempt?',
      onConfirm: async () => {
        try {
          await forcePasswordResetMutation.mutateAsync(id);
          showToast('Password reset flag set successfully', 'success');
          if (activeTab === 'security') fetchSubResource();
        } catch (err: any) {
          showToast(err.message || err.response?.data?.message || 'Action failed', 'error');
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    setConfirmAction({
      title: 'Revoke Device Session',
      message: 'Are you sure you want to terminate this active user session?',
      onConfirm: async () => {
        try {
          await revokeUserSessionMutation.mutateAsync({ id, sessionId });
          showToast('Session revoked', 'success');
          fetchSubResource();
        } catch (err: any) {
          showToast(err.message || err.response?.data?.message || 'Revocation failed', 'error');
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleRevokeAllSessions = () => {
    setConfirmAction({
      title: 'Revoke All Active Sessions',
      message: 'Terminate all current user sessions and log the user out across all devices?',
      onConfirm: async () => {
        try {
          await revokeAllUserSessionsMutation.mutateAsync(id);
          showToast('All active sessions terminated', 'success');
          fetchSubResource();
        } catch (err: any) {
          showToast(err.message || err.response?.data?.message || 'Revocation failed', 'error');
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await createUserNoteMutation.mutateAsync({ id, note: noteText });
      showToast('Internal admin note added', 'success');
      setNoteText('');
      fetchSubResource();
    } catch (err: any) {
      showToast(err.message || err.response?.data?.message || 'Failed to add note', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xl shadow-inner">
              {overview?.name?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-text">
                  {overview?.name || 'User Details'}
                </h2>
                {overview?.isBlocked && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-500 border border-rose-100">
                    Blocked
                  </span>
                )}
                {overview?.status === 'suspended' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-500 border border-amber-100">
                    Suspended
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-text-light">{overview?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="bg-primary/5 text-primary px-2.5 py-0.5 rounded-full font-bold border border-primary/10">
                  {overview?.accountType === 'admin' ? 'Administrator' : 'Customer'}
                </span>
                <span className="bg-muted text-text-light px-2.5 py-0.5 rounded-full font-semibold">
                  Country: {overview?.country?.name || overview?.country?.code || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(overview?.status === 'pending_approval' ||
              overview?.status === 'pending_review' ||
              overview?.status === 'pending_email_verification') && (
              <button
                onClick={handleApproveUser}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition cursor-pointer shadow-xs"
              >
                <CheckCircle size={15} />
                {overview?.status === 'pending_review' ? 'Evaluate Approval' : 'Approve Request'}
              </button>
            )}
            <button
              onClick={() => router.push('/users')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-sm font-semibold hover:bg-background transition cursor-pointer"
            >
              <ArrowLeft size={15} />
              Back Directory
            </button>
            <button
              onClick={handleToggleBlock}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                overview?.isBlocked
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              <Ban size={15} />
              {overview?.isBlocked ? 'Unblock Account' : 'Block User'}
            </button>
            <button
              onClick={handleToggleSuspend}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-sm font-semibold hover:bg-background transition cursor-pointer"
            >
              <UserCheck size={15} className="text-amber-500" />
              {overview?.status === 'suspended' ? 'Unsuspend User' : 'Suspend'}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tabs menu */}
      <div className="flex flex-wrap border-b border-border gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'security', label: 'Security & Roles', icon: Shield },
          { id: 'sessions', label: 'Sessions & Devices', icon: HardDrive },
          {
            id: 'subscription',
            label: 'Subscription & Billing',
            icon: CreditCard,
          },
          { id: 'notes', label: 'Internal Notes', icon: BookOpen },
          { id: 'activity', label: 'Activity & Audits', icon: Activity },
          { id: 'timeline', label: 'Timeline History', icon: Clock },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-3 text-sm font-semibold relative transition flex items-center gap-2 cursor-pointer ${
                activeTab === t.id ? 'text-primary font-bold' : 'text-text-light hover:text-text'
              }`}
            >
              <Icon size={15} />
              {t.label}
              {activeTab === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-tab Content Area */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 min-h-[300px]">
        {loading ? (
          // Loader skeleton
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-1/4 bg-border rounded" />
            <div className="h-24 bg-border rounded-xl" />
            <div className="h-20 bg-border rounded-xl" />
          </div>
        ) : (
          <>
            {/* Overview sub-tab */}
            {activeTab === 'overview' && overview && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Profile Summary</h3>
                  <p className="text-xs text-text-light">Account overview details and metadata.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    {[
                      { label: 'Full Name', value: overview.name },
                      { label: 'Email Address', value: overview.email },
                      {
                        label: 'Mobile Number',
                        value: overview.phone || 'N/A',
                      },
                      {
                        label: 'Company Name',
                        value: overview.companyName || 'N/A',
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="border-b border-border/60 pb-3">
                        <span className="text-xs font-bold text-text-light block uppercase tracking-wider">
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold text-text mt-1 block">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[
                      {
                        label: 'Verification Status',
                        value: overview.emailVerified ? 'Verified ✅' : 'Pending Verification ⚠️',
                      },
                      {
                        label: 'Country Origin',
                        value: overview.country?.name || overview.country?.code || 'N/A',
                      },
                      {
                        label: 'Registered At',
                        value: new Date(overview.createdAt).toLocaleString(),
                      },
                      {
                        label: 'Last Login Active',
                        value: overview.lastLoginAt
                          ? new Date(overview.lastLoginAt).toLocaleString()
                          : 'Never',
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="border-b border-border/60 pb-3">
                        <span className="text-xs font-bold text-text-light block uppercase tracking-wider">
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold text-text mt-1 block">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security & Roles sub-tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="text-lg font-bold">Security & Authorization Settings</h3>
                    <p className="text-xs text-text-light">
                      Password compliance, MFA status, and admin role assignments.
                    </p>
                  </div>
                  <button
                    onClick={handleForcePasswordReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Key size={14} />
                    Force Password Change
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-text">Security Metadata</h4>
                    {[
                      {
                        label: 'Last Password Changed At',
                        value: security?.passwordChangedAt
                          ? new Date(security.passwordChangedAt).toLocaleString()
                          : 'Never',
                      },
                      {
                        label: 'Forced Password Reset Active',
                        value: security?.forcePasswordChange
                          ? 'Yes (Requires reset on next login)'
                          : 'No',
                      },
                      {
                        label: 'Multi-Factor Authentication (MFA)',
                        value: security?.twoFactorEnabled ? 'Enabled' : 'Disabled',
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="pb-3 border-b border-border/60">
                        <span className="text-xs font-bold text-text-light block uppercase tracking-wider">
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold text-text mt-1 block">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-text">Assigned Roles</h4>
                    {roles.length === 0 ? (
                      <p className="text-xs text-text-light italic">
                        No admin roles assigned to this account.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {roles.map((r, idx) => {
                          const roleName = r.role?.name || r.name || r.roleId || 'Assigned Role';
                          const roleDesc = r.role?.description || r.description || '';
                          return (
                            <div
                              key={r.id || r.roleId || idx}
                              className="p-3 border border-border rounded-xl bg-background/50 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-sm text-text block">
                                  {roleName}
                                </span>
                                {roleDesc && (
                                  <span className="text-xs text-text-light block">{roleDesc}</span>
                                )}
                                {r.expiresAt && (
                                  <span className="text-[10px] text-amber-500 font-bold block mt-1">
                                    Expires: {new Date(r.expiresAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sessions & Devices sub-tab */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="text-lg font-bold">Active Sessions & Trusted Devices</h3>
                    <p className="text-xs text-text-light">
                      Manage and revoke active authorization sessions globally.
                    </p>
                  </div>
                  <button
                    disabled={sessions.length === 0}
                    onClick={handleRevokeAllSessions}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <LogOut size={14} />
                    Revoke All Sessions
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-text">Active Login Sessions</h4>
                  {sessions.length === 0 ? (
                    <p className="text-xs text-text-light italic">No active sessions found.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {sessions.map((s) => (
                        <div
                          key={s.id}
                          className="p-4 border border-border rounded-xl bg-background/50 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm">
                                {s.operatingSystem} • {s.browser}
                              </span>
                              {s.isActive && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-600">
                                  Current
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-text-light block mt-1">
                              IP: {s.ipAddress}
                            </span>
                            <span className="text-xs text-text-light block">
                              Location: {s.location || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                            <span className="text-[10px] text-text-light">
                              Active: {new Date(s.lastActivityAt).toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleRevokeSession(s.id)}
                              className="text-rose-500 hover:text-rose-600 font-bold cursor-pointer"
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-bold text-text">Device History Registry</h4>
                  {devices.length === 0 ? (
                    <p className="text-xs text-text-light italic">No registered devices.</p>
                  ) : (
                    <div className="space-y-3">
                      {devices.map((d) => (
                        <div
                          key={d.id}
                          className="p-3 border border-border/60 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <Smartphone size={20} className="text-text-light" />
                            <div>
                              <span className="font-bold text-sm text-text block">
                                {d.deviceName}
                              </span>
                              <span className="text-text-light block">
                                OS: {d.osName} • Browser: {d.browserName}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-text-light block">
                              Last IP: {d.lastIpAddress}
                            </span>
                            <span className="text-[10px] text-text-light block">
                              Last Active: {new Date(d.lastActiveAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subscription & Billing sub-tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Subscription Plan & Billing Information</h3>
                  <p className="text-xs text-text-light">
                    Current subscription level, period range, and statuses.
                  </p>
                </div>

                <div className="p-5 border border-border rounded-2xl bg-background/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-light">
                      Active Subscription Plan
                    </span>
                    <h4 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      {subscription?.plan?.name || 'Free Trial Tier'}
                    </h4>
                    {subscription?.plan && (
                      <p className="text-xs text-text-light mt-1">
                        Price: ${subscription.plan.price} / {subscription.plan.billingInterval}
                      </p>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-text-light space-y-1 sm:text-right">
                    <div>
                      Status:{' '}
                      <span className="text-emerald-500 font-bold uppercase">
                        {subscription?.status || 'ACTIVE'}
                      </span>
                    </div>
                    {subscription?.currentPeriodEnd && (
                      <div>
                        Period Ends: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </div>
                    )}
                    {subscription?.cancelAtPeriodEnd && (
                      <div className="text-rose-500 font-bold">
                        Auto-Renew: Cancelled at Period End
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Internal Notes sub-tab */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Internal Administrator Notes</h3>
                  <p className="text-xs text-text-light">
                    Private team logs and comments regarding this user account.
                  </p>
                </div>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter an internal note... (Only visible to admin staff)"
                    className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none h-24 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!noteText.trim()}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <PlusCircle size={14} />
                    Add Note
                  </button>
                </form>

                <div className="space-y-3 pt-4 border-t border-border">
                  {notes.length === 0 ? (
                    <p className="text-xs text-text-light italic text-center py-4">
                      No internal notes logged for this user.
                    </p>
                  ) : (
                    notes.map((n) => (
                      <div
                        key={n.id}
                        className="p-4 border border-border/80 rounded-xl bg-background/50 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-text">
                            {n.author.name} ({n.author.email})
                          </span>
                          <span className="text-text-light">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-text-light font-medium leading-relaxed whitespace-pre-wrap">
                          {n.note}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Activity & Audits sub-tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Activity Events & System Audit Logs</h3>
                  <p className="text-xs text-text-light">
                    Track login activity, changes, and audit operations relating to this user.
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Activity log */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-text border-b border-border pb-2">
                      User Activities
                    </h4>
                    {activities.length === 0 ? (
                      <p className="text-xs text-text-light italic">No activity logged.</p>
                    ) : (
                      <div className="space-y-3">
                        {activities.map((a) => (
                          <div
                            key={a.id}
                            className="p-3 border border-border/60 rounded-xl bg-background/30 text-xs"
                          >
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-text">{a.action}</span>
                              <span className="text-text-light font-normal text-[10px]">
                                {new Date(a.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-text-light mt-1">{a.description}</p>
                            <span className="text-[10px] text-text-light block mt-1">
                              IP: {a.ipAddress}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Audit log */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-text border-b border-border pb-2">
                      Admin Audit Actions
                    </h4>
                    {auditLogs.length === 0 ? (
                      <p className="text-xs text-text-light italic">No admin audit events.</p>
                    ) : (
                      <div className="space-y-3">
                        {auditLogs.map((a) => (
                          <div
                            key={a.id}
                            className="p-3 border border-border/60 rounded-xl bg-background/30 text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-text">{a.action}</span>
                              <span className="text-text-light font-normal text-[10px]">
                                {new Date(a.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <span className="text-text-light block">Actor: {a.actor.name}</span>
                            {a.newValues && (
                              <div className="p-2 bg-muted/50 rounded-lg text-[10px] font-mono mt-1 whitespace-pre-wrap max-h-20 overflow-y-auto">
                                {JSON.stringify(a.newValues, null, 2)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline History sub-tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Historical Account Timeline</h3>
                  <p className="text-xs text-text-light">
                    Chronological feed of key lifecycle events since registration.
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-primary/20 space-y-6">
                  {timeline.length === 0 ? (
                    <p className="text-xs text-text-light italic pl-2">
                      No timeline events recorded.
                    </p>
                  ) : (
                    timeline.map((t) => (
                      <div key={t.id} className="relative space-y-1">
                        <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-surface flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="pl-3">
                          <span className="text-xs text-text-light font-bold block">
                            {new Date(t.createdAt).toLocaleString()}
                          </span>
                          <span className="text-sm font-bold text-text block">{t.title}</span>
                          <p className="text-xs text-text-light leading-relaxed mt-0.5">
                            {t.description}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-text">{confirmAction.title}</h3>
            <p className="text-sm text-text-light leading-relaxed">{confirmAction.message}</p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-background cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maker-Checker User Approval Modal */}
      {overview && (
        <UserApprovalModal
          isOpen={isApprovalModalOpen}
          user={{
            id: overview.id,
            name: overview.name,
            email: overview.email,
            companyName: overview.companyName || undefined,
            accountType: overview.accountType,
            country: overview.country?.name || overview.country?.code || undefined,
            status: overview.status,
            requestedRoleId: overview.requestedRoleId,
            requestedDescription: overview.requestedDescription,
            reviewerId: overview.reviewerId,
            submittedById: overview.submittedById,
            createdAt: overview.createdAt,
          }}
          onClose={() => setIsApprovalModalOpen(false)}
          onSuccess={() => {
            fetchSubResource();
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-gray-950 text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-white/10 max-w-sm animate-slide-up">
          <div
            className={`p-2 rounded-xl bg-white/10 ${toast.type === 'error' ? 'text-red-400' : toast.type === 'success' ? 'text-green-400' : 'text-sky-400'}`}
          >
            <ShieldAlert size={18} />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider">
              {toast.type === 'error'
                ? 'Action Failed'
                : toast.type === 'success'
                  ? 'Completed'
                  : 'Notification'}
            </span>
            <span className="text-xs text-white/90 leading-normal font-semibold">
              {toast.message}
            </span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-white/40 hover:text-white/80 text-sm ml-2 self-start p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
