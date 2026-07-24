export interface WidgetPosition {
  widgetId?: string;
  id?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hidden?: boolean;
  collapsed?: boolean;
}

export interface WidgetDefinition {
  id: string;
  title: string;
  requiredPermission: string;
  defaultSize: { w: number; h: number };
  component: string;
  enabled: boolean;
}

export interface DashboardConfig {
  widgets: WidgetDefinition[];
  layout: WidgetPosition[];
  theme: string;
}

export interface PatchLayoutInput {
  widgets: WidgetPosition[];
  theme?: string;
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
  securityAlerts: number;
  failedPayments: number;
  expiredSubscriptions: number;
  closingTenders: number;
  systemErrors: number;
}

export interface RecentActivityItem {
  id: string;
  timestamp: string;
  description: string;
}

export interface SystemHealth {
  apiLatencyMs: number;
  queueSize: number;
  redisStatus: string;
  storageUsagePercent: number;
  databaseStatus: string;
  memoryUsagePercent: number;
  loadAverage1m: number;
  cpuUsagePercent: number;
  memoryUsageMb: number;
}

export interface QuickActionItem {
  title: string;
  route: string;
  permission: string;
}
