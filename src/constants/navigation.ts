import {
  BarChart3,
  CreditCard,
  Globe,
  History,
  LayoutDashboard,
  LucideProps,
  Settings,
  Shapes,
  Shield,
  ShieldCheck,
  TableProperties,
  User,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

export interface NavigationItem {
  title: string;
  headerTitle?: string;
  subtitle?: string;
  href: string;
  icon: ComponentType<LucideProps>;
  requiredPermission?: string;
  children?: {
    title: string;
    href: string;
    requiredPermission?: string;
  }[];
}

export const navigation: NavigationItem[] = [
  {
    title: "Dashboard",
    headerTitle: "Executive Dashboard",
    subtitle:
      "Real-time analytics, tender metrics, and platform operations overview.",
    href: "/dashboard",
    icon: LayoutDashboard,
    requiredPermission: "dashboard.view",
  },
  {
    title: "Tenders",
    headerTitle: "Tenders Management",
    subtitle:
      "Central Command for tender creation, approvals, versions comparator, and evaluations.",
    href: "/tenders",
    icon: TableProperties,
    requiredPermission: "tender.view",
    children: [
      {
        title: "Tenders Stats",
        href: "/tenders?view=stats",
        requiredPermission: "tender.view",
      },
      {
        title: "Tenders List",
        href: "/tenders?view=list",
        requiredPermission: "tender.manage",
      },
    ],
  },
  {
    title: "Categories",
    headerTitle: "Category Taxonomy",
    subtitle:
      "Organize procurement classifications, hierarchy codes, and sector tags.",
    href: "/categories",
    icon: Shapes,
    requiredPermission: "category.view",
    children: [
      {
        title: "Category Stats",
        href: "/categories?view=stats",
        requiredPermission: "category.view",
      },
      {
        title: "Category List",
        href: "/categories?view=list",
        requiredPermission: "category.manage",
      },
    ],
  },
  {
    title: "Users",
    headerTitle: "Enterprise User Directory",
    subtitle:
      "Monitor, audit, impersonate, and manage administrators and customers in one command center.",
    href: "/users",
    icon: Users,
    requiredPermission: "user.view",
    children: [
      {
        title: "User Stats",
        href: "/users?view=stats",
        requiredPermission: "user.view",
      },
      {
        title: "User List",
        href: "/users?view=list",
        requiredPermission: "user.manage",
      },
    ],
  },
  {
    title: "Subscriptions",
    headerTitle: "Subscription Management",
    subtitle:
      "Manage billing tiers, payment gateways, feature gates, and subscriber entitlements.",
    href: "/subscriptions",
    icon: CreditCard,
    requiredPermission: "billing.view",
    children: [
      {
        title: "Subscriptions Stats",
        href: "/subscriptions?view=stats",
        requiredPermission: "billing.view",
      },
      {
        title: "Plans",
        href: "/subscriptions?view=plan-list",
        requiredPermission: "billing.manage",
      },
      {
        title: "Recent Payments List",
        href: "/subscriptions?view=payment-list",
        requiredPermission: "billing.manage",
      },
    ],
  },
  {
    title: "Roles",
    headerTitle: "Roles & Permissions Control Panel",
    subtitle:
      "Manage enterprise role versioning, draft locking, reviewer consensus, and permission registry snapshot assignments.",
    href: "/roles",
    icon: Shield,
    requiredPermission: "role.view",
    children: [
      {
        title: "Stats Dashboard",
        href: "/roles?view=stats",
        requiredPermission: "role.view",
      },
      {
        title: "Role Registry Management",
        href: "/roles?view=list",
        requiredPermission: "role.manage",
      },
    ],
  },
  {
    title: "Role Assignments",
    headerTitle: "Role Assignments",
    subtitle:
      "Grant, track, audit, and revoke time-bound user role authorizations across the enterprise.",
    href: "/role-assignments",
    icon: ShieldCheck,
    requiredPermission: "role.view",
    children: [
      {
        title: "Stats Dashboard",
        href: "/role-assignments?view=stats",
      },
      {
        title: "Role Assignments Registry Management",
        href: "/role-assignments?view=list",
      },
    ],
  },
  {
    title: "Countries",
    headerTitle: "Country Master Governance",
    subtitle:
      "Govern country and state status activations, Maker-Checker review tickets, and operational dependencies.",
    href: "/countries",
    icon: Globe,
    requiredPermission: "country.view",
    children: [
      {
        title: "Stats Dashboard",
        href: "/countries?tab=stats",
      },
      {
        title: "Geography Hierarchy",
        href: "/countries?tab=list",
      },
      {
        title: "Review Ticket Queue",
        href: "/countries?tab=reviews",
      },
    ],
  },
];

export const systemNavigation: NavigationItem[] = [
  {
    title: "Profile",
    headerTitle: "Administrator Profile",
    subtitle:
      "Update security credentials, personal preferences, and authentication settings.",
    href: "/profile",
    icon: User,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Audit Logs",
    href: "/audit-logs",
    icon: History,
    requiredPermission: "audit_logs.view",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
