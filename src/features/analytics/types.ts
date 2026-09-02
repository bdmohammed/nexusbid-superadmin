export interface AnalyticsQuery {
  from?: string;
  to?: string;
  granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  country?: string;
  categoryId?: string;
  planId?: string;
  currency?: string;
  tenderType?: string;
  tenderStatus?: string;
  procurementType?: string;
  device?: string;
  browser?: string;
}

export interface DashboardFilters {
  categories?: string[];
  states?: string[];
  minValue?: number;
  maxValue?: number;
  keyword?: string;
}

export interface SaveDashboardLayoutInput {
  widgets: string[];
  filters?: DashboardFilters;
  theme?: string;
}

export interface ScheduledReportFilters {
  categories?: string[];
  states?: string[];
  status?: string[];
  startDate?: string;
  endDate?: string;
}

export interface CreateScheduledReportInput {
  reportName: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  timezone?: string;
  filters?: ScheduledReportFilters;
  recipients: {
    users?: string[];
    roles?: string[];
    emails?: string[];
    webhooks?: string[];
  };
}

export interface RequestExportInput {
  exportType:
    'tenders' | 'bids' | 'financial' | 'users' | 'vendors' | 'traffic' | 'categories' | 'system';
  filters?: Record<string, any>;
}

export interface RevenueAnalyticsResult {
  period: string;
  totalCents: string;
  count: string;
}

export interface UserGrowthResult {
  period: string;
  count: string;
}

export interface TopDownloadResult {
  id: string;
  title: string;
  slug: string;
  download_count: number;
}

export interface OverviewStats {
  activeUsers: number;
  totalTenderValueCents: string;
  totalSubscribers: number;
  conversionRate: number;
  activeTenders: number;
  growthPercent: number;
}

export interface TenderAnalyticsRow {
  publishedDate: string;
  count: number;
  totalValueCents: string;
}

export interface UserAnalyticsRow {
  date: string;
  registrations: number;
  activeCount: number;
}

export interface CategoryAnalyticsRow {
  categoryId: string;
  categoryName: string;
  tenderCount: number;
  totalValueCents: string;
}

export interface SystemPerformanceMetrics {
  cpuUsage: number;
  memoryUsageMb: number;
  dbLatencyMs: number;
  cacheHitRatio: number;
  activeConnections: number;
}

export interface DashboardLayout {
  widgets: string[];
  filters: DashboardFilters;
  theme: string;
}

export interface ActiveAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  triggeredAt: string;
  resolvedAt?: string | null;
}

export interface ExportJob {
  id: string;
  userId: string;
  exportType: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface ScheduledReport {
  id: string;
  reportName: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  timezone: string;
  filters: ScheduledReportFilters;
  recipients: {
    emails?: string[];
  };
  isActive: boolean;
  createdAt: string;
}
