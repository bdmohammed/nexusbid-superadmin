import type { PermissionPreset } from "@/types";

const permissionPresets: PermissionPreset[] = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full access to entire application.",
  },
  {
    id: 2,
    name: "System Administrator",
    description: "Manage system settings and users.",
  },
  {
    id: 3,
    name: "Marketplace Manager",
    description: "Manage marketplace operations.",
  },
  {
    id: 4,
    name: "Subscription Manager",
    description: "Manage plans, invoices and subscriptions.",
  },
  {
    id: 5,
    name: "Category Administrator",
    description: "Manage categories and listings.",
  },
  {
    id: 6,
    name: "Tender Manager",
    description: "Manage tenders and procurement process.",
  },
  {
    id: 7,
    name: "Compliance Officer",
    description: "Review compliance and approvals.",
  },
  {
    id: 8,
    name: "Finance Manager",
    description: "Financial reports and invoices.",
  },
  {
    id: 9,
    name: "Read Only",
    description: "View only access.",
  },
  {
    id: 10,
    name: "Custom",
    description: "Configure permissions manually.",
  },
];

export default permissionPresets;
