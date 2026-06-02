import type { ID, ISODateString } from "./common";
import type { UserRole } from "./auth";
import type { CrewPosition } from "./job";

/* ===========================================================
   Roles & permissions
=========================================================== */

export type AdminRole = "super-admin" | "moderator" | "support-agent";

/**
 * Practical, yacht-hiring-focused permission union.
 *
 * Scoped to crew, owners, jobs, applications, analytics, announcements and
 * platform settings.
 */
export type Permission =
  | "crew.read"
  | "crew.write"
  | "owners.read"
  | "owners.write"
  | "verifications.read"
  | "verifications.approve"
  | "jobs.read"
  | "jobs.write"
  | "applications.read"
  | "applications.write"
  | "announcements.send"
  | "analytics.read"
  | "settings.write"
  | "support.read"
  | "support.write";

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  "super-admin": [
    "crew.read",
    "crew.write",
    "owners.read",
    "owners.write",
    "verifications.read",
    "verifications.approve",
    "jobs.read",
    "jobs.write",
    "applications.read",
    "applications.write",
    "announcements.send",
    "analytics.read",
    "settings.write",
    "support.read",
    "support.write",
  ],
  moderator: [
    "crew.read",
    "crew.write",
    "owners.read",
    "owners.write",
    "verifications.read",
    "verifications.approve",
    "jobs.read",
    "jobs.write",
    "applications.read",
    "analytics.read",
    "announcements.send",
    "support.read",
    "support.write",
  ],
  "support-agent": [
    "crew.read",
    "owners.read",
    "jobs.read",
    "applications.read",
    "announcements.send",
    "support.read",
    "support.write",
  ],
};

export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  "super-admin": "Super Admin",
  moderator: "Moderator",
  "support-agent": "Support Agent",
};

/* ===========================================================
   Account & verification
=========================================================== */

export type AdminAccountStatus =
  | "active"
  | "suspended"
  | "banned"
  | "pending-verification";

export type VerificationStatus =
  | "pending"
  | "in-review"
  | "approved"
  | "rejected"
  | "additional-info";

export type VerificationDocumentKind =
  | "passport"
  | "visa"
  | "id-card"
  | "certification"
  | "reference"
  | "business-registration"
  | "vessel-registration"
  | "insurance"
  | "tax-id";

export interface VerificationDocument {
  id: ID;
  name: string;
  kind: VerificationDocumentKind;
  url: string;
  thumbUrl?: string;
  status: "pending" | "verified" | "rejected";
  uploadedAt: ISODateString;
}

/* ===========================================================
   Crew profiles
=========================================================== */

export type CrewAvailability = "available" | "on-contract" | "unavailable";

export interface CrewExperienceEntry {
  yacht: string;
  yachtType: "motor" | "sail";
  length: number;
  role: string;
  from: ISODateString;
  to?: ISODateString;
}

export interface CrewReference {
  id: ID;
  name: string;
  role: string;
  vessel: string;
  contact: string;
  verified: boolean;
}

export interface CrewCertification {
  id: ID;
  name: string;
  issuer: string;
  validUntil?: ISODateString;
  verified: boolean;
}

export interface CrewProfile {
  id: ID;
  fullName: string;
  email: string;
  avatarUrl?: string;
  position: CrewPosition;
  nationality: string;
  countryCode: string;
  location?: string;
  status: AdminAccountStatus;
  verificationStatus: VerificationStatus;
  joinedAt: ISODateString;
  lastActiveAt?: ISODateString;
  bio?: string;
  passport: { number: string; country: string; expiresAt: ISODateString };
  visas: { country: string; expiresAt: ISODateString; type: string }[];
  languages: string[];
  yearsExperience: number;
  experience: CrewExperienceEntry[];
  certifications: CrewCertification[];
  references: CrewReference[];
  documents: VerificationDocument[];
  availability: CrewAvailability;
  availableFrom?: ISODateString;
  /** 0–100. Drives the completion ring on the profile page. */
  profileCompletion: number;
  applicationsCount: number;
  hiresCount: number;
  rating?: number;
}

/* ===========================================================
   Owner profiles
=========================================================== */

export interface OwnerVessel {
  id: ID;
  name: string;
  type: "motor" | "sail";
  length: number;
  flag: string;
  yearBuilt?: number;
  imageUrl?: string;
}

export interface OwnerProfile {
  id: ID;
  fullName: string;
  email: string;
  avatarUrl?: string;
  companyName?: string;
  vatNumber?: string;
  country: string;
  countryCode: string;
  status: AdminAccountStatus;
  verificationStatus: VerificationStatus;
  joinedAt: ISODateString;
  lastActiveAt?: ISODateString;
  vessels: OwnerVessel[];
  documents: VerificationDocument[];
  jobsPostedCount: number;
  hiresMadeCount: number;
  /** 0–100. */
  profileCompletion: number;
  notes?: string;
}

/* ===========================================================
   Applications
=========================================================== */

export type ApplicationStatus =
  | "pending"
  | "shortlisted"
  | "interviewing"
  | "accepted"
  | "rejected";

export interface ApplicationSummary {
  id: ID;
  candidate: {
    id: ID;
    fullName: string;
    avatarUrl?: string;
    position: CrewPosition;
    nationality: string;
    yearsExperience: number;
  };
  job: {
    id: ID;
    title: string;
    yacht: string;
    location: string;
  };
  owner: {
    id: ID;
    name: string;
    avatarUrl?: string;
  };
  status: ApplicationStatus;
  matchScore?: number; // 0–100, optional
  appliedAt: ISODateString;
  updatedAt: ISODateString;
  coverLetter?: string;
}

/* ===========================================================
   Job stats (admin-side rollup of a job's pipeline)
=========================================================== */

export interface JobApplicationStats {
  total: number;
  pending: number;
  shortlisted: number;
  interviewing: number;
  accepted: number;
  rejected: number;
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
    crew: number;
    owners: number;
    active30d: number;
    newThisWeek: number;
    verificationRate: number; // 0–1
    byRole: { role: UserRole; count: number }[];
    growth: { d: string; users: number }[];
  };
  jobs: {
    active: number;
  };
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  engagement: {
    dailyActivity: { d: string; sessions: number; applications: number }[];
  };
}

/* ===========================================================
   Helpers
=========================================================== */

export interface PaginatedAdminQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}
