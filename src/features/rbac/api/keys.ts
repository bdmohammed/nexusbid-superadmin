export const rbacKeys = {
    all: ["rbac"] as const,

    roles: () => [...rbacKeys.all, "roles"] as const,

    role: (id: string) =>
        [...rbacKeys.roles(), id] as const,

    assignments: () =>
        [...rbacKeys.all, "assignments"] as const,

    permissions: () =>
        [...rbacKeys.all, "permissions"] as const,

    modules: () =>
        [...rbacKeys.all, "modules"] as const,

    auditLogs: () =>
        [...rbacKeys.all, "audit"] as const,

    assignableUsers: () =>
        [...rbacKeys.all, "assignable-users"] as const,
};