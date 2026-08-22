"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle,
  Link2,
  LogOut,
  PlusCircle,
  RotateCw,
  Smartphone,
  Trash2,
  User,
} from "lucide-react";

import { apiClient } from "@/lib/http";

// Interface definitions
interface UserProfile {
  id: string;
  name: string;
  email: string;
  accountType: string;
  companyName: string | null;
  country: string | null;
  emailVerified: boolean;
  status: string;
  createdAt: string;
  avatarUrl: string | null;
  roles: string[];
}

interface UserSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  isCurrent: boolean;
  createdAt: string;
  expiresAt: string;
}

interface UserDevice {
  id: string;
  deviceName: string;
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
  expiresAt: string | null;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  details: any;
  createdAt: string;
}

interface SecurityLog {
  id: string;
  event: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface TimelineEvent {
  event: string;
  title: string;
  timestamp: string;
  description: string;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  security: boolean;
  tender: boolean;
  newsletter: boolean;
}

export default function PersonalProfilePage() {
  const router = useRouter();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "security"
    | "sessions"
    | "preferences"
    | "subscription"
    | "activity"
    | "privacy"
    | "timeline"
  >("overview");

  // Sub-resource states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [subscription, setSubscription] = useState<UserSubscriptionInfo | null>(
    null,
  );
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    security: true,
    tender: true,
    newsletter: false,
  });

  // Edit / Input States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", country: "" });
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarFormUrl, setAvatarFormUrl] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Change request state
  const [changeRequestField, setChangeRequestField] = useState("companyName");
  const [changeRequestValue, setChangeRequestValue] = useState("");
  const [changeRequestReason, setChangeRequestReason] = useState("");

  // Loading and action state
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Auto-clear Toast
  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({ message, type });
  };

  // Fetch initial profile metadata
  const fetchProfileCore = async () => {
    try {
      const res = await apiClient.get("/profile");
      const {data} = res.data;
      setProfile(data);
      setProfileForm({
        name: data.name || "",
        country: data.country || "",
      });
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to load profile details",
        "error",
      );
    }
  };

  // Fetch handler by active sub-tab
  const fetchSubResource = async () => {
    try {
      setLoading(true);
      if (activeTab === "overview") {
        await fetchProfileCore();
      } else if (activeTab === "security") {
        await fetchProfileCore();
      } else if (activeTab === "sessions") {
        const [sessRes, devRes] = await Promise.all([
          apiClient.get("/profile/sessions"),
          apiClient.get("/profile/devices"),
        ]);
        setSessions(sessRes.data.data || []);
        setDevices(devRes.data.data || []);
      } else if (activeTab === "preferences") {
        const res = await apiClient.get("/profile/preferences");
        if (res.data.data) {
          setPreferences(res.data.data);
        }
      } else if (activeTab === "subscription") {
        if (profile?.accountType !== "admin") {
          const res = await apiClient.get("/profile/subscription");
          setSubscription(res.data.data);
        }
      } else if (activeTab === "activity") {
        const [actRes, secRes] = await Promise.all([
          apiClient.get("/profile/activity?limit=15"),
          apiClient.get("/profile/security-history?limit=15"),
        ]);
        setActivities(actRes.data.data?.activities || []);
        setSecurityLogs(secRes.data.data?.logs || []);
      } else if (activeTab === "timeline") {
        const res = await apiClient.get("/profile/timeline");
        setTimeline(res.data.data || []);
      }
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to load tab data",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubResource();
  }, [activeTab]);

  useEffect(() => {
    fetchProfileCore();
  }, []);

  // Update Core Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await apiClient.patch("/profile", profileForm);
      setProfile(res.data.data);
      showToast("Profile details updated successfully", "success");
      setIsEditingProfile(false);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to update profile",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Update Avatar
  const handleUpdateAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFormUrl.trim()) return;
    setActionLoading(true);
    try {
      const res = await apiClient.post("/profile/avatar", {
        avatarUrl: avatarFormUrl,
      });
      setProfile(res.data.data);
      showToast("Avatar image updated successfully", "success");
      setIsEditingAvatar(false);
      setAvatarFormUrl("");
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to update avatar",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Remove Avatar
  const handleRemoveAvatar = async () => {
    setConfirmAction({
      title: "Remove Avatar",
      message: "Are you sure you want to remove your profile picture?",
      onConfirm: async () => {
        try {
          const res = await apiClient.delete("/profile/avatar");
          setProfile(res.data.data);
          showToast("Avatar removed successfully", "success");
        } catch (err: any) {
          showToast(
            err.response?.data?.message || "Failed to remove avatar",
            "error",
          );
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.post("/profile/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast(
        "Password updated successfully. You have been logged out of all devices. Redirecting to login...",
        "success",
      );
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Password update failed",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Update Notification preferences
  const handlePreferenceChange = async (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    try {
      await apiClient.patch("/profile/preferences", updated);
      showToast("Notification preferences updated", "success");
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to update preferences",
        "error",
      );
    }
  };

  // Revoke Specific Session
  const handleRevokeSession = (sessionId: string) => {
    setConfirmAction({
      title: "Revoke Active Session",
      message: "Are you sure you want to log out this device session?",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/profile/sessions/${sessionId}`);
          showToast("Session terminated", "success");
          fetchSubResource();
        } catch (err: any) {
          showToast(
            err.response?.data?.message || "Revocation failed",
            "error",
          );
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  // Revoke All Sessions
  const handleRevokeAllSessions = () => {
    setConfirmAction({
      title: "Revoke All Sessions",
      message:
        "Terminate all device connections? This will log you out of your current session as well.",
      onConfirm: async () => {
        try {
          await apiClient.delete("/profile/sessions");
          showToast(
            "All sessions invalidated. Redirecting to login...",
            "success",
          );
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } catch (err: any) {
          showToast(
            err.response?.data?.message || "Revocation failed",
            "error",
          );
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  // Request Profile Field Change Support Ticket
  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeRequestValue.trim() || !changeRequestReason.trim()) return;
    setActionLoading(true);
    try {
      await apiClient.post("/profile/request-change", {
        field: changeRequestField,
        value: changeRequestValue,
        reason: changeRequestReason,
      });
      showToast("Change request ticket submitted to administration", "success");
      setChangeRequestValue("");
      setChangeRequestReason("");
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to submit request",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Account Deactivation
  const handleDeactivateAccount = () => {
    setConfirmAction({
      title: "Deactivate Account",
      message:
        "Deactivating your account will block login access immediately. You can contact support to reactivate. Proceed?",
      onConfirm: async () => {
        try {
          await apiClient.post("/profile/deactivate");
          showToast("Account deactivated. Logging out...", "success");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } catch (err: any) {
          showToast(err.response?.data?.message || "Action failed", "error");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  // Account Deletion request
  const handleDeleteRequest = () => {
    setConfirmAction({
      title: "Request Account Deletion",
      message:
        "This will submit a ticket to delete your personal data permanently. This action is irreversible. Proceed?",
      onConfirm: async () => {
        try {
          await apiClient.post("/profile/delete-request");
          showToast("Deletion request submitted to admin review.", "success");
        } catch (err: any) {
          showToast(err.response?.data?.message || "Action failed", "error");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  // Data export trigger
  const handleExportData = async () => {
    try {
      showToast(
        "Data aggregation started. Download beginning shortly...",
        "info",
      );
      window.open(`${apiClient.defaults.baseURL}/profile/export`, "_blank");
    } catch (err) {
      showToast("Failed to initiate profile data export", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg transition duration-300 animate-slide-in ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : toast.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : "bg-indigo-50 text-indigo-800 border-indigo-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface max-w-md w-full p-6 rounded-2xl border border-border shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-text flex items-center gap-2">
              <AlertTriangle className="text-rose-500" size={20} />
              {confirmAction.title}
            </h3>
            <p className="text-sm text-text-light">{confirmAction.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-border hover:bg-background text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Summary Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="h-16 w-16 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold flex items-center justify-center text-2xl overflow-hidden shadow-inner">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile?.name?.substring(0, 2).toUpperCase() || "US"
                )}
              </div>
              <div
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-150 cursor-pointer"
                onClick={() => setIsEditingAvatar(true)}
              >
                <User size={16} className="text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-text">
                  {profile?.name || "Account Profile"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">
                  {profile?.status || "Active"}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-light">{profile?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {profile?.roles.map((r, idx) => (
                  <span
                    key={idx}
                    className="bg-primary/5 text-primary px-2.5 py-0.5 rounded-full font-bold border border-primary/10 capitalize"
                  >
                    {r}
                  </span>
                ))}
                <span className="bg-muted text-text-light px-2.5 py-0.5 rounded-full font-semibold">
                  Member since:{" "}
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
          </div>

          {/* <div className="flex gap-2">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-sm font-semibold hover:bg-background transition cursor-pointer"
            >
              <User size={15} />
              Edit Profile
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              <Download size={15} />
              Export Personal Data
            </button>
          </div> */}
        </div>

        {/* Edit Avatar Modal */}
        {isEditingAvatar && (
          <div className="mt-4 p-4 border border-border/80 rounded-xl bg-background/50 max-w-md">
            <form onSubmit={handleUpdateAvatar} className="space-y-3">
              <label className="block text-xs font-bold text-text uppercase">
                Avatar Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarFormUrl}
                  onChange={(e) => setAvatarFormUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold cursor-pointer transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingAvatar(false)}
                  className="px-3 py-1.5 border border-border hover:bg-background rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              {profile?.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Remove current photo
                </button>
              )}
            </form>
          </div>
        )}

        {/* Edit Profile Form Panel */}
        {isEditingProfile && (
          <form
            onSubmit={handleUpdateProfile}
            className="mt-6 border-t border-border pt-6 space-y-4 max-w-xl"
          >
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">
              Update Personal Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-text-light uppercase mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-light uppercase mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={profileForm.country}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, country: e.target.value })
                  }
                  placeholder="e.g. Canada"
                  className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1"
              >
                {actionLoading && (
                  <RotateCw className="animate-spin" size={12} />
                )}
                Save Details
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 border border-border hover:bg-background text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabs Menu */}
      {/* <div className="flex flex-wrap border-b border-border gap-2">
        {[
          { id: "overview", label: "Overview", icon: User },
          { id: "security", label: "Security", icon: Shield },
          { id: "sessions", label: "Sessions & Devices", icon: HardDrive },
          { id: "preferences", label: "Notifications", icon: Bell },
          { id: "subscription", label: "Subscription", icon: CreditCard, hide: profile?.accountType === "admin" },
          { id: "activity", label: "Activity & Audits", icon: Activity },
          { id: "privacy", label: "Privacy & Account", icon: FileText },
          { id: "timeline", label: "Milestones", icon: Clock },
        ].filter(t => !t.hide).map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-3 text-sm font-semibold relative transition flex items-center gap-2 cursor-pointer ${activeTab === t.id
                  ? "text-primary font-bold animate-pulse-subtle"
                  : "text-text-light hover:text-text"
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
      </div> */}

      {/* Tab Panels */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 min-h-[350px]">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-1/4 bg-border rounded" />
            <div className="h-24 bg-border rounded-xl" />
            <div className="h-20 bg-border rounded-xl" />
          </div>
        ) : (
          <>
            {/* 1. Overview */}
            {activeTab === "overview" && profile && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-text">
                    Account Summary
                  </h3>
                  <p className="text-xs text-text-light">
                    Overview of your registered personal and corporate data.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    {[
                      { label: "Full Name", value: profile.name },
                      { label: "Email Address", value: profile.email },
                      {
                        label: "Account Type",
                        value: profile.accountType.toUpperCase(),
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
                        label: "Company Name",
                        value: profile.companyName || "N/A",
                      },
                      {
                        label: "Country Origin",
                        value:
                          typeof profile.country === "object"
                            ? (profile.country as any)?.name
                            : profile.country || "N/A",
                      },
                      {
                        label: "Email Verified",
                        value: profile.emailVerified
                          ? "Verified ✅"
                          : "Unverified ⚠️",
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

            {/* 2. Security */}
            {activeTab === "security" && profile && (
              <div className="space-y-8">
                {/* Password Change form */}
                <div className="space-y-4 max-w-xl">
                  <div>
                    <h3 className="text-lg font-bold text-text">
                      Change Password
                    </h3>
                    <p className="text-xs text-text-light font-medium">
                      Update your account access credentials regularly.
                    </p>
                  </div>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-text-light uppercase mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-light uppercase mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-light uppercase mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-sm outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {actionLoading && (
                        <RotateCw className="animate-spin" size={12} />
                      )}
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 3. Sessions & Devices */}
            {activeTab === "sessions" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-text">
                      Active Login Sessions
                    </h3>
                    <p className="text-xs text-text-light">
                      Current login access keys active for your account.
                    </p>
                  </div>
                  <button
                    disabled={sessions.length <= 1}
                    onClick={handleRevokeAllSessions}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <LogOut size={14} />
                    Remote Logout All Other Devices
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 border border-border rounded-xl bg-background/50 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-text leading-snug">
                            {s.userAgent || "Web Browser"}
                          </span>
                          {s.isCurrent && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-600">
                              Current Session
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-text-light block mt-1">
                          IP Address: {s.ipAddress}
                        </span>
                        <span className="text-xs text-text-light block">
                          Authorized: {new Date(s.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {!s.isCurrent && (
                        <div className="flex justify-end pt-2 border-t border-border/50 text-xs">
                          <button
                            onClick={() => handleRevokeSession(s.id)}
                            className="text-rose-500 hover:text-rose-600 font-bold cursor-pointer"
                          >
                            Revoke Access
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-border">
                  <div>
                    <h3 className="text-sm font-bold text-text uppercase tracking-wider">
                      Trusted Device History
                    </h3>
                    <p className="text-xs text-text-light">
                      History of device fingerprints used to sign in.
                    </p>
                  </div>

                  {devices.length === 0 ? (
                    <p className="text-xs text-text-light italic">
                      No registered devices on record.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {devices.map((d) => (
                        <div
                          key={d.id}
                          className="p-3 border border-border/60 rounded-xl flex items-center justify-between text-xs bg-background/20"
                        >
                          <div className="flex items-center gap-3">
                            <Smartphone size={18} className="text-text-light" />
                            <div>
                              <span className="font-bold text-text block">
                                {d.deviceName || "Personal Device"}
                              </span>
                              <span className="text-text-light block">
                                OS: {d.osName} • Browser: {d.browserName}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-text-light block">
                              IP: {d.lastIpAddress}
                            </span>
                            <span className="text-[10px] text-text-light block">
                              Last Active:{" "}
                              {new Date(d.lastActiveAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Preferences */}
            {activeTab === "preferences" && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h3 className="text-lg font-bold text-text">
                    Notification Preferences
                  </h3>
                  <p className="text-xs text-text-light">
                    Configure notifications for different channel updates.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: "email",
                      label: "Email Alerts",
                      description:
                        "Receive transaction alerts and account confirmations in your inbox.",
                    },
                    {
                      key: "push",
                      label: "Push Notifications",
                      description:
                        "Get real-time browser action alerts immediately.",
                    },
                    {
                      key: "sms",
                      label: "SMS Messages",
                      description:
                        "Deliver urgent alerts directly to your phone.",
                    },
                    {
                      key: "marketing",
                      label: "Marketing Emails",
                      description:
                        "Weekly campaigns, offers, and platform enhancements.",
                    },
                    {
                      key: "security",
                      label: "Security & Login Alerts",
                      description:
                        "Crucial sign-in logs, password updates, and login alerts.",
                    },
                    {
                      key: "tender",
                      label: "RFP / Tender Updates",
                      description:
                        "New match alerts, invitations, and bidding activity updates.",
                    },
                    {
                      key: "newsletter",
                      label: "Monthly Newsletter",
                      description:
                        "Monthly insights and bid statistics analysis digests.",
                    },
                  ].map((pref) => (
                    <div
                      key={pref.key}
                      className="flex items-start justify-between p-3 border border-border/60 rounded-xl bg-background/20"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-sm text-text block">
                          {pref.label}
                        </span>
                        <span className="text-xs text-text-light block leading-normal">
                          {pref.description}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={
                            preferences[
                              pref.key as keyof NotificationPreferences
                            ]
                          }
                          onChange={(e) =>
                            handlePreferenceChange(
                              pref.key as keyof NotificationPreferences,
                              e.target.checked,
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-border rounded-full peer peer-focus:ring-1 peer-focus:ring-primary/45 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Subscription */}
            {activeTab === "subscription" && subscription && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-text">
                    Subscription Plan
                  </h3>
                  <p className="text-xs text-text-light">
                    Current tier subscription and billing range.
                  </p>
                </div>

                <div className="p-5 border border-border rounded-2xl bg-background/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-light">
                      Current Plan
                    </span>
                    <h4 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      {subscription.plan?.name || "Trial Account"}
                    </h4>
                    {subscription.plan && (
                      <p className="text-xs text-text-light mt-1 font-semibold">
                        Rate: ${subscription.plan.price} /{" "}
                        {subscription.plan.billingInterval}
                      </p>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-text-light space-y-1 sm:text-right">
                    <div>
                      Status:{" "}
                      <span className="text-emerald-500 font-bold uppercase">
                        {subscription.status}
                      </span>
                    </div>
                    {subscription.expiresAt && (
                      <div>
                        Expires:{" "}
                        {new Date(subscription.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 6. Activity & Audits */}
            {activeTab === "activity" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-text">
                    Personal Log Audit History
                  </h3>
                  <p className="text-xs text-text-light">
                    Access audit logs to review logins and profile interactions.
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-text border-b border-border pb-2">
                      Activity Events
                    </h4>
                    {activities.length === 0 ? (
                      <p className="text-xs text-text-light italic">
                        No active events logged.
                      </p>
                    ) : (
                      activities.map((a) => (
                        <div
                          key={a.id}
                          className="p-3 border border-border/50 rounded-xl bg-background/30 text-xs"
                        >
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-text">{a.action}</span>
                            <span className="text-text-light font-normal text-[10px]">
                              {new Date(a.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {a.details && (
                            <pre className="mt-1 text-[10px] text-text-light font-mono bg-muted p-1.5 rounded max-h-16 overflow-y-auto whitespace-pre-wrap">
                              {JSON.stringify(a.details)}
                            </pre>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-text border-b border-border pb-2">
                      Security Audit History
                    </h4>
                    {securityLogs.length === 0 ? (
                      <p className="text-xs text-text-light italic">
                        No security history logs.
                      </p>
                    ) : (
                      securityLogs.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 border border-border/50 rounded-xl bg-background/30 text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-text">{s.event}</span>
                            <span className="text-text-light font-normal text-[10px]">
                              {new Date(s.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[10px] text-text-light block">
                            IP: {s.ipAddress || "Internal"} • Agent:{" "}
                            {s.userAgent || "Unknown"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 7. Privacy & Account Controls */}
            {activeTab === "privacy" && (
              <div className="space-y-8">
                {/* Data Change Request */}
                <div className="space-y-4 max-w-xl">
                  <div>
                    <h3 className="text-lg font-bold text-text">
                      Request Data Correction
                    </h3>
                    <p className="text-xs text-text-light font-medium">
                      To modify locked attributes (e.g. Email, Company
                      Registration, Tax ID), submit a change request ticket.
                    </p>
                  </div>
                  <form
                    onSubmit={handleRequestChange}
                    className="space-y-3 p-4 border border-border rounded-xl bg-background/30"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-text-light uppercase mb-1">
                          Target Field
                        </label>
                        <select
                          value={changeRequestField}
                          onChange={(e) =>
                            setChangeRequestField(e.target.value)
                          }
                          className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-xs font-semibold outline-none"
                        >
                          <option value="email">Email Address</option>
                          <option value="companyName">
                            Company Legal Name
                          </option>
                          <option value="taxId">Government ID / Tax ID</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-light uppercase mb-1">
                          Requested Value
                        </label>
                        <input
                          type="text"
                          required
                          value={changeRequestValue}
                          onChange={(e) =>
                            setChangeRequestValue(e.target.value)
                          }
                          className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-xs outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-light uppercase mb-1">
                        Reason / Supporting Proof Details
                      </label>
                      <textarea
                        required
                        placeholder="Please supply the legal rationale or supporting details..."
                        value={changeRequestReason}
                        onChange={(e) => setChangeRequestReason(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs outline-none h-20 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto"
                    >
                      <PlusCircle size={14} />
                      Submit Request
                    </button>
                  </form>
                </div>

                {/* Consent & OAuth */}
                <div className="border-t border-border pt-6 max-w-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-text uppercase tracking-wider">
                      Connected Accounts & OAuth
                    </h3>
                    <p className="text-xs text-text-light">
                      Manage sign-in integrations with external OAuth
                      authentication providers.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        provider: "Google",
                        desc: "Sign in with your Google Workspace profile.",
                      },
                      {
                        provider: "Microsoft",
                        desc: "Connect Azure Active Directory profile.",
                      },
                      {
                        provider: "GitHub",
                        desc: "Enable developer account sign-in mapping.",
                      },
                    ].map((app) => (
                      <div
                        key={app.provider}
                        className="flex items-center justify-between p-3 border border-border/60 rounded-xl bg-background/25"
                      >
                        <div className="flex items-center gap-3">
                          <Link2 size={16} className="text-text-light" />
                          <div>
                            <span className="font-bold text-xs text-text block">
                              {app.provider}
                            </span>
                            <span className="text-[10px] text-text-light block mt-0.5">
                              {app.desc}
                            </span>
                          </div>
                        </div>
                        <button className="px-2.5 py-1 border border-border hover:bg-background text-[10px] font-bold rounded-lg cursor-pointer transition">
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Destructive Actions */}
                <div className="border-t border-border pt-6 max-w-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider">
                      Danger Zone
                    </h3>
                    <p className="text-xs text-text-light">
                      Deactivate or request permanent erasure of your personal
                      account.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleDeactivateAccount}
                      className="px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100/60 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Deactivate Account
                    </button>
                    <button
                      onClick={handleDeleteRequest}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Delete Data Permanently
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 8. Timelines */}
            {activeTab === "timeline" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-text">
                    Account Progress Timeline
                  </h3>
                  <p className="text-xs text-text-light">
                    Personal account progress checkpoints and security
                    milestones.
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-primary/20 space-y-6 max-w-xl">
                  {timeline.length === 0 ? (
                    <p className="text-xs text-text-light italic pl-2">
                      No timeline events found.
                    </p>
                  ) : (
                    timeline.map((t, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-surface flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="pl-3">
                          <span className="text-xs text-text-light font-bold block">
                            {new Date(t.timestamp).toLocaleString()}
                          </span>
                          <span className="text-sm font-bold text-text block">
                            {t.title}
                          </span>
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
    </div>
  );
}
