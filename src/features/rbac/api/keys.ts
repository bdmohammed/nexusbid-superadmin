export const rbacKeys = {
  all: ['rbac'] as const,

  roles: () => [...rbacKeys.all, 'roles'] as const,

  role: (id: string) => [...rbacKeys.roles(), id] as const,

  categorizedRoles: () => [...rbacKeys.roles(), 'categorized'] as const,

  stats: () => [...rbacKeys.all, 'stats'] as const,

  roleVersions: (roleId: string) => [...rbacKeys.role(roleId), 'versions'] as const,

  reviewDetails: (reviewId: string) => [...rbacKeys.all, 'review-details', reviewId] as const,

  forensicLogs: (params?: any) => [...rbacKeys.all, 'forensic-logs', params] as const,

  assignments: () => [...rbacKeys.all, 'assignments'] as const,

  permissions: () => [...rbacKeys.all, 'permissions'] as const,

  modules: () => [...rbacKeys.all, 'modules'] as const,

  auditLogs: () => [...rbacKeys.all, 'audit'] as const,

  assignableUsers: () => [...rbacKeys.all, 'assignable-users'] as const,
};
