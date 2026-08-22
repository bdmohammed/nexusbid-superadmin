export const authQueryKeys = {
  all: ["auth"] as readonly ["auth"],
  me: () =>
    [...authQueryKeys.all, "me"] as readonly [
      ...typeof authQueryKeys.all,
      "me",
    ],
  session: () =>
    [...authQueryKeys.all, "session"] as readonly [
      ...typeof authQueryKeys.all,
      "session",
    ],
  sessions: () =>
    [...authQueryKeys.all, "sessions"] as readonly [
      ...typeof authQueryKeys.all,
      "sessions",
    ],
  devices: () =>
    [...authQueryKeys.all, "devices"] as readonly [
      ...typeof authQueryKeys.all,
      "devices",
    ],
  ownerReview: (query?: any) =>
    [...authQueryKeys.all, "owner-review", query] as const,
  users: (query?: any) => [...authQueryKeys.all, "users-list", query] as const,
  userStats: () => [...authQueryKeys.all, "users-stats"] as const,
  userDetails: (id: string) =>
    [...authQueryKeys.all, "user-details", id] as const,
  userOverview: (id: string) =>
    [...authQueryKeys.all, "user-overview", id] as const,
  userSecurity: (id: string) =>
    [...authQueryKeys.all, "user-security", id] as const,
  userSessions: (id: string) =>
    [...authQueryKeys.all, "user-sessions", id] as const,
  userDevices: (id: string) =>
    [...authQueryKeys.all, "user-devices", id] as const,
  userActivity: (id: string) =>
    [...authQueryKeys.all, "user-activity", id] as const,
  userTimeline: (id: string) =>
    [...authQueryKeys.all, "user-timeline", id] as const,
  userAudit: (id: string) => [...authQueryKeys.all, "user-audit", id] as const,
  userSubscription: (id: string) =>
    [...authQueryKeys.all, "user-subscription", id] as const,
  userNotes: (id: string) => [...authQueryKeys.all, "user-notes", id] as const,
  userRoles: (id: string) => [...authQueryKeys.all, "user-roles", id] as const,
  userPermissions: (id: string) =>
    [...authQueryKeys.all, "user-permissions", id] as const,
  setupAllowed: () => [...authQueryKeys.all, "setup-allowed"] as const,
};
