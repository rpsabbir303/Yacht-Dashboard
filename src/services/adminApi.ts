/**
 * Admin RTK Query API.
 *
 * Self-contained slice — does not depend on or extend `baseApi`. Replace
 * `adminMockBaseQuery` with `fetchBaseQuery({ baseUrl })` to wire up a real
 * backend; every endpoint signature stays the same.
 *
 * Scoped to the practical yacht-hiring admin surface — crew, owners, jobs,
 * applications, analytics and announcements.
 */
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";

import {
  mockAnalytics,
  mockAnnouncements,
  mockApplications,
  mockCrewProfiles,
  mockOwnerProfiles,
} from "./adminMockData";
import {
  computeSupportSummary,
  mockSupportTickets,
} from "./supportMockData";
import { mockJobs, mockUser } from "./mockData";
import type {
  AdminAccountStatus,
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
  SupportTicket,
  SupportTicketCategory,
  SupportTicketListParams,
  SupportTicketListResponse,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketSummary,
  SupportUserRole,
  VerificationStatus,
} from "@/types";

/* ---------------- helpers ---------------- */

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

/* ---------------- mutable in-memory stores ---------------- */

let crewDb: CrewProfile[] = [...mockCrewProfiles];
let ownersDb: OwnerProfile[] = [...mockOwnerProfiles];
let applicationsDb: ApplicationSummary[] = [...mockApplications];
let announcementsDb: Announcement[] = [...mockAnnouncements];
let supportDb: SupportTicket[] = [...mockSupportTickets];

const toSupportSummary = (t: SupportTicket): SupportTicketSummary => {
  const { messages: _m, attachments: _a, ...summary } = t;
  return summary;
};

const filterSupportTickets = (
  tickets: SupportTicket[],
  p: SupportTicketListParams,
): SupportTicketSummary[] => {
  const q = (p.search ?? "").toLowerCase();
  return tickets
    .filter((t) => {
      if (p.status && p.status !== "all" && t.status !== p.status) return false;
      if (p.userRole && p.userRole !== "all" && t.userRole !== p.userRole)
        return false;
      if (p.priority && p.priority !== "all" && t.priority !== p.priority)
        return false;
      if (p.category && p.category !== "all" && t.category !== p.category)
        return false;
      if (!q) return true;
      return (
        t.ticketNumber.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    })
    .map(toSupportSummary)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
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
  /* ---- analytics ---- */
  | { url: "/admin/analytics" }
  /* ---- global search ---- */
  | { url: "/admin/search"; params: { q: string } }
  /* ---- support (maps to GET/PATCH/POST /support/tickets* in production) ---- */
  | { url: "/support/tickets"; params?: SupportTicketListParams }
  | { url: "/support/tickets/detail"; params: { id: string } }
  | {
      url: "/support/tickets/status";
      method: "PATCH";
      body: { id: string; status: SupportTicketStatus };
    }
  | {
      url: "/support/tickets/reply";
      method: "POST";
      body: { id: string; message: string };
    };

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
        return { data: crewDb.find((c) => c.id === arg.body.id)! };
      }

      case "/admin/crew/status": {
        if (arg.method !== "PATCH") break;
        crewDb = crewDb.map((c) =>
          c.id === arg.body.id ? { ...c, status: arg.body.status } : c,
        );
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
        return { data: ownersDb.find((o) => o.id === arg.body.id)! };
      }

      case "/admin/owners/status": {
        if (arg.method !== "PATCH") break;
        ownersDb = ownersDb.map((o) =>
          o.id === arg.body.id ? { ...o, status: arg.body.status } : o,
        );
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
         ANALYTICS
      ==================================================== */

      case "/admin/analytics":
        return { data: mockAnalytics };

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

      /* ====================================================
         SUPPORT  →  GET /support/tickets
      ==================================================== */

      case "/support/tickets": {
        const p = (arg.params ?? {}) as SupportTicketListParams;
        const tickets = filterSupportTickets(supportDb, p);
        const response: SupportTicketListResponse = {
          tickets,
          summary: computeSupportSummary(supportDb),
        };
        return { data: response };
      }

      case "/support/tickets/detail": {
        const ticket = supportDb.find((t) => t.id === arg.params.id);
        if (!ticket) {
          return { error: { message: "Ticket not found" } };
        }
        return { data: ticket };
      }

      case "/support/tickets/status": {
        const idx = supportDb.findIndex((t) => t.id === arg.body.id);
        if (idx < 0) return { error: { message: "Ticket not found" } };
        const updated: SupportTicket = {
          ...supportDb[idx],
          status: arg.body.status,
          updatedAt: new Date().toISOString(),
        };
        supportDb[idx] = updated;
        return { data: updated };
      }

      case "/support/tickets/reply": {
        const idx = supportDb.findIndex((t) => t.id === arg.body.id);
        if (idx < 0) return { error: { message: "Ticket not found" } };
        const adminName = mockUser.fullName ?? "Support Team";
        const reply = {
          id: `msg_${Date.now()}`,
          authorType: "admin" as const,
          authorName: adminName,
          body: arg.body.message,
          createdAt: new Date().toISOString(),
        };
        const updated: SupportTicket = {
          ...supportDb[idx],
          messages: [...supportDb[idx].messages, reply],
          updatedAt: reply.createdAt,
          status:
            supportDb[idx].status === "closed"
              ? "closed"
              : supportDb[idx].status === "resolved"
                ? "resolved"
                : "pending",
        };
        supportDb[idx] = updated;
        return { data: updated };
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
    "Search",
    "Support",
    "SupportTicket",
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
      invalidatesTags: ["Announcements"],
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

    /* --- GLOBAL SEARCH --- */
    globalSearch: b.query<SearchResponse, string>({
      query: (q) => ({ url: "/admin/search", params: { q } }),
      providesTags: ["Search"],
    }),

    /* --- SUPPORT  (production: /support/tickets, /support/tickets/:id, …) --- */
    listSupportTickets: b.query<SupportTicketListResponse, SupportTicketListParams | void>({
      query: (params) => ({
        url: "/support/tickets",
        params: params ?? undefined,
      }),
      providesTags: ["Support"],
    }),
    getSupportTicket: b.query<SupportTicket, string>({
      query: (id) => ({ url: "/support/tickets/detail", params: { id } }),
      providesTags: (_r, _e, id) => [{ type: "SupportTicket", id }],
    }),
    updateSupportTicketStatus: b.mutation<
      SupportTicket,
      { id: string; status: SupportTicketStatus }
    >({
      query: (body) => ({
        url: "/support/tickets/status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        "Support",
        { type: "SupportTicket", id: body.id },
      ],
    }),
    replySupportTicket: b.mutation<
      SupportTicket,
      { id: string; message: string }
    >({
      query: (body) => ({
        url: "/support/tickets/reply",
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        "Support",
        { type: "SupportTicket", id: body.id },
      ],
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
  useGlobalSearchQuery,
  useLazyGlobalSearchQuery,
  useListSupportTicketsQuery,
  useGetSupportTicketQuery,
  useUpdateSupportTicketStatusMutation,
  useReplySupportTicketMutation,
} = adminApi;
