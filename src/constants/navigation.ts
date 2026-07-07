import {
  BarChart3,
  CreditCard,
  HelpCircle,
  History,
  LayoutDashboard,
  Settings,
  Shapes,
  Shield,
  ShieldCheck,
  TableProperties,
  Users,
  User,
  LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: ComponentType<LucideProps>;
  requiredPermission?: string;
}

export const navigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tenders",
    href: "/tenders",
    icon: TableProperties,
    requiredPermission: "tender.view",
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Shapes,
    requiredPermission: "category.view",
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    requiredPermission: "user.view",
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Support",
    href: "/support",
    icon: HelpCircle,
  },
  {
    title: "Roles",
    href: "/roles",
    icon: Shield,
    requiredPermission: "rbac.manage",
  },
  {
    title: "Role Assignments",
    href: "/roleassignments",
    icon: ShieldCheck,
    requiredPermission: "rbac.manage",
  },
];

export const systemNavigation: NavigationItem[] = [
  {
    title: "Profile",
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
