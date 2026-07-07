import type { RolePermission } from "@/types";

const rolePermissions: RolePermission[] = [
  {
    category: "Dashboard",
    permissions: ["dashboard.view"],
  },
  {
    category: "Tender Management",
    permissions: [
      "tender.view",
      "tender.create",
      "tender.edit",
      "tender.delete",
      "tender.publish",
      "tender.close",
    ],
  },
  {
    category: "Category Management",
    permissions: [
      "category.view",
      "category.create",
      "category.edit",
      "category.delete",
    ],
  },
  {
    category: "User Management",
    permissions: ["user.view", "user.block", "user.create_admin"],
  },
  {
    category: "Subscription & Plans",
    permissions: ["subscription.view", "plan.manage"],
  },
  {
    category: "Access Control (RBAC)",
    permissions: ["rbac.manage"],
  },
  {
    category: "Analytics & Reports",
    permissions: ["analytics.view"],
  },
  {
    category: "Security & Audit Logs",
    permissions: ["audit_logs.view"],
  },
];

export default rolePermissions;
