import type { ThemeMode } from '@/store';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
  hidden: boolean;
  collapsed: boolean;
}

export interface WidgetDefinition {
  id: string;
  title: string;
  description: string;
  defaultLayout: WidgetPosition;
  enabled: boolean;
}

export interface DashboardConfig {
  widgets: WidgetDefinition[];
  layoutVersion: number;
  theme: ThemeMode;
}

export interface PatchLayoutInput {
  widgets: WidgetPosition[];
}

export interface TenderStats {
  DRAFT: number;
  UNDER_REVIEW: number;
  PUBLISHED: number;
  CLOSING_TODAY: number;
  AWARDED: number;
  ARCHIVED: number;
}

export interface RevenueStats {
  monthlyRevenue: number;
  mrr: number;
  arr: number;
  averagePlanValue: number;
  growthThisMonth: number;
  activeCount: number;
}

export interface UsersStats {
  totalUsers: number;
  admins: number;
  pendingApprovals: number;
  blockedUsers: number;
}

export interface ReviewQueueStats {
  pendingRoleReviews: number;
  pendingTenderReviews: number;
  pendingSubscriptionReviews: number;
  pendingCategoryReviews: number;
}

export interface CriticalAlerts {
  type: string;
  value: number;
  label: string;
}

export interface RecentActivityItem {
  id: string;
  timestamp: string;
  description: string;
}

export interface SystemHealth {
  generatedAt: string;
  metrics: DashboardMetric[];
}

export interface DashboardMetric {
  type: DashboardMetricType;
  label: string;
  value?: number | string;
  unit?: 'ms' | '%' | 'jobs' | 'MB';
  status?: DashboardStatus;
}

export enum DashboardStatus {
  HEALTHY = 'healthy',
  OPERATIONAL = 'operational',
  AVAILABLE = 'available',
  CONNECTED = 'connected',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum DashboardMetricType {
  API_LATENCY = 'apiLatency',
  QUEUE_SIZE = 'queueSize',
  REDIS = 'redis',
  STORAGE_USAGE = 'storageUsage',
  DATABASE = 'database',
  MEMORY_USAGE_PERCENT = 'memoryUsagePercent',
  CPU_USAGE_PERCENT = 'cpuUsagePercent',
  MEMORY_USAGE_MB = 'memoryUsageMb',
  LOAD_AVERAGE_1M = 'loadAverage1m',
}

export interface QuickActionItem {
  title: string;
  route: string;
  permission: string;
}
