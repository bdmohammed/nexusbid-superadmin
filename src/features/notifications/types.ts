export interface NotificationAction {
  id: string;
  label: string;
  type?: string;
  payload?: any;
  requiredPermissionKey?: string;
  permission?: string;
  btnOrder?: number;
  actionUrl?: string | null;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  status: "UNREAD" | "READ" | "ARCHIVED" | "DISMISSED";
  readAt?: string | null;
  createdAt: string;
  title: string;
  message: string;
  category: string;
  severity:
    | "CRITICAL"
    | "HIGH"
    | "MEDIUM"
    | "LOW"
    | "critical"
    | "high"
    | "medium"
    | "low"
    | "info";
  entityType?: string | null;
  entityId?: string | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  metadata?: any;
  actions?: NotificationAction[];
}

export interface NotificationCategory {
  key: string;
  label: string;
}

export interface NotificationStats {
  unread: number;
  critical: number;
  warning: number;
  info: number;
}

export interface NotificationPreferences {
  email: Record<string, boolean>;
  inApp: Record<string, boolean>;
}

export interface NotificationsListResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
  limit: number;
}
