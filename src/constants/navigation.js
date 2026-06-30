import {
  LayoutDashboard,
  Shapes,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  ShieldCogCorner,
  ShieldCheck,
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Shapes,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Role Assignments",
    href: "/roleassignments",
    icon: ShieldCheck,
  },
];

export const systemNavigation = [
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
