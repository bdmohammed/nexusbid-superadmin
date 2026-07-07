import { DollarSign, Package, TrendingUp, Users } from "lucide-react";
import type {
  CountryData,
  DashboardStat,
  MonthlySales,
  RecentOrder,
  StatisticsData,
  TenderCategoryStats,
} from "@/types";

export const dashboardStats: DashboardStat[] = [
  {
    id: 1,
    title: "Customers",
    value: "3,782",
    change: "+11.01%",
    trend: "up",
    icon: Users,
    iconBg: "bg-indigo-100",
    iconColor: "text-primary",
  },
  {
    id: 2,
    title: "Orders",
    value: "5,359",
    change: "-9.05%",
    trend: "down",
    icon: Package,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    id: 3,
    title: "Revenue",
    value: "₹24.8L",
    change: "+14.72%",
    trend: "up",
    icon: DollarSign,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 4,
    title: "Growth",
    value: "18.4%",
    change: "+3.2%",
    trend: "up",
    icon: TrendingUp,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

export const monthlySales: MonthlySales[] = [
  { month: "Jan", sales: 160 },
  { month: "Feb", sales: 380 },
  { month: "Mar", sales: 190 },
  { month: "Apr", sales: 290 },
  { month: "May", sales: 180 },
  { month: "Jun", sales: 190 },
  { month: "Jul", sales: 280 },
  { month: "Aug", sales: 100 },
  { month: "Sep", sales: 210 },
  { month: "Oct", sales: 380 },
  { month: "Nov", sales: 270 },
  { month: "Dec", sales: 110 },
];

export const statistics: StatisticsData[] = [
  { month: "Jan", sales: 180, revenue: 40 },
  { month: "Feb", sales: 190, revenue: 30 },
  { month: "Mar", sales: 170, revenue: 50 },
  { month: "Apr", sales: 160, revenue: 40 },
  { month: "May", sales: 175, revenue: 55 },
  { month: "Jun", sales: 165, revenue: 40 },
  { month: "Jul", sales: 170, revenue: 70 },
  { month: "Aug", sales: 205, revenue: 100 },
  { month: "Sep", sales: 230, revenue: 110 },
  { month: "Oct", sales: 210, revenue: 120 },
  { month: "Nov", sales: 240, revenue: 150 },
  { month: "Dec", sales: 236, revenue: 140 },
];

export const countries: CountryData[] = [
  {
    country: "USA",
    customers: 2379,
    percentage: 79,
  },
  {
    country: "France",
    customers: 589,
    percentage: 23,
  },
  {
    country: "India",
    customers: 1044,
    percentage: 42,
  },
];

export const tenderCategories: TenderCategoryStats[] = [
  {
    id: 1,
    name: "Civil Works",
    total: 128,
    percentage: 78,
    color: "#4F46E5",
  },
  {
    id: 2,
    name: "Electrical",
    total: 86,
    percentage: 62,
    color: "#06B6D4",
  },
  {
    id: 3,
    name: "HVAC",
    total: 73,
    percentage: 51,
    color: "#22C55E",
  },
  {
    id: 4,
    name: "Fire Fighting",
    total: 42,
    percentage: 31,
    color: "#F97316",
  },
  {
    id: 5,
    name: "Plumbing",
    total: 64,
    percentage: 45,
    color: "#EC4899",
  },
];

export const recentOrders: RecentOrder[] = [
  {
    id: 1,
    product: "MacBook Pro 13",
    variants: "2 Variants",
    price: "$2399",
    category: "Laptop",
    status: "Delivered",
  },
  {
    id: 2,
    product: "Apple Watch Ultra",
    variants: "1 Variant",
    price: "$879",
    category: "Watch",
    status: "Pending",
  },
  {
    id: 3,
    product: "iPhone 15 Pro Max",
    variants: "2 Variants",
    price: "$1869",
    category: "Smartphone",
    status: "Delivered",
  },
  {
    id: 4,
    product: "iPad Pro 3rd Gen",
    variants: "2 Variants",
    price: "$1699",
    category: "Electronics",
    status: "Cancelled",
  },
  {
    id: 5,
    product: "AirPods Pro",
    variants: "1 Variant",
    price: "$249",
    category: "Accessories",
    status: "Delivered",
  },
];

export const statisticsData: StatisticsData[] = [
  {
    month: "Jan",
    sales: 180,
    revenue: 40,
  },
  {
    month: "Feb",
    sales: 190,
    revenue: 30,
  },
  {
    month: "Mar",
    sales: 170,
    revenue: 50,
  },
  {
    month: "Apr",
    sales: 160,
    revenue: 40,
  },
  {
    month: "May",
    sales: 175,
    revenue: 55,
  },
  {
    month: "Jun",
    sales: 165,
    revenue: 40,
  },
  {
    month: "Jul",
    sales: 170,
    revenue: 70,
  },
  {
    month: "Aug",
    sales: 205,
    revenue: 100,
  },
  {
    month: "Sep",
    sales: 230,
    revenue: 110,
  },
  {
    month: "Oct",
    sales: 210,
    revenue: 120,
  },
  {
    month: "Nov",
    sales: 240,
    revenue: 150,
  },
  {
    month: "Dec",
    sales: 235,
    revenue: 140,
  },
];
