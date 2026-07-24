export interface UpdateProfileInput {
  name?: string;
  country?: string | null;
}

export interface UpdateAvatarInput {
  avatarUrl: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePreferencesInput {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  marketing?: boolean;
  security?: boolean;
  tender?: boolean;
  newsletter?: boolean;
}

export interface RequestChangeInput {
  field: string;
  value: string;
  reason: string;
}

export interface PageLimitQuery {
  page?: number;
  limit?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  country?: string | null;
}

export interface UserPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  security: boolean;
  tender: boolean;
  newsletter: boolean;
}

export interface ProfileActivity {
  id: string;
  action: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface UserSession {
  id: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  isCurrent: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export interface UserDevice {
  id: string;
  deviceName: string;
  deviceType: string;
  osName: string;
  browserName: string;
  lastUsedAt: string;
}

export interface ProfileTimelineEvent {
  id: string;
  event: string;
  description: string;
  createdAt: string;
}

export interface ProfileSubscriptionDetail {
  id: string;
  planName: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}
