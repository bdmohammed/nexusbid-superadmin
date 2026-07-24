export interface AuditQuery {
  from?: string;
  to?: string;
  module?: string;
  action?: string;
  severity?: string;
  status?: string;
  userId?: string;
  userEmail?: string;
  role?: string;
  country?: string;
  ipAddress?: string;
  device?: string;
  browser?: string;
  os?: string;
  method?: string;
  responseCode?: string;
  entityType?: string;
  entityId?: string;
  correlationId?: string;
  requestId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SecurityEventsQuery {
  page?: number;
  limit?: number;
}

export interface UpdateRetentionInput {
  category: string;
  retentionDays: number;
}

export interface RequestAuditExportInput {
  exportType: 'CSV' | 'EXCEL' | 'PDF' | 'JSON';
  filters?: AuditQuery;
}

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  severity: string;
  status: string;
  userId?: string | null;
  userEmail?: string | null;
  role?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  country?: string | null;
  device?: string | null;
  browser?: string | null;
  os?: string | null;
  method?: string | null;
  responseCode?: number | null;
  entityType?: string | null;
  entityId?: string | null;
  correlationId?: string | null;
  requestId?: string | null;
  details?: any;
  createdAt: string;
}

export interface SecurityLog {
  id: string;
  event: string;
  severity: string;
  userId?: string | null;
  userEmail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: any;
  createdAt: string;
}

export interface AuditStatistics {
  totalEvents: number;
  eventsBySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  eventsByStatus: {
    success: number;
    failure: number;
    warning: number;
  };
  eventsByModule: Record<string, number>;
  timeline: {
    period: string;
    count: number;
  }[];
}

export interface RetentionPolicy {
  id: string;
  category: string;
  retentionDays: number;
  updatedAt: string;
}

export interface AuditExportJob {
  id: string;
  userId: string;
  exportFormat: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string | null;
  createdAt: string;
  completedAt?: string | null;
}
