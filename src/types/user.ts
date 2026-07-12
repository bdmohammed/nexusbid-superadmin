export enum UserStatus {
  PENDING_EMAIL_VERIFICATION = "pending_email_verification",
  PENDING_APPROVAL = "pending_approval",
  ACTIVE = "active",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
  DEACTIVATED = "deactivated",
  ARCHIVED = "archived",
}

export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  country: string | null;
  role: "customer" | "admin";
  status: UserStatus;
  adminRole: "super_admin" | "manager" | "viewer" | null;
  emailVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}
