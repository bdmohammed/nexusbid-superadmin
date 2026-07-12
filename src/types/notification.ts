export interface NotificationAction {
  id: string;
  label: string;
  type: string;
  payload?: any;
  permission?: string;
  btnOrder: number;
}

export interface Notification {
  id: string;
  recipientId: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED' | 'DISMISSED';
  readAt: string | null;
  createdAt: string;
  title: string;
  message: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
  actions?: NotificationAction[];
}

export interface NotificationStats {
  unread: number;
  critical: number;
  warning: number;
  info: number;
}

export interface NotificationCategory {
  key: string;
  label: string;
}
