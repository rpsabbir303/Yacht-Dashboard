import type { ID, ISODateString } from "./common";
import type { UserRole } from "./auth";
import type { CrewMember } from "./crew";
import type { Job } from "./job";

/* ===========================================================
   Roles & permissions
=========================================================== */

export type AdminRole = "super-admin" | "moderator" | "support-agent";

export type Permission =
  | "users.read"
  | "users.write"
  | "users.suspend"
  | "verifications.read"
  | "verifications.approve"
  | "moderation.read"
  | "moderation.act"
  | "disputes.read"
  | "disputes.resolve"
  | "announcements.send"
  | "analytics.read"
  | "security.read";

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  "super-admin": [
    "users.read",
    "users.write",
    "users.suspend",
    "verifications.read",
    "verifications.approve",
    "moderation.read",
    "moderation.act",
    "disputes.read",
    "disputes.resolve",
    "announcements.send",
    "analytics.read",
    "security.read",
  ],
  moderator: [
    "users.read",
    "users.suspend",
    "verifications.read",
    "verifications.approve",
    "moderation.read",
    "moderation.act",
    "disputes.read",
  ],
  "support-agent": [
    "users.read",
    "disputes.read",
    "disputes.resolve",
    "announcements.send",
  ],
};

export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  "super-admin": "Super Admin",
  moderator: "Moderator",
  "support-agent": "Support Agent",
};

/* ===========================================================
   Verifications
=========================================================== */

export type VerificationStatus =
  | "pending"
  | "in-review"
  | "approved"
  | "rejected"
  | "additional-info";

export type VerificationSubjectType = "crew" | "owner" | "agent";

export interface VerificationDocument {
  id: ID;
  name: string;
  kind:
    | "passport"
    | "id-card"
    | "license"
    | "certification"
    | "company-registration"
    | "tax-document"
    | "yacht-registration";
  url: string;
  thumbUrl?: string;
  uploadedAt: ISODateString;
}

export interface VerificationRequest {
  id: ID;
  subjectType: VerificationSubjectType;
  subject: {
    id: ID;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    location?: string;
  };
  status: VerificationStatus;
  submittedAt: ISODateString;
  updatedAt: ISODateString;
  documents: VerificationDocument[];
  riskScore?: number; // 0–100
  notes?: string;
  reviewedBy?: { id: ID; name: string };
}

/* ===========================================================
   Admin user view (extends consumer User)
=========================================================== */

export type AdminAccountStatus =
  | "active"
  | "warned"
  | "suspended"
  | "banned"
  | "pending-verification";

export interface AdminUserSummary {
  id: ID;
  fullName: string;
  email: string;
  role: UserRole;
  adminRole?: AdminRole;
  avatarUrl?: string;
  status: AdminAccountStatus;
  verified: boolean;
  joinedAt: ISODateString;
  lastActiveAt?: ISODateString;
  jobsPosted?: number;
  applicationsSubmitted?: number;
  reportsAgainst?: number;
  country?: string;
}

export type ActivityLogKind =
  | "login"
  | "logout"
  | "profile-update"
  | "job-post"
  | "job-update"
  | "application"
  | "message"
  | "verification"
  | "admin-action"
  | "security";

export interface ActivityLogEntry {
  id: ID;
  userId: ID;
  kind: ActivityLogKind;
  title: string;
  description?: string;
  ip?: string;
  device?: string;
  createdAt: ISODateString;
}

/* ===========================================================
   Content moderation
=========================================================== */

export type ReportReason =
  | "fake-listing"
  | "spam"
  | "scam"
  | "duplicate"
  | "inappropriate"
  | "off-platform"
  | "other";

export type ReportSeverity = "low" | "medium" | "high" | "critical";

export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";

export interface JobReport {
  id: ID;
  job: Pick<Job, "id" | "title" | "yacht"> & {
    postedById: ID;
    postedByName: string;
  };
  reportedBy: { id: ID; name: string; avatarUrl?: string };
  reason: ReportReason;
  severity: ReportSeverity;
  status: ReportStatus;
  description: string;
  reportsCount: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type FraudSignalKind =
  | "duplicate-listing"
  | "price-anomaly"
  | "suspicious-account"
  | "rapid-actions"
  | "blacklisted-keyword"
  | "off-platform-contact"
  | "geo-mismatch";

export type FraudSignalSeverity = "low" | "medium" | "high";

export interface FraudSignal {
  id: ID;
  kind: FraudSignalKind;
  severity: FraudSignalSeverity;
  title: string;
  summary: string;
  subjectType: "user" | "job" | "message";
  subject: { id: ID; label: string };
  detectedAt: ISODateString;
  acknowledged: boolean;
}

/* ===========================================================
   Disputes
=========================================================== */

export type DisputeStatus = "open" | "under-review" | "resolved" | "rejected";

export type DisputeKind =
  | "payment"
  | "contract"
  | "no-show"
  | "misconduct"
  | "false-advertising"
  | "other";

export interface DisputeMessage {
  id: ID;
  authorId: ID;
  authorName: string;
  text: string;
  createdAt: ISODateString;
}

export interface Dispute {
  id: ID;
  reference: string; // e.g. DSP-2025-00231
  kind: DisputeKind;
  status: DisputeStatus;
  amount?: { value: number; currency: "EUR" | "USD" | "GBP" };
  openedBy: { id: ID; name: string; avatarUrl?: string; role: UserRole };
  against: { id: ID; name: string; avatarUrl?: string; role: UserRole };
  jobId?: ID;
  jobTitle?: string;
  summary: string;
  conversation: DisputeMessage[];
  openedAt: ISODateString;
  updatedAt: ISODateString;
  resolution?: {
    decision: "refund" | "partial-refund" | "no-action" | "warning" | "suspension";
    note: string;
    by: { id: ID; name: string };
    at: ISODateString;
  };
}

/* ===========================================================
   Announcements
=========================================================== */

export type AnnouncementAudience =
  | "all"
  | "crew"
  | "owners-captains"
  | "agents";

export type AnnouncementChannel = "in-app" | "email" | "push";

export type AnnouncementStatus = "draft" | "scheduled" | "sent";

export interface Announcement {
  id: ID;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  channels: AnnouncementChannel[];
  status: AnnouncementStatus;
  scheduledFor?: ISODateString;
  sentAt?: ISODateString;
  createdAt: ISODateString;
  createdBy: { id: ID; name: string };
  deliveredCount?: number;
  openRate?: number; // 0–1
}

/* ===========================================================
   Analytics
=========================================================== */

export interface AnalyticsSnapshot {
  users: {
    total: number;
    active30d: number;
    newThisWeek: number;
    verificationRate: number; // 0–1
    byRole: { role: UserRole; count: number }[];
    growth: { d: string; users: number }[];
  };
  jobs: {
    active: number;
    filled: number;
    expired: number;
    avgTimeToFillDays: number;
    funnel: { stage: string; value: number }[];
  };
  engagement: {
    applicationsSubmitted: number;
    messagesSent: number;
    dailyActivity: { d: string; sessions: number; messages: number }[];
  };
}

/* ===========================================================
   Security
=========================================================== */

export type SecurityEventKind =
  | "login-success"
  | "login-failed"
  | "password-reset"
  | "mfa-enabled"
  | "mfa-disabled"
  | "suspicious-login"
  | "session-revoked";

export interface SecurityEvent {
  id: ID;
  kind: SecurityEventKind;
  user: { id: ID; name: string; email: string; avatarUrl?: string };
  ip: string;
  device: string;
  country?: string;
  risk: "low" | "medium" | "high";
  createdAt: ISODateString;
}

export interface AdminAuditEntry {
  id: ID;
  admin: { id: ID; name: string; role: AdminRole };
  action: string;
  target?: { type: string; id: ID; label: string };
  createdAt: ISODateString;
}

export interface ActiveSession {
  id: ID;
  user: { id: ID; name: string; email: string; avatarUrl?: string };
  ip: string;
  device: string;
  country?: string;
  startedAt: ISODateString;
  lastSeenAt: ISODateString;
}

/* ===========================================================
   Global search
=========================================================== */

export type SearchResultKind = "user" | "job" | "report" | "dispute";

export interface SearchResult {
  id: ID;
  kind: SearchResultKind;
  title: string;
  subtitle?: string;
  href: string;
  meta?: string;
}

export interface SearchResponse {
  results: SearchResult[];
}

/* ===========================================================
   Helper data shapes
=========================================================== */

export interface PaginatedAdminQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CrewVerificationSummary extends Pick<CrewMember, "id" | "fullName" | "position"> {
  status: VerificationStatus;
}
