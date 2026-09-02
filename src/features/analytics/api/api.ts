import type {
  ActiveAlert,
  AnalyticsQuery,
  CategoryAnalyticsRow,
  CreateScheduledReportInput,
  DashboardLayout,
  ExportJob,
  OverviewStats,
  RequestExportInput,
  RevenueAnalyticsResult,
  SaveDashboardLayoutInput,
  ScheduledReport,
  SystemPerformanceMetrics,
  TenderAnalyticsRow,
  TopDownloadResult,
  UserAnalyticsRow,
  UserGrowthResult,
} from '../types';
import type { ApiResponse } from '@/types';
import { apiClient } from '@/lib/http';

export const analyticsApi = {
  getOverview(query?: AnalyticsQuery) {
    return apiClient.get<ApiResponse<OverviewStats>>('/analytics/overview', {
      params: query,
    });
  },

  getTenders(query?: AnalyticsQuery) {
    return apiClient.get<ApiResponse<TenderAnalyticsRow[]>>('/analytics/tenders', {
      params: query,
    });
  },

  getUsersMetrics(query?: AnalyticsQuery) {
    return apiClient.get<ApiResponse<UserAnalyticsRow[]>>('/analytics/users', {
      params: query,
    });
  },

  getRevenueMetrics(query?: AnalyticsQuery) {
    return apiClient.get<ApiResponse<RevenueAnalyticsResult[]>>('/analytics/revenue', {
      params: query,
    });
  },

  getCategoriesMetrics() {
    return apiClient.get<ApiResponse<CategoryAnalyticsRow[]>>('/analytics/categories');
  },

  getSystemMetrics() {
    return apiClient.get<ApiResponse<SystemPerformanceMetrics>>('/analytics/system');
  },

  getDashboard() {
    return apiClient.get<ApiResponse<DashboardLayout>>('/analytics/dashboard');
  },

  saveDashboard(input: SaveDashboardLayoutInput) {
    return apiClient.post<ApiResponse<DashboardLayout>>('/analytics/dashboard', input);
  },

  getAlertsList() {
    return apiClient.get<ApiResponse<ActiveAlert[]>>('/analytics/alerts');
  },

  resolveAlertTrigger(alertId: string) {
    return apiClient.post<ApiResponse<any>>(`/analytics/alerts/${alertId}/resolve`);
  },

  requestDataExport(input: RequestExportInput) {
    return apiClient.post<ApiResponse<ExportJob>>('/analytics/exports/request', input);
  },

  getExportJobs() {
    return apiClient.get<ApiResponse<ExportJob[]>>('/analytics/exports/jobs');
  },

  downloadExportFile(filename: string) {
    return apiClient.get<any>(`/analytics/exports/download/${filename}`, {
      responseType: 'blob',
    });
  },

  createReportSchedule(input: CreateScheduledReportInput) {
    return apiClient.post<ApiResponse<ScheduledReport>>('/analytics/reports/schedules', input);
  },

  listReportSchedules() {
    return apiClient.get<ApiResponse<ScheduledReport[]>>('/analytics/reports/schedules');
  },

  getUserGrowth(query?: AnalyticsQuery) {
    return apiClient.get<ApiResponse<UserGrowthResult[]>>('/analytics/user-growth', {
      params: query,
    });
  },

  getRevenueLegacy(query?: AnalyticsQuery) {
    return apiClient.get<ApiResponse<any[]>>('/analytics/revenue-legacy', {
      params: query,
    });
  },

  getTopDownloads() {
    return apiClient.get<ApiResponse<TopDownloadResult[]>>('/analytics/downloads');
  },
};
