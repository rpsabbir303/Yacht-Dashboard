/**
 * In-memory fixtures for the admin module.
 *
 * Kept separate from `mockData.ts` so consumer-facing fixtures and
 * admin-only fixtures can evolve independently.
 */
import type {
  ActivityLogEntry,
  AdminAuditEntry,
  AdminUserSummary,
  Announcement,
  ActiveSession,
  AnalyticsSnapshot,
  Dispute,
  FraudSignal,
  JobReport,
  SecurityEvent,
  VerificationRequest,
} from "@/types";

const now = new Date();
const iso = (offsetDays = 0, offsetHours = 0): string => {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(d.getHours() + offsetHours);
  return d.toISOString();
};

/* ----------------------------------------------------------------------
   VERIFICATION REQUESTS
---------------------------------------------------------------------- */

export const mockVerifications: VerificationRequest[] = [
  {
    id: "v_001",
    subjectType: "crew",
    subject: {
      id: "crew_7",
      name: "Liam Thompson",
      email: "liam@yachtmail.io",
      role: "captain",
      avatarUrl:
        "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=facearea&w=200&h=200&q=80",
      location: "Antibes, France",
    },
    status: "pending",
    submittedAt: iso(-2, -3),
    updatedAt: iso(-2, -3),
    riskScore: 18,
    documents: [
      {
        id: "d1",
        name: "Passport scan",
        kind: "passport",
        url: "https://images.unsplash.com/photo-1568633574956-c6566b4f5a09?auto=format&fit=crop&w=900&q=70",
        uploadedAt: iso(-2, -4),
      },
      {
        id: "d2",
        name: "Yachtmaster Ocean",
        kind: "certification",
        url: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=900&q=70",
        uploadedAt: iso(-2, -4),
      },
    ],
  },
  {
    id: "v_002",
    subjectType: "owner",
    subject: {
      id: "u_002",
      name: "Nora Castellan",
      email: "n.castellan@blueyacht.com",
      role: "owner",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&w=200&h=200&q=80",
      location: "Monaco",
    },
    status: "in-review",
    submittedAt: iso(-4),
    updatedAt: iso(-1),
    riskScore: 62,
    documents: [
      {
        id: "d3",
        name: "Company registration",
        kind: "company-registration",
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=70",
        uploadedAt: iso(-4),
      },
      {
        id: "d4",
        name: "M/Y Saltire — registration",
        kind: "yacht-registration",
        url: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=900&q=70",
        uploadedAt: iso(-4),
      },
    ],
    reviewedBy: { id: "u_owner_1", name: "Alex Marlowe" },
  },
  {
    id: "v_003",
    subjectType: "agent",
    subject: {
      id: "u_003",
      name: "Pavel Drago",
      email: "pavel@dragocrew.com",
      role: "agent",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=200&h=200&q=80",
      location: "Split, Croatia",
    },
    status: "additional-info",
    submittedAt: iso(-7),
    updatedAt: iso(-3),
    riskScore: 41,
    documents: [
      {
        id: "d5",
        name: "Tax document",
        kind: "tax-document",
        url: "https://images.unsplash.com/photo-1554224154-26032cdc0c11?auto=format&fit=crop&w=900&q=70",
        uploadedAt: iso(-7),
      },
    ],
    notes: "Please upload a clearer copy of your VAT certificate.",
  },
  {
    id: "v_004",
    subjectType: "crew",
    subject: {
      id: "crew_8",
      name: "Élodie Brun",
      email: "elodie@yachtmail.io",
      role: "captain",
      avatarUrl:
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=facearea&w=200&h=200&q=80",
      location: "Palma de Mallorca, Spain",
    },
    status: "approved",
    submittedAt: iso(-14),
    updatedAt: iso(-12),
    riskScore: 9,
    documents: [],
    reviewedBy: { id: "u_owner_1", name: "Alex Marlowe" },
  },
  {
    id: "v_005",
    subjectType: "crew",
    subject: {
      id: "crew_9",
      name: "Mateo Ríos",
      email: "mateo@yachtmail.io",
      role: "captain",
      avatarUrl:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=facearea&w=200&h=200&q=80",
      location: "Barcelona, Spain",
    },
    status: "rejected",
    submittedAt: iso(-21),
    updatedAt: iso(-18),
    riskScore: 88,
    documents: [],
    notes: "Document tampering detected on uploaded passport.",
  },
];

/* ----------------------------------------------------------------------
   ADMIN USER VIEW
---------------------------------------------------------------------- */

export const mockAdminUsers: AdminUserSummary[] = [
  {
    id: "u_owner_1",
    fullName: "Alex Marlowe",
    email: "alex@meridian-yachts.com",
    role: "owner",
    adminRole: "super-admin",
    avatarUrl:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=facearea&w=200&h=200&q=80",
    status: "active",
    verified: true,
    joinedAt: iso(-180),
    lastActiveAt: iso(0, -1),
    jobsPosted: 12,
    reportsAgainst: 0,
    country: "France",
  },
  {
    id: "u_002",
    fullName: "Nora Castellan",
    email: "n.castellan@blueyacht.com",
    role: "owner",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&w=200&h=200&q=80",
    status: "pending-verification",
    verified: false,
    joinedAt: iso(-32),
    lastActiveAt: iso(-1),
    jobsPosted: 3,
    reportsAgainst: 0,
    country: "Monaco",
  },
  {
    id: "u_003",
    fullName: "Pavel Drago",
    email: "pavel@dragocrew.com",
    role: "agent",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=200&h=200&q=80",
    status: "warned",
    verified: false,
    joinedAt: iso(-95),
    lastActiveAt: iso(-2),
    jobsPosted: 28,
    reportsAgainst: 1,
    country: "Croatia",
  },
  {
    id: "crew_1",
    fullName: "Sophia Laurent",
    email: "sophia.l@yachtmail.io",
    role: "captain",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=200&h=200&q=80",
    status: "active",
    verified: true,
    joinedAt: iso(-220),
    lastActiveAt: iso(0, -2),
    applicationsSubmitted: 14,
    reportsAgainst: 0,
    country: "France",
  },
  {
    id: "crew_2",
    fullName: "James O'Connor",
    email: "james.o@yachtmail.io",
    role: "captain",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=200&h=200&q=80",
    status: "active",
    verified: true,
    joinedAt: iso(-410),
    lastActiveAt: iso(-1),
    applicationsSubmitted: 28,
    reportsAgainst: 0,
    country: "Ireland",
  },
  {
    id: "u_susp_1",
    fullName: "Karim Wallach",
    email: "kw@example.com",
    role: "owner",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=200&h=200&q=80",
    status: "suspended",
    verified: false,
    joinedAt: iso(-60),
    lastActiveAt: iso(-20),
    jobsPosted: 2,
    reportsAgainst: 6,
    country: "Lebanon",
  },
  {
    id: "u_ban_1",
    fullName: "Devon Mure",
    email: "devon.m@example.com",
    role: "agent",
    avatarUrl: undefined,
    status: "banned",
    verified: false,
    joinedAt: iso(-30),
    lastActiveAt: iso(-25),
    jobsPosted: 0,
    reportsAgainst: 9,
    country: "Unknown",
  },
];

/* ----------------------------------------------------------------------
   ACTIVITY LOGS  (keyed by userId — empty array fallback for unknowns)
---------------------------------------------------------------------- */

export const mockActivityLogs: Record<string, ActivityLogEntry[]> = {
  u_owner_1: [
    {
      id: "al_1",
      userId: "u_owner_1",
      kind: "login",
      title: "Signed in",
      description: "Web · Chrome on macOS",
      ip: "82.65.220.18",
      device: "Chrome / macOS",
      createdAt: iso(0, -1),
    },
    {
      id: "al_2",
      userId: "u_owner_1",
      kind: "job-post",
      title: "Posted job",
      description: "Chief Stewardess — M/Y Aurora Borealis",
      createdAt: iso(-12),
    },
    {
      id: "al_3",
      userId: "u_owner_1",
      kind: "verification",
      title: "Verified profile",
      createdAt: iso(-179),
    },
  ],
  u_002: [
    {
      id: "al_4",
      userId: "u_002",
      kind: "login",
      title: "Signed in",
      ip: "188.43.18.4",
      device: "Safari / iOS",
      createdAt: iso(-1),
    },
    {
      id: "al_5",
      userId: "u_002",
      kind: "profile-update",
      title: "Updated company profile",
      createdAt: iso(-2),
    },
    {
      id: "al_6",
      userId: "u_002",
      kind: "verification",
      title: "Submitted verification documents",
      createdAt: iso(-4),
    },
  ],
  u_003: [
    {
      id: "al_7",
      userId: "u_003",
      kind: "admin-action",
      title: "Warning issued",
      description: "Reason: off-platform contact attempt",
      createdAt: iso(-2),
    },
    {
      id: "al_8",
      userId: "u_003",
      kind: "message",
      title: "Sent 12 messages",
      createdAt: iso(-3),
    },
  ],
};

/* ----------------------------------------------------------------------
   JOB REPORTS
---------------------------------------------------------------------- */

export const mockJobReports: JobReport[] = [
  {
    id: "r_001",
    job: {
      id: "job_42",
      title: "Senior Stewardess — M/Y Aurora",
      yacht: {
        name: "M/Y Aurora",
        length: 64,
        type: "motor",
      },
      postedById: "u_susp_1",
      postedByName: "Karim Wallach",
    },
    reportedBy: {
      id: "crew_1",
      name: "Sophia Laurent",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=200&h=200&q=80",
    },
    reason: "fake-listing",
    severity: "high",
    status: "open",
    description:
      "Job description matches a deleted listing from another agency. Salary band is below market and the contact person asked to move conversation to WhatsApp.",
    reportsCount: 5,
    createdAt: iso(-1, -3),
    updatedAt: iso(0, -2),
  },
  {
    id: "r_002",
    job: {
      id: "job_55",
      title: "Deckhand — Caribbean delivery",
      yacht: {
        name: "M/Y Mistral",
        length: 38,
        type: "motor",
      },
      postedById: "u_ban_1",
      postedByName: "Devon Mure",
    },
    reportedBy: {
      id: "crew_3",
      name: "Marco Bianchi",
      avatarUrl:
        "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=facearea&w=200&h=200&q=80",
    },
    reason: "scam",
    severity: "critical",
    status: "investigating",
    description:
      "Asked for an upfront payment to secure the position. Multiple crew reported the same pattern.",
    reportsCount: 11,
    createdAt: iso(-3),
    updatedAt: iso(-1),
  },
  {
    id: "r_003",
    job: {
      id: "job_60",
      title: "Chef — Med season",
      yacht: {
        name: "S/Y Equinox",
        length: 48,
        type: "sail",
      },
      postedById: "u_003",
      postedByName: "Pavel Drago",
    },
    reportedBy: {
      id: "crew_2",
      name: "James O'Connor",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=200&h=200&q=80",
    },
    reason: "duplicate",
    severity: "low",
    status: "open",
    description: "Duplicate of an existing listing posted 3 days ago.",
    reportsCount: 1,
    createdAt: iso(-5),
    updatedAt: iso(-5),
  },
  {
    id: "r_004",
    job: {
      id: "job_61",
      title: "Stewardess — Permanent",
      yacht: {
        name: "M/Y Calypso",
        length: 58,
        type: "motor",
      },
      postedById: "u_002",
      postedByName: "Nora Castellan",
    },
    reportedBy: {
      id: "crew_4",
      name: "Hannah Pierce",
    },
    reason: "off-platform",
    severity: "medium",
    status: "resolved",
    description: "Reporter said they were asked to share their phone number to schedule an interview.",
    reportsCount: 2,
    createdAt: iso(-10),
    updatedAt: iso(-8),
  },
];

/* ----------------------------------------------------------------------
   FRAUD SIGNALS
---------------------------------------------------------------------- */

export const mockFraudSignals: FraudSignal[] = [
  {
    id: "f_001",
    kind: "duplicate-listing",
    severity: "high",
    title: "5 near-identical job listings",
    summary:
      "Same job description copy-pasted across 5 listings posted within 48 hours.",
    subjectType: "user",
    subject: { id: "u_susp_1", label: "Karim Wallach" },
    detectedAt: iso(-1),
    acknowledged: false,
  },
  {
    id: "f_002",
    kind: "off-platform-contact",
    severity: "high",
    title: "Off-platform contact requested",
    summary:
      "User asked applicants to continue conversation via WhatsApp on 3 separate threads.",
    subjectType: "user",
    subject: { id: "u_ban_1", label: "Devon Mure" },
    detectedAt: iso(-2),
    acknowledged: false,
  },
  {
    id: "f_003",
    kind: "price-anomaly",
    severity: "medium",
    title: "Salary below market median",
    summary:
      "Listed monthly salary is 42% below the median for the position and yacht size.",
    subjectType: "job",
    subject: { id: "job_42", label: "Senior Stewardess — M/Y Aurora" },
    detectedAt: iso(-3),
    acknowledged: true,
  },
  {
    id: "f_004",
    kind: "rapid-actions",
    severity: "low",
    title: "Bulk messaging detected",
    summary:
      "Sent 142 messages within 12 minutes across 38 different recipients.",
    subjectType: "user",
    subject: { id: "u_003", label: "Pavel Drago" },
    detectedAt: iso(-4),
    acknowledged: true,
  },
  {
    id: "f_005",
    kind: "geo-mismatch",
    severity: "medium",
    title: "IP location mismatch",
    summary: "Recent logins from 3 different countries within 6 hours.",
    subjectType: "user",
    subject: { id: "u_susp_1", label: "Karim Wallach" },
    detectedAt: iso(-5),
    acknowledged: false,
  },
];

/* ----------------------------------------------------------------------
   DISPUTES
---------------------------------------------------------------------- */

export const mockDisputes: Dispute[] = [
  {
    id: "d_001",
    reference: "DSP-2025-00231",
    kind: "payment",
    status: "open",
    amount: { value: 4800, currency: "EUR" },
    openedBy: {
      id: "crew_1",
      name: "Sophia Laurent",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=200&h=200&q=80",
      role: "captain",
    },
    against: {
      id: "u_susp_1",
      name: "Karim Wallach",
      role: "owner",
    },
    jobId: "job_42",
    jobTitle: "Senior Stewardess — M/Y Aurora",
    summary:
      "Final week of contract was unpaid despite signed extension. Owner stopped responding to messages.",
    openedAt: iso(-2),
    updatedAt: iso(-1),
    conversation: [
      {
        id: "dm_1",
        authorId: "crew_1",
        authorName: "Sophia Laurent",
        text: "Final week was not paid. Signed extension was for €4,800.",
        createdAt: iso(-2),
      },
      {
        id: "dm_2",
        authorId: "u_susp_1",
        authorName: "Karim Wallach",
        text: "I will get back to you about this next week.",
        createdAt: iso(-2, 2),
      },
    ],
  },
  {
    id: "d_002",
    reference: "DSP-2025-00227",
    kind: "no-show",
    status: "under-review",
    openedBy: {
      id: "u_002",
      name: "Nora Castellan",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&w=200&h=200&q=80",
      role: "owner",
    },
    against: { id: "crew_5", name: "Dimitri Volkov", role: "captain" },
    jobId: "job_55",
    jobTitle: "Chief Engineer — M/Y Saltire",
    summary:
      "Crew accepted the position but did not show up on joining day. No communication for 5 days.",
    openedAt: iso(-6),
    updatedAt: iso(-2),
    conversation: [
      {
        id: "dm_3",
        authorId: "u_002",
        authorName: "Nora Castellan",
        text: "Crew accepted but didn't show up. We've had to delay the trip.",
        createdAt: iso(-6),
      },
    ],
  },
  {
    id: "d_003",
    reference: "DSP-2025-00220",
    kind: "false-advertising",
    status: "resolved",
    openedBy: { id: "crew_4", name: "Hannah Pierce", role: "captain" },
    against: { id: "u_003", name: "Pavel Drago", role: "agent" },
    jobId: "job_60",
    jobTitle: "Chef — Med season",
    summary:
      "Yacht length and crew size were misrepresented in the listing. Conditions on arrival were significantly different.",
    openedAt: iso(-14),
    updatedAt: iso(-10),
    conversation: [
      {
        id: "dm_4",
        authorId: "crew_4",
        authorName: "Hannah Pierce",
        text: "Listed as 60m with 8 crew. Actual yacht is 38m with 4 crew.",
        createdAt: iso(-14),
      },
    ],
    resolution: {
      decision: "warning",
      note: "Issued warning to agent. Listing has been updated and re-published.",
      by: { id: "u_owner_1", name: "Alex Marlowe" },
      at: iso(-10),
    },
  },
  {
    id: "d_004",
    reference: "DSP-2025-00218",
    kind: "contract",
    status: "rejected",
    openedBy: { id: "crew_6", name: "Isabella Costa", role: "captain" },
    against: { id: "u_002", name: "Nora Castellan", role: "owner" },
    summary:
      "Crew claimed contract was breached but did not provide signed contract evidence.",
    openedAt: iso(-25),
    updatedAt: iso(-20),
    conversation: [],
    resolution: {
      decision: "no-action",
      note: "Insufficient evidence — no signed contract on file.",
      by: { id: "u_owner_1", name: "Alex Marlowe" },
      at: iso(-20),
    },
  },
];

/* ----------------------------------------------------------------------
   ANNOUNCEMENTS
---------------------------------------------------------------------- */

export const mockAnnouncements: Announcement[] = [
  {
    id: "a_001",
    title: "Med season — new safety guidelines",
    body: "Updated MCA guidelines are now in effect for the Med season. Please review your safety documents before departing.",
    audience: "all",
    channels: ["in-app", "email"],
    status: "sent",
    sentAt: iso(-2),
    createdAt: iso(-2),
    createdBy: { id: "u_owner_1", name: "Alex Marlowe" },
    deliveredCount: 8421,
    openRate: 0.62,
  },
  {
    id: "a_002",
    title: "New verification requirements for owners",
    body: "From May 30th, yacht owners will need to provide proof of ownership before posting jobs.",
    audience: "owners-captains",
    channels: ["in-app", "email", "push"],
    status: "scheduled",
    scheduledFor: iso(3, 10),
    createdAt: iso(0, -3),
    createdBy: { id: "u_owner_1", name: "Alex Marlowe" },
  },
  {
    id: "a_003",
    title: "Crew profile bonus visibility — 24h sale",
    body: "Crew with complete profiles get top placement in search for the next 24 hours.",
    audience: "crew",
    channels: ["in-app", "push"],
    status: "draft",
    createdAt: iso(0, -1),
    createdBy: { id: "u_owner_1", name: "Alex Marlowe" },
  },
];

/* ----------------------------------------------------------------------
   ANALYTICS
---------------------------------------------------------------------- */

export const mockAnalytics: AnalyticsSnapshot = {
  users: {
    total: 8742,
    active30d: 5183,
    newThisWeek: 184,
    verificationRate: 0.74,
    byRole: [
      { role: "captain", count: 4920 },
      { role: "owner", count: 2150 },
      { role: "agent", count: 1240 },
      { role: "admin", count: 432 },
    ],
    growth: [
      { d: "Wk 1", users: 7820 },
      { d: "Wk 2", users: 8014 },
      { d: "Wk 3", users: 8210 },
      { d: "Wk 4", users: 8388 },
      { d: "Wk 5", users: 8530 },
      { d: "Wk 6", users: 8615 },
      { d: "Wk 7", users: 8742 },
    ],
  },
  jobs: {
    active: 412,
    filled: 198,
    expired: 67,
    avgTimeToFillDays: 9.4,
    funnel: [
      { stage: "Posted", value: 612 },
      { stage: "Viewed", value: 5430 },
      { stage: "Applied", value: 2104 },
      { stage: "Shortlisted", value: 612 },
      { stage: "Interviewed", value: 288 },
      { stage: "Hired", value: 198 },
    ],
  },
  engagement: {
    applicationsSubmitted: 2104,
    messagesSent: 14820,
    dailyActivity: [
      { d: "Mon", sessions: 1820, messages: 1920 },
      { d: "Tue", sessions: 2014, messages: 2210 },
      { d: "Wed", sessions: 2330, messages: 2580 },
      { d: "Thu", sessions: 2210, messages: 2310 },
      { d: "Fri", sessions: 2540, messages: 2790 },
      { d: "Sat", sessions: 1980, messages: 1640 },
      { d: "Sun", sessions: 1720, messages: 1370 },
    ],
  },
};

/* ----------------------------------------------------------------------
   SECURITY
---------------------------------------------------------------------- */

export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "se_1",
    kind: "login-failed",
    user: {
      id: "u_susp_1",
      name: "Karim Wallach",
      email: "kw@example.com",
    },
    ip: "5.62.144.18",
    device: "Chrome / Windows",
    country: "Lebanon",
    risk: "high",
    createdAt: iso(0, -1),
  },
  {
    id: "se_2",
    kind: "suspicious-login",
    user: {
      id: "u_003",
      name: "Pavel Drago",
      email: "pavel@dragocrew.com",
    },
    ip: "104.28.4.21",
    device: "Safari / iOS",
    country: "Russia",
    risk: "high",
    createdAt: iso(0, -3),
  },
  {
    id: "se_3",
    kind: "login-success",
    user: {
      id: "u_owner_1",
      name: "Alex Marlowe",
      email: "alex@meridian-yachts.com",
    },
    ip: "82.65.220.18",
    device: "Chrome / macOS",
    country: "France",
    risk: "low",
    createdAt: iso(0, -2),
  },
  {
    id: "se_4",
    kind: "password-reset",
    user: {
      id: "crew_3",
      name: "Marco Bianchi",
      email: "marco.b@yachtmail.io",
    },
    ip: "151.18.230.4",
    device: "Firefox / Windows",
    country: "Italy",
    risk: "low",
    createdAt: iso(-1),
  },
  {
    id: "se_5",
    kind: "mfa-enabled",
    user: {
      id: "crew_1",
      name: "Sophia Laurent",
      email: "sophia.l@yachtmail.io",
    },
    ip: "82.65.18.4",
    device: "Chrome / macOS",
    country: "France",
    risk: "low",
    createdAt: iso(-3),
  },
  {
    id: "se_6",
    kind: "login-failed",
    user: {
      id: "u_ban_1",
      name: "Devon Mure",
      email: "devon.m@example.com",
    },
    ip: "182.118.66.230",
    device: "Headless Chrome",
    country: "Unknown",
    risk: "high",
    createdAt: iso(-1, -4),
  },
];

export const mockAuditTrail: AdminAuditEntry[] = [
  {
    id: "ad_1",
    admin: { id: "u_owner_1", name: "Alex Marlowe", role: "super-admin" },
    action: "Suspended user",
    target: { type: "user", id: "u_susp_1", label: "Karim Wallach" },
    createdAt: iso(0, -1),
  },
  {
    id: "ad_2",
    admin: { id: "u_owner_1", name: "Alex Marlowe", role: "super-admin" },
    action: "Approved verification",
    target: { type: "verification", id: "v_004", label: "Élodie Brun" },
    createdAt: iso(-2),
  },
  {
    id: "ad_3",
    admin: { id: "u_owner_1", name: "Alex Marlowe", role: "super-admin" },
    action: "Removed job listing",
    target: { type: "job", id: "job_55", label: "Deckhand — Caribbean delivery" },
    createdAt: iso(-3),
  },
  {
    id: "ad_4",
    admin: { id: "u_owner_1", name: "Alex Marlowe", role: "super-admin" },
    action: "Sent announcement",
    target: { type: "announcement", id: "a_001", label: "Med season — new safety guidelines" },
    createdAt: iso(-2),
  },
  {
    id: "ad_5",
    admin: { id: "u_owner_1", name: "Alex Marlowe", role: "super-admin" },
    action: "Issued warning",
    target: { type: "user", id: "u_003", label: "Pavel Drago" },
    createdAt: iso(-2),
  },
];

export const mockActiveSessions: ActiveSession[] = [
  {
    id: "s_1",
    user: {
      id: "u_owner_1",
      name: "Alex Marlowe",
      email: "alex@meridian-yachts.com",
    },
    ip: "82.65.220.18",
    device: "Chrome / macOS",
    country: "France",
    startedAt: iso(0, -2),
    lastSeenAt: iso(0, 0),
  },
  {
    id: "s_2",
    user: {
      id: "crew_1",
      name: "Sophia Laurent",
      email: "sophia.l@yachtmail.io",
    },
    ip: "82.65.18.4",
    device: "Chrome / macOS",
    country: "France",
    startedAt: iso(0, -4),
    lastSeenAt: iso(0, -1),
  },
  {
    id: "s_3",
    user: {
      id: "crew_2",
      name: "James O'Connor",
      email: "james.o@yachtmail.io",
    },
    ip: "188.43.18.4",
    device: "Safari / iOS",
    country: "Spain",
    startedAt: iso(0, -1),
    lastSeenAt: iso(0, 0),
  },
];
