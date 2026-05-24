/**
 * Admin RTK Query API.
 *
 * Self-contained slice — does not depend on or extend `baseApi`. Replace
 * `adminMockBaseQuery` with `fetchBaseQuery({ baseUrl })` to wire up a real
 * backend; every endpoint signature stays the same.
 *
 * Scoped to the *practical* yacht-hiring admin surface — crew, owners, jobs,
 * applications, analytics, announcements and security. Anything that used
 * to power reports / fraud / disputes / moderation has been removed.
 */
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";

import {
  mockActiveSessions,
  mockAnalytics,
  mockAnnouncements,
  mockApplications,
  mockAuditTrail,
  mockCrewProfiles,
  mockOwnerProfiles,
  mockSecurityEvents,
} from "./adminMockData";
import { mockJobs, mockUser } from "./mockData";
import type {
  ActiveSession,
  AdminAccountStatus,
  AdminAuditEntry,
  AnalyticsSnapshot,
  Announcement,
  AnnouncementAudience,
  AnnouncementChannel,
  ApplicationStatus,
  ApplicationSummary,
  CrewAvailability,
  CrewPosition,
  CrewProfile,
  JobApplicationStats,
  OwnerProfile,
  SearchResponse,
  SearchResult,
  SecurityEvent,
  VerificationStatus,
} from "@/types";

/* ---------------- helpers ---------------- */

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

/* ---------------- mutable in-memory stores ---------------- */

let crewDb: CrewProfile[] = [...mockCrewProfiles];
let ownersDb: OwnerProfile[] = [...mockOwnerProfiles];
let applicationsDb: ApplicationSummary[] = [...mockApplications];
let announcementsDb: Announcement[] = [...mockAnnouncements];
let sessionsDb: ActiveSession[] = [...mockActiveSessions];
let auditDb: AdminAuditEntry[] = [...mockAuditTrail];

const recordAudit = (
  action: string,
  target?: { type: string; id: string; label: string },
) => {
  auditDb = [
    {
      id: `au_${Date.now()}`,
      admin: {
        id: mockUser.id,
        name: mockUser.fullName,
        role: mockUser.adminRole ?? "super-admin",
      },
      action,
      target,
      createdAt: new Date().toISOString(),
    },
    ...auditDb,
  ];
};

const computeJobStats = (jobId: string): JobApplicationStats => {
  const apps = applicationsDb.filter((a) => a.job.id === jobId);
  return {
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    shortlisted: apps.filter((a) => a.status === "shortlisted").length,
    interviewing: apps.filter((a) => a.status === "interviewing").length,
    accepted: apps.filter((a) => a.status === "accepted").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };
};

/* ---------------- mock base query ---------------- */

type AdminRequest =
  /* ---- crew ---- */
  | {
      url: "/admin/crew";
      params?: {
        search?: string;
        position?: CrewPosition | "all";
        nationality?: string;
        certification?: string;
        availability?: CrewAvailability | "all";
        status?: AdminAccountStatus | "all";
      };
    }
  | { url: "/admin/crew/byId"; params: { id: string } }
  | {
      url: "/admin/crew/verification";
      method: "PATCH";
      body: { id: string; decision: VerificationStatus; note?: string };
    }
  | {
      url: "/admin/crew/status";
      method: "PATCH";
      body: { id: string; status: AdminAccountStatus; reason?: string };
    }
  /* ---- owners ---- */
  | {
      url: "/admin/owners";
      params?: {
        search?: string;
        verification?: VerificationStatus | "all";
        status?: AdminAccountStatus | "all";
      };
    }
  | { url: "/admin/owners/byId"; params: { id: string } }
  | {
      url: "/admin/owners/verification";
      method: "PATCH";
      body: {
        id: string;
        decision: VerificationStatus;
        note?: string;
      };
    }
  | {
      url: "/admin/owners/status";
      method: "PATCH";
      body: { id: string; status: AdminAccountStatus; reason?: string };
    }
  /* ---- jobs ---- */
  | { url: "/admin/jobs"; params?: { search?: string; status?: string } }
  | { url: "/admin/jobs/byId"; params: { id: string } }
  /* ---- applications ---- */
  | {
      url: "/admin/applications";
      params?: {
        search?: string;
        status?: ApplicationStatus | "all";
        jobId?: string;
      };
    }
  | { url: "/admin/applications/byId"; params: { id: string } }
  | {
      url: "/admin/applications/status";
      method: "PATCH";
      body: { id: string; status: ApplicationStatus };
    }
  /* ---- announcements ---- */
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
  /* ---- analytics + security ---- */
  | { url: "/admin/analytics" }
  | { url: "/admin/security/events" }
  | { url: "/admin/security/audit" }
  | { url: "/admin/security/sessions" }
  | {
      url: "/admin/security/sessions/revoke";
      method: "DELETE";
      body: { id: string };
    }
  /* ---- global search ---- */
  | { url: "/admin/search"; params: { q: string } };

const adminMockBaseQuery: BaseQueryFn<AdminRequest, unknown, { message: string }> = async (
  arg,
) => {
  await delay();

  try {
    switch (arg.url) {
      /* ====================================================
         CREW
      ==================================================== */

      case "/admin/crew": {
        const p = arg.params ?? {};
        const q = (p.search ?? "").toLowerCase();
        const data = crewDb.filter((c) => {
          if (p.position && p.position !== "all" && c.position !== p.position)
            return false;
          if (p.status && p.status !== "all" && c.status !== p.status)
            return false;
          if (
            p.availability &&
            p.availability !== "all" &&
            c.availability !== p.availability
          )
            return false;
          if (
            p.nationality &&
            !c.nationality.toLowerCase().includes(p.nationality.toLowerCase())
          )
            return false;
          if (p.certification) {
            const needle = p.certification.toLowerCase();
            const ok = c.certifications.some((x) =>
              x.name.toLowerCase().includes(needle),
            );
            if (!ok) return false;
          }
          if (q) {
            return (
              c.fullName.toLowerCase().includes(q) ||
              c.email.toLowerCase().includes(q) ||
              c.nationality.toLowerCase().includes(q)
            );
          }
          return true;
        });
        return { data };
      }

      case "/admin/crew/byId": {
        const found = crewDb.find((c) => c.id === arg.params.id);
        if (!found) return { error: { message: "Crew member not found" } };
        return { data: found };
      }

      case "/admin/crew/verification": {
        if (arg.method !== "PATCH") break;
        crewDb = crewDb.map((c) =>
          c.id === arg.body.id
            ? {
                ...c,
                verificationStatus: arg.body.decision,
                lastActiveAt: new Date().toISOString(),
              }
            : c,
        );
        recordAudit(`Crew verification → ${arg.body.decision}`, {
          type: "crew",
          id: arg.body.id,
          label: crewDb.find((c) => c.id === arg.body.id)?.fullName ?? arg.body.id,
        });
        return { data: crewDb.find((c) => c.id === arg.body.id)! };
      }

      case "/admin/crew/status": {
        if (arg.method !== "PATCH") break;
        crewDb = crewDb.map((c) =>
          c.id === arg.body.id ? { ...c, status: arg.body.status } : c,
        );
        recordAudit(`Crew status → ${arg.body.status}`, {
          type: "crew",
          id: arg.body.id,
          label: crewDb.find((c) => c.id === arg.body.id)?.fullName ?? arg.body.id,
        });
        return { data: crewDb.find((c) => c.id === arg.body.id)! };
      }

      /* ====================================================
         OWNERS
      ==================================================== */

      case "/admin/owners": {
        const p = arg.params ?? {};
        const q = (p.search ?? "").toLowerCase();
        const data = ownersDb.filter((o) => {
          if (
            p.verification &&
            p.verification !== "all" &&
            o.verificationStatus !== p.verification
          )
            return false;
          if (p.status && p.status !== "all" && o.status !== p.status)
            return false;
          if (q) {
            return (
              o.fullName.toLowerCase().includes(q) ||
              o.email.toLowerCase().includes(q) ||
              (o.companyName ?? "").toLowerCase().includes(q) ||
              o.country.toLowerCase().includes(q)
            );
          }
          return true;
        });
        return { data };
      }

      case "/admin/owners/byId": {
        const found = ownersDb.find((o) => o.id === arg.params.id);
        if (!found) return { error: { message: "Owner not found" } };
        return { data: found };
      }

      case "/admin/owners/verification": {
        if (arg.method !== "PATCH") break;
        ownersDb = ownersDb.map((o) =>
          o.id === arg.body.id
            ? {
                ...o,
                verificationStatus: arg.body.decision,
                notes: arg.body.note ?? o.notes,
              }
            : o,
        );
        recordAudit(`Owner verification → ${arg.body.decision}`, {
          type: "owner",
          id: arg.body.id,
          label: ownersDb.find((o) => o.id === arg.body.id)?.fullName ?? arg.body.id,
        });
        return { data: ownersDb.find((o) => o.id === arg.body.id)! };
      }

      case "/admin/owners/status": {
        if (arg.method !== "PATCH") break;
        ownersDb = ownersDb.map((o) =>
          o.id === arg.body.id ? { ...o, status: arg.body.status } : o,
        );
        recordAudit(`Owner status → ${arg.body.status}`, {
          type: "owner",
          id: arg.body.id,
          label: ownersDb.find((o) => o.id === arg.body.id)?.fullName ?? arg.body.id,
        });
        return { data: ownersDb.find((o) => o.id === arg.body.id)! };
      }

      /* ====================================================
         JOBS  (delegated to mockJobs)
      ==================================================== */

      case "/admin/jobs": {
        const q = (arg.params?.search ?? "").toLowerCase();
        const status = arg.params?.status;
        const data = mockJobs
          .filter((j) => {
            if (status && status !== "all" && j.status !== status) return false;
            if (q) {
              return (
                j.title.toLowerCase().includes(q) ||
                j.yacht.name.toLowerCase().includes(q) ||
                j.location.toLowerCase().includes(q)
              );
            }
            return true;
          })
          .map((j) => ({ ...j, stats: computeJobStats(j.id) }));
        return { data };
      }

      case "/admin/jobs/byId": {
        const found = mockJobs.find((j) => j.id === arg.params.id);
        if (!found) return { error: { message: "Job not found" } };
        const owner =
          ownersDb.find((o) => o.id === "u_owner_1") ?? ownersDb[0];
        const applications = applicationsDb.filter(
          (a) => a.job.id === arg.params.id,
        );
        return {
          data: {
            job: found,
            owner,
            stats: computeJobStats(arg.params.id),
            applications,
          },
        };
      }

      /* ====================================================
         APPLICATIONS
      ==================================================== */

      case "/admin/applications": {
        const p = arg.params ?? {};
        const q = (p.search ?? "").toLowerCase();
        const data = applicationsDb.filter((a) => {
          if (p.status && p.status !== "all" && a.status !== p.status)
            return false;
          if (p.jobId && a.job.id !== p.jobId) return false;
          if (q) {
            return (
              a.candidate.fullName.toLowerCase().includes(q) ||
              a.job.title.toLowerCase().includes(q) ||
              a.job.yacht.toLowerCase().includes(q)
            );
          }
          return true;
        });
        return { data };
      }

      case "/admin/applications/byId": {
        const found = applicationsDb.find((a) => a.id === arg.params.id);
        if (!found) return { error: { message: "Application not found" } };
        return { data: found };
      }

      case "/admin/applications/status": {
        if (arg.method !== "PATCH") break;
        applicationsDb = applicationsDb.map((a) =>
          a.id === arg.body.id
            ? {
                ...a,
                status: arg.body.status,
                updatedAt: new Date().toISOString(),
              }
            : a,
        );
        recordAudit(`Application status → ${arg.body.status}`, {
          type: "application",
          id: arg.body.id,
          label:
            applicationsDb.find((a) => a.id === arg.body.id)?.candidate.fullName ??
            arg.body.id,
        });
        return { data: applicationsDb.find((a) => a.id === arg.body.id)! };
      }

      /* ====================================================
         ANNOUNCEMENTS
      ==================================================== */

      case "/admin/announcements": {
        if ("method" in arg && arg.method === "POST") {
          const nowIso = new Date().toISOString();
          const item: Announcement = {
            id: `a_${Date.now()}`,
            title: arg.body.title,
            body: arg.body.body,
            audience: arg.body.audience,
            channels: arg.body.channels,
            status: arg.body.scheduledFor ? "scheduled" : "sent",
            scheduledFor: arg.body.scheduledFor,
            sentAt: arg.body.scheduledFor ? undefined : nowIso,
            createdAt: nowIso,
            createdBy: { id: mockUser.id, name: mockUser.fullName },
            deliveredCount: arg.body.scheduledFor ? undefined : 4210,
            openRate: arg.body.scheduledFor ? undefined : 0.54,
          };
          announcementsDb = [item, ...announcementsDb];
          recordAudit(`Sent announcement: ${item.title}`, {
            type: "announcement",
            id: item.id,
            label: item.title,
          });
          return { data: item };
        }
        return { data: announcementsDb };
      }

      case "/admin/announcements/delete": {
        if (arg.method !== "DELETE") break;
        announcementsDb = announcementsDb.filter((a) => a.id !== arg.body.id);
        return { data: { id: arg.body.id } };
      }

      /* ====================================================
         ANALYTICS + SECURITY
      ==================================================== */

      case "/admin/analytics":
        return { data: mockAnalytics };

      case "/admin/security/events":
        return { data: mockSecurityEvents };

      case "/admin/security/audit":
        return { data: auditDb };

      case "/admin/security/sessions":
        return { data: sessionsDb };

      case "/admin/security/sessions/revoke": {
        if (arg.method !== "DELETE") break;
        sessionsDb = sessionsDb.filter((s) => s.id !== arg.body.id);
        recordAudit("Revoked active session", {
          type: "session",
          id: arg.body.id,
          label: arg.body.id,
        });
        return { data: { id: arg.body.id } };
      }

      /* ====================================================
         GLOBAL SEARCH
      ==================================================== */

      case "/admin/search": {
        const q = arg.params.q.trim().toLowerCase();
        if (!q) return { data: { results: [] } as SearchResponse };

        const results: SearchResult[] = [];

        crewDb.forEach((c) => {
          if (
            c.fullName.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.nationality.toLowerCase().includes(q)
          ) {
            results.push({
              id: c.id,
              kind: "crew",
              title: c.fullName,
              subtitle: c.email,
              href: `/admin/crew/${c.id}`,
              meta: c.position,
            });
          }
        });

        ownersDb.forEach((o) => {
          if (
            o.fullName.toLowerCase().includes(q) ||
            o.email.toLowerCase().includes(q) ||
            (o.companyName ?? "").toLowerCase().includes(q)
          ) {
            results.push({
              id: o.id,
              kind: "owner",
              title: o.fullName,
              subtitle: o.companyName ?? o.email,
              href: `/admin/owners`,
              meta: o.country,
            });
          }
        });

        mockJobs.forEach((j) => {
          if (
            j.title.toLowerCase().includes(q) ||
            j.yacht.name.toLowerCase().includes(q) ||
            j.location.toLowerCase().includes(q)
          ) {
            results.push({
              id: j.id,
              kind: "job",
              title: j.title,
              subtitle: j.yacht.name,
              href: `/admin/jobs/${j.id}`,
              meta: j.location,
            });
          }
        });

        applicationsDb.forEach((a) => {
          if (
            a.candidate.fullName.toLowerCase().includes(q) ||
            a.job.title.toLowerCase().includes(q)
          ) {
            results.push({
              id: a.id,
              kind: "application",
              title: a.candidate.fullName,
              subtitle: a.job.title,
              href: `/admin/applications`,
              meta: a.status,
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

/* ---------------- types passed to consumers ---------------- */

export interface JobDetailsResponse {
  job: (typeof mockJobs)[number];
  owner: OwnerProfile;
  stats: JobApplicationStats;
  applications: ApplicationSummary[];
}

export type AdminJobRow = (typeof mockJobs)[number] & {
  stats: JobApplicationStats;
};

/* ---------------- API ---------------- */

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: adminMockBaseQuery,
  tagTypes: [
    "Crew",
    "CrewProfile",
    "Owners",
    "OwnerProfile",
    "Jobs",
    "Job",
    "Applications",
    "Application",
    "Announcements",
    "Analytics",
    "Security",
    "Audit",
    "Sessions",
    "Search",
  ] as const,
  endpoints: (b) => ({
    /* --- CREW --- */
    listCrew: b.query<
      CrewProfile[],
      {
        search?: string;
        position?: CrewPosition | "all";
        nationality?: string;
        certification?: string;
        availability?: CrewAvailability | "all";
        status?: AdminAccountStatus | "all";
      } | void
    >({
      query: (params) => ({ url: "/admin/crew", params: params ?? undefined }),
      providesTags: ["Crew"],
    }),
    getCrewProfile: b.query<CrewProfile, string>({
      query: (id) => ({ url: "/admin/crew/byId", params: { id } }),
      providesTags: (_r, _e, id) => [{ type: "CrewProfile", id }],
    }),
    decideCrewVerification: b.mutation<
      CrewProfile,
      { id: string; decision: VerificationStatus; note?: string }
    >({
      query: (body) => ({
        url: "/admin/crew/verification",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        "Crew",
        { type: "CrewProfile", id: body.id },
        "Audit",
      ],
    }),
    updateCrewStatus: b.mutation<
      CrewProfile,
      { id: string; status: AdminAccountStatus; reason?: string }
    >({
      query: (body) => ({
        url: "/admin/crew/status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        "Crew",
        { type: "CrewProfile", id: body.id },
        "Audit",
      ],
    }),

    /* --- OWNERS --- */
    listOwners: b.query<
      OwnerProfile[],
      {
        search?: string;
        verification?: VerificationStatus | "all";
        status?: AdminAccountStatus | "all";
      } | void
    >({
      query: (params) => ({
        url: "/admin/owners",
        params: params ?? undefined,
      }),
      providesTags: ["Owners"],
    }),
    getOwnerProfile: b.query<OwnerProfile, string>({
      query: (id) => ({ url: "/admin/owners/byId", params: { id } }),
      providesTags: (_r, _e, id) => [{ type: "OwnerProfile", id }],
    }),
    decideOwnerVerification: b.mutation<
      OwnerProfile,
      { id: string; decision: VerificationStatus; note?: string }
    >({
      query: (body) => ({
        url: "/admin/owners/verification",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        "Owners",
        { type: "OwnerProfile", id: body.id },
        "Audit",
      ],
    }),
    updateOwnerStatus: b.mutation<
      OwnerProfile,
      { id: string; status: AdminAccountStatus; reason?: string }
    >({
      query: (body) => ({
        url: "/admin/owners/status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        "Owners",
        { type: "OwnerProfile", id: body.id },
        "Audit",
      ],
    }),

    /* --- JOBS --- */
    listAdminJobs: b.query<
      AdminJobRow[],
      { search?: string; status?: string } | void
    >({
      query: (params) => ({
        url: "/admin/jobs",
        params: params ?? undefined,
      }),
      providesTags: ["Jobs"],
    }),
    getAdminJob: b.query<JobDetailsResponse, string>({
      query: (id) => ({ url: "/admin/jobs/byId", params: { id } }),
      providesTags: (_r, _e, id) => [{ type: "Job", id }],
    }),

    /* --- APPLICATIONS --- */
    listApplications: b.query<
      ApplicationSummary[],
      {
        search?: string;
        status?: ApplicationStatus | "all";
        jobId?: string;
      } | void
    >({
      query: (params) => ({
        url: "/admin/applications",
        params: params ?? undefined,
      }),
      providesTags: ["Applications"],
    }),
    getApplication: b.query<ApplicationSummary, string>({
      query: (id) => ({ url: "/admin/applications/byId", params: { id } }),
      providesTags: (_r, _e, id) => [{ type: "Application", id }],
    }),
    setApplicationStatus: b.mutation<
      ApplicationSummary,
      { id: string; status: ApplicationStatus }
    >({
      query: (body) => ({
        url: "/admin/applications/status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        "Applications",
        { type: "Application", id: body.id },
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
  useListCrewQuery,
  useGetCrewProfileQuery,
  useDecideCrewVerificationMutation,
  useUpdateCrewStatusMutation,
  useListOwnersQuery,
  useGetOwnerProfileQuery,
  useDecideOwnerVerificationMutation,
  useUpdateOwnerStatusMutation,
  useListAdminJobsQuery,
  useGetAdminJobQuery,
  useListApplicationsQuery,
  useGetApplicationQuery,
  useSetApplicationStatusMutation,
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
