/**
 * Admin RTK Query API.
 *
 * Self-contained slice — does not depend on or extend `baseApi`. Lives on its
 * own reducer path so the consumer-facing API stays clean and the admin
 * layer can be enabled / disabled / lazy-loaded independently.
 *
 * Replace `adminMockBaseQuery` with `fetchBaseQuery({ baseUrl })` to wire up
 * a real backend — every endpoint signature stays the same.
 */
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";

import {
  mockActiveSessions,
  mockActivityLogs,
  mockAdminUsers,
  mockAnalytics,
  mockAnnouncements,
  mockAuditTrail,
  mockDisputes,
  mockFraudSignals,
  mockJobReports,
  mockSecurityEvents,
  mockVerifications,
} from "./adminMockData";
import { mockJobs, mockUser } from "./mockData";
import type {
  ActiveSession,
  ActivityLogEntry,
  AdminAccountStatus,
  AdminAuditEntry,
  AdminUserSummary,
  AnalyticsSnapshot,
  Announcement,
  AnnouncementAudience,
  AnnouncementChannel,
  Dispute,
  DisputeStatus,
  FraudSignal,
  JobReport,
  ReportStatus,
  SearchResponse,
  SearchResult,
  SecurityEvent,
  VerificationRequest,
  VerificationStatus,
} from "@/types";

/* ---------------- helpers ---------------- */

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

/* ---------------- mutable in-memory stores ---------------- */

let verificationsDb: VerificationRequest[] = [...mockVerifications];
let usersDb: AdminUserSummary[] = [...mockAdminUsers];
let reportsDb: JobReport[] = [...mockJobReports];
let fraudDb: FraudSignal[] = [...mockFraudSignals];
let disputesDb: Dispute[] = [...mockDisputes];
let announcementsDb: Announcement[] = [...mockAnnouncements];
let sessionsDb: ActiveSession[] = [...mockActiveSessions];
let auditDb: AdminAuditEntry[] = [...mockAuditTrail];
const activityDb: Record<string, ActivityLogEntry[]> = JSON.parse(
  JSON.stringify(mockActivityLogs),
);

/* ---------------- mock base query ---------------- */

type AdminRequest =
  | { url: "/admin/verifications"; params?: { status?: VerificationStatus | "all" } }
  | { url: "/admin/verifications/byId"; params: { id: string } }
  | {
      url: "/admin/verifications/decide";
      method: "PATCH";
      body: {
        id: string;
        decision: VerificationStatus;
        note?: string;
      };
    }
  | {
      url: "/admin/users";
      params?: {
        search?: string;
        status?: AdminAccountStatus | "all";
        role?: "all" | "owner" | "captain" | "agent";
      };
    }
  | { url: "/admin/users/byId"; params: { id: string } }
  | { url: "/admin/users/activity"; params: { id: string } }
  | {
      url: "/admin/users/status";
      method: "PATCH";
      body: { id: string; status: AdminAccountStatus; reason?: string };
    }
  | {
      url: "/admin/users/verification";
      method: "DELETE";
      body: { id: string };
    }
  | { url: "/admin/reported-jobs"; params?: { status?: ReportStatus | "all" } }
  | {
      url: "/admin/reported-jobs/decide";
      method: "PATCH";
      body: {
        id: string;
        action: "remove" | "suspend" | "dismiss" | "warn";
        note?: string;
      };
    }
  | { url: "/admin/fraud-signals" }
  | {
      url: "/admin/fraud-signals/ack";
      method: "PATCH";
      body: { id: string };
    }
  | { url: "/admin/disputes"; params?: { status?: DisputeStatus | "all" } }
  | { url: "/admin/disputes/byId"; params: { id: string } }
  | {
      url: "/admin/disputes/resolve";
      method: "PATCH";
      body: {
        id: string;
        decision: "refund" | "partial-refund" | "no-action" | "warning" | "suspension";
        note: string;
      };
    }
  | {
      url: "/admin/disputes/status";
      method: "PATCH";
      body: { id: string; status: DisputeStatus };
    }
  | { url: "/admin/announcements" }
  | {
      url: "/admin/announcements";
      method: "POST";
      body: {
        title: string;
        body: string;
        audience: AnnouncementAudience;
        channels: AnnouncementChannel[];
        scheduledFor?: string;
      };
    }
  | { url: "/admin/announcements/delete"; method: "DELETE"; body: { id: string } }
  | { url: "/admin/analytics" }
  | { url: "/admin/security/events" }
  | { url: "/admin/security/audit" }
  | { url: "/admin/security/sessions" }
  | {
      url: "/admin/security/sessions/revoke";
      method: "DELETE";
      body: { id: string };
    }
  | { url: "/admin/search"; params: { q: string } };

const adminMockBaseQuery: BaseQueryFn<AdminRequest, unknown, { message: string }> = async (
  arg,
) => {
  await delay();

  try {
    switch (arg.url) {
      /* ---------- VERIFICATIONS ---------- */

      case "/admin/verifications": {
        const status = arg.params?.status;
        const data =
          !status || status === "all"
            ? verificationsDb
            : verificationsDb.filter((v) => v.status === status);
        return { data };
      }

      case "/admin/verifications/byId": {
        const found = verificationsDb.find((v) => v.id === arg.params.id);
        if (!found) return { error: { message: "Not found" } };
        return { data: found };
      }

      case "/admin/verifications/decide": {
        if (arg.method !== "PATCH") break;
        verificationsDb = verificationsDb.map((v) =>
          v.id === arg.body.id
            ? {
                ...v,
                status: arg.body.decision,
                notes: arg.body.note ?? v.notes,
                updatedAt: new Date().toISOString(),
                reviewedBy: { id: mockUser.id, name: mockUser.fullName },
              }
            : v,
        );
        auditDb = [
          {
            id: `ad_${Date.now()}`,
            admin: {
              id: mockUser.id,
              name: mockUser.fullName,
              role: mockUser.adminRole ?? "super-admin",
            },
            action: `Verification ${arg.body.decision}`,
            target: {
              type: "verification",
              id: arg.body.id,
              label:
                verificationsDb.find((v) => v.id === arg.body.id)?.subject
                  .name ?? arg.body.id,
            },
            createdAt: new Date().toISOString(),
          },
          ...auditDb,
        ];
        return { data: verificationsDb.find((v) => v.id === arg.body.id)! };
      }

      /* ---------- USERS ---------- */

      case "/admin/users": {
        const { search, status, role } = arg.params ?? {};
        const data = usersDb.filter((u) => {
          if (status && status !== "all" && u.status !== status) return false;
          if (role && role !== "all" && u.role !== role) return false;
          if (search) {
            const q = search.toLowerCase();
            return (
              u.fullName.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q)
            );
          }
          return true;
        });
        return { data };
      }

      case "/admin/users/byId": {
        const found = usersDb.find((u) => u.id === arg.params.id);
        if (!found) return { error: { message: "Not found" } };
        return { data: found };
      }

      case "/admin/users/activity": {
        return { data: activityDb[arg.params.id] ?? [] };
      }

      case "/admin/users/status": {
        if (arg.method !== "PATCH") break;
        usersDb = usersDb.map((u) =>
          u.id === arg.body.id ? { ...u, status: arg.body.status } : u,
        );
        auditDb = [
          {
            id: `ad_${Date.now()}`,
            admin: {
              id: mockUser.id,
              name: mockUser.fullName,
              role: mockUser.adminRole ?? "super-admin",
            },
            action: `Set status: ${arg.body.status}`,
            target: {
              type: "user",
              id: arg.body.id,
              label: usersDb.find((u) => u.id === arg.body.id)?.fullName ?? arg.body.id,
            },
            createdAt: new Date().toISOString(),
          },
          ...auditDb,
        ];
        return { data: usersDb.find((u) => u.id === arg.body.id)! };
      }

      case "/admin/users/verification": {
        if (arg.method !== "DELETE") break;
        usersDb = usersDb.map((u) =>
          u.id === arg.body.id ? { ...u, verified: false } : u,
        );
        return { data: usersDb.find((u) => u.id === arg.body.id)! };
      }

      /* ---------- REPORTED JOBS ---------- */

      case "/admin/reported-jobs": {
        const status = arg.params?.status;
        const data =
          !status || status === "all"
            ? reportsDb
            : reportsDb.filter((r) => r.status === status);
        return { data };
      }

      case "/admin/reported-jobs/decide": {
        if (arg.method !== "PATCH") break;
        const nextStatus: ReportStatus =
          arg.body.action === "remove" || arg.body.action === "suspend"
            ? "resolved"
            : arg.body.action === "dismiss"
              ? "dismissed"
              : "investigating";
        reportsDb = reportsDb.map((r) =>
          r.id === arg.body.id
            ? {
                ...r,
                status: nextStatus,
                updatedAt: new Date().toISOString(),
              }
            : r,
        );
        return { data: reportsDb.find((r) => r.id === arg.body.id)! };
      }

      /* ---------- FRAUD ---------- */

      case "/admin/fraud-signals":
        return { data: fraudDb };

      case "/admin/fraud-signals/ack": {
        if (arg.method !== "PATCH") break;
        fraudDb = fraudDb.map((f) =>
          f.id === arg.body.id ? { ...f, acknowledged: true } : f,
        );
        return { data: fraudDb.find((f) => f.id === arg.body.id)! };
      }

      /* ---------- DISPUTES ---------- */

      case "/admin/disputes": {
        const status = arg.params?.status;
        const data =
          !status || status === "all"
            ? disputesDb
            : disputesDb.filter((d) => d.status === status);
        return { data };
      }

      case "/admin/disputes/byId": {
        const found = disputesDb.find((d) => d.id === arg.params.id);
        if (!found) return { error: { message: "Not found" } };
        return { data: found };
      }

      case "/admin/disputes/status": {
        if (arg.method !== "PATCH") break;
        disputesDb = disputesDb.map((d) =>
          d.id === arg.body.id
            ? { ...d, status: arg.body.status, updatedAt: new Date().toISOString() }
            : d,
        );
        return { data: disputesDb.find((d) => d.id === arg.body.id)! };
      }

      case "/admin/disputes/resolve": {
        if (arg.method !== "PATCH") break;
        disputesDb = disputesDb.map((d) =>
          d.id === arg.body.id
            ? {
                ...d,
                status: "resolved" as DisputeStatus,
                updatedAt: new Date().toISOString(),
                resolution: {
                  decision: arg.body.decision,
                  note: arg.body.note,
                  by: { id: mockUser.id, name: mockUser.fullName },
                  at: new Date().toISOString(),
                },
              }
            : d,
        );
        return { data: disputesDb.find((d) => d.id === arg.body.id)! };
      }

      /* ---------- ANNOUNCEMENTS ---------- */

      case "/admin/announcements": {
        if ("method" in arg && arg.method === "POST") {
          const now = new Date().toISOString();
          const item: Announcement = {
            id: `a_${Date.now()}`,
            title: arg.body.title,
            body: arg.body.body,
            audience: arg.body.audience,
            channels: arg.body.channels,
            status: arg.body.scheduledFor ? "scheduled" : "sent",
            scheduledFor: arg.body.scheduledFor,
            sentAt: arg.body.scheduledFor ? undefined : now,
            createdAt: now,
            createdBy: { id: mockUser.id, name: mockUser.fullName },
            deliveredCount: arg.body.scheduledFor ? undefined : 4210,
            openRate: arg.body.scheduledFor ? undefined : 0.54,
          };
          announcementsDb = [item, ...announcementsDb];
          return { data: item };
        }
        return { data: announcementsDb };
      }

      case "/admin/announcements/delete": {
        if (arg.method !== "DELETE") break;
        announcementsDb = announcementsDb.filter((a) => a.id !== arg.body.id);
        return { data: { id: arg.body.id } };
      }

      /* ---------- ANALYTICS ---------- */

      case "/admin/analytics":
        return { data: mockAnalytics };

      /* ---------- SECURITY ---------- */

      case "/admin/security/events":
        return { data: mockSecurityEvents };

      case "/admin/security/audit":
        return { data: auditDb };

      case "/admin/security/sessions":
        return { data: sessionsDb };

      case "/admin/security/sessions/revoke": {
        if (arg.method !== "DELETE") break;
        sessionsDb = sessionsDb.filter((s) => s.id !== arg.body.id);
        return { data: { id: arg.body.id } };
      }

      /* ---------- GLOBAL SEARCH ---------- */

      case "/admin/search": {
        const q = arg.params.q.trim().toLowerCase();
        if (!q) return { data: { results: [] } as SearchResponse };

        const results: SearchResult[] = [];

        usersDb.forEach((u) => {
          if (
            u.fullName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
          ) {
            results.push({
              id: u.id,
              kind: "user",
              title: u.fullName,
              subtitle: u.email,
              href: `/admin/users/${u.id}`,
              meta: u.role,
            });
          }
        });

        mockJobs.forEach((j) => {
          if (
            j.title.toLowerCase().includes(q) ||
            j.yacht.name.toLowerCase().includes(q)
          ) {
            results.push({
              id: j.id,
              kind: "job",
              title: j.title,
              subtitle: j.yacht.name,
              href: `/jobs/${j.id}`,
            });
          }
        });

        reportsDb.forEach((r) => {
          if (
            r.job.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q)
          ) {
            results.push({
              id: r.id,
              kind: "report",
              title: r.job.title,
              subtitle: r.reason,
              href: "/admin/reported-jobs",
              meta: r.severity,
            });
          }
        });

        disputesDb.forEach((d) => {
          if (
            d.reference.toLowerCase().includes(q) ||
            d.summary.toLowerCase().includes(q) ||
            (d.jobTitle ?? "").toLowerCase().includes(q)
          ) {
            results.push({
              id: d.id,
              kind: "dispute",
              title: d.reference,
              subtitle: d.summary.slice(0, 64),
              href: `/admin/disputes`,
              meta: d.status,
            });
          }
        });

        return { data: { results: results.slice(0, 20) } as SearchResponse };
      }

      default:
        return {
          error: { message: `Unhandled admin route: ${(arg as { url: string }).url}` },
        };
    }
  } catch (err) {
    return {
      error: { message: err instanceof Error ? err.message : "Unknown error" },
    };
  }

  return { error: { message: "Method not implemented for route" } };
};

/* ---------------- API ---------------- */

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: adminMockBaseQuery,
  tagTypes: [
    "Verifications",
    "Verification",
    "AdminUsers",
    "AdminUser",
    "AdminUserActivity",
    "Reports",
    "Fraud",
    "Disputes",
    "Dispute",
    "Announcements",
    "Analytics",
    "Security",
    "Audit",
    "Sessions",
    "Search",
  ] as const,
  endpoints: (b) => ({
    /* --- VERIFICATIONS --- */
    listVerifications: b.query<VerificationRequest[], VerificationStatus | "all" | void>({
      query: (status) => ({
        url: "/admin/verifications",
        params: status ? { status } : undefined,
      }),
      providesTags: ["Verifications"],
    }),
    getVerification: b.query<VerificationRequest, string>({
      query: (id) => ({ url: "/admin/verifications/byId", params: { id } }),
      providesTags: (_r, _e, id) => [{ type: "Verification", id }],
    }),
    decideVerification: b.mutation<
      VerificationRequest,
      { id: string; decision: VerificationStatus; note?: string }
    >({
      query: (body) => ({
        url: "/admin/verifications/decide",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Verifications", "Audit"],
    }),

    /* --- USERS --- */
    listAdminUsers: b.query<
      AdminUserSummary[],
      {
        search?: string;
        status?: AdminAccountStatus | "all";
        role?: "all" | "owner" | "captain" | "agent";
      } | void
    >({
      query: (params) => ({ url: "/admin/users", params: params ?? undefined }),
      providesTags: ["AdminUsers"],
    }),
    getAdminUser: b.query<AdminUserSummary, string>({
      query: (id) => ({ url: "/admin/users/byId", params: { id } }),
      providesTags: (_r, _e, id) => [{ type: "AdminUser", id }],
    }),
    getAdminUserActivity: b.query<ActivityLogEntry[], string>({
      query: (id) => ({ url: "/admin/users/activity", params: { id } }),
      providesTags: (_r, _e, id) => [{ type: "AdminUserActivity", id }],
    }),
    updateAdminUserStatus: b.mutation<
      AdminUserSummary,
      { id: string; status: AdminAccountStatus; reason?: string }
    >({
      query: (body) => ({
        url: "/admin/users/status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        "AdminUsers",
        { type: "AdminUser", id: body.id },
        "Audit",
      ],
    }),
    removeAdminUserVerification: b.mutation<AdminUserSummary, string>({
      query: (id) => ({
        url: "/admin/users/verification",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (_r, _e, id) => [
        "AdminUsers",
        { type: "AdminUser", id },
      ],
    }),

    /* --- REPORTED JOBS --- */
    listJobReports: b.query<JobReport[], ReportStatus | "all" | void>({
      query: (status) => ({
        url: "/admin/reported-jobs",
        params: status ? { status } : undefined,
      }),
      providesTags: ["Reports"],
    }),
    decideJobReport: b.mutation<
      JobReport,
      {
        id: string;
        action: "remove" | "suspend" | "dismiss" | "warn";
        note?: string;
      }
    >({
      query: (body) => ({
        url: "/admin/reported-jobs/decide",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Reports"],
    }),

    /* --- FRAUD --- */
    listFraudSignals: b.query<FraudSignal[], void>({
      query: () => ({ url: "/admin/fraud-signals" }),
      providesTags: ["Fraud"],
    }),
    acknowledgeFraudSignal: b.mutation<FraudSignal, string>({
      query: (id) => ({
        url: "/admin/fraud-signals/ack",
        method: "PATCH",
        body: { id },
      }),
      invalidatesTags: ["Fraud"],
    }),

    /* --- DISPUTES --- */
    listDisputes: b.query<Dispute[], DisputeStatus | "all" | void>({
      query: (status) => ({
        url: "/admin/disputes",
        params: status ? { status } : undefined,
      }),
      providesTags: ["Disputes"],
    }),
    getDispute: b.query<Dispute, string>({
      query: (id) => ({ url: "/admin/disputes/byId", params: { id } }),
      providesTags: (_r, _e, id) => [{ type: "Dispute", id }],
    }),
    setDisputeStatus: b.mutation<Dispute, { id: string; status: DisputeStatus }>({
      query: (body) => ({
        url: "/admin/disputes/status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        "Disputes",
        { type: "Dispute", id: body.id },
      ],
    }),
    resolveDispute: b.mutation<
      Dispute,
      {
        id: string;
        decision: "refund" | "partial-refund" | "no-action" | "warning" | "suspension";
        note: string;
      }
    >({
      query: (body) => ({
        url: "/admin/disputes/resolve",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        "Disputes",
        { type: "Dispute", id: body.id },
        "Audit",
      ],
    }),

    /* --- ANNOUNCEMENTS --- */
    listAnnouncements: b.query<Announcement[], void>({
      query: () => ({ url: "/admin/announcements" }),
      providesTags: ["Announcements"],
    }),
    sendAnnouncement: b.mutation<
      Announcement,
      {
        title: string;
        body: string;
        audience: AnnouncementAudience;
        channels: AnnouncementChannel[];
        scheduledFor?: string;
      }
    >({
      query: (body) => ({
        url: "/admin/announcements",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Announcements", "Audit"],
    }),
    deleteAnnouncement: b.mutation<{ id: string }, string>({
      query: (id) => ({
        url: "/admin/announcements/delete",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Announcements"],
    }),

    /* --- ANALYTICS --- */
    getAnalytics: b.query<AnalyticsSnapshot, void>({
      query: () => ({ url: "/admin/analytics" }),
      providesTags: ["Analytics"],
    }),

    /* --- SECURITY --- */
    listSecurityEvents: b.query<SecurityEvent[], void>({
      query: () => ({ url: "/admin/security/events" }),
      providesTags: ["Security"],
    }),
    listAuditTrail: b.query<AdminAuditEntry[], void>({
      query: () => ({ url: "/admin/security/audit" }),
      providesTags: ["Audit"],
    }),
    listActiveSessions: b.query<ActiveSession[], void>({
      query: () => ({ url: "/admin/security/sessions" }),
      providesTags: ["Sessions"],
    }),
    revokeSession: b.mutation<{ id: string }, string>({
      query: (id) => ({
        url: "/admin/security/sessions/revoke",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Sessions", "Audit"],
    }),

    /* --- GLOBAL SEARCH --- */
    globalSearch: b.query<SearchResponse, string>({
      query: (q) => ({ url: "/admin/search", params: { q } }),
      providesTags: ["Search"],
    }),
  }),
});

export const {
  useListVerificationsQuery,
  useGetVerificationQuery,
  useDecideVerificationMutation,
  useListAdminUsersQuery,
  useGetAdminUserQuery,
  useGetAdminUserActivityQuery,
  useUpdateAdminUserStatusMutation,
  useRemoveAdminUserVerificationMutation,
  useListJobReportsQuery,
  useDecideJobReportMutation,
  useListFraudSignalsQuery,
  useAcknowledgeFraudSignalMutation,
  useListDisputesQuery,
  useGetDisputeQuery,
  useSetDisputeStatusMutation,
  useResolveDisputeMutation,
  useListAnnouncementsQuery,
  useSendAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetAnalyticsQuery,
  useListSecurityEventsQuery,
  useListAuditTrailQuery,
  useListActiveSessionsQuery,
  useRevokeSessionMutation,
  useGlobalSearchQuery,
  useLazyGlobalSearchQuery,
} = adminApi;
