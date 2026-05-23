/**
 * Centralised RTK Query API.
 *
 * For development we use a `mockBaseQuery` that resolves against the in-memory
 * fixtures in `mockData.ts`. To switch to a real backend, replace `mockBaseQuery`
 * with `fetchBaseQuery({ baseUrl: API_BASE_URL, ... })` and remove the mock
 * delay. Endpoint definitions stay the same.
 */
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";

import { ACCESS_TOKEN_KEY } from "@utils/constants";
import {
  mockApplications,
  mockConversations,
  mockCrew,
  mockJobs,
  mockMessages,
  mockNotifications,
  mockSchedule,
  mockUser,
} from "./mockData";
import type {
  Application,
  ApplicationStatus,
  AppNotification,
  ChatMessage,
  Conversation,
  CrewFilters,
  CrewMember,
  Job,
  LoginPayload,
  AuthSession,
  PaginatedResponse,
  ScheduleEvent,
  User,
} from "@/types";

/* ---------------- helpers ---------------- */

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const paginate = <T,>(
  items: T[],
  page = 1,
  pageSize = 10,
): PaginatedResponse<T> => {
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    pagination: { page, pageSize, total: items.length },
  };
};

/* ---------------- mutable in-memory stores ---------------- */
// (allows mutations from the UI to feel real during the demo)

let jobsDb: Job[] = [...mockJobs];
let applicationsDb: Application[] = [...mockApplications];
let conversationsDb: Conversation[] = [...mockConversations];
const messagesDb: Record<string, ChatMessage[]> = JSON.parse(
  JSON.stringify(mockMessages),
);
let notificationsDb: AppNotification[] = [...mockNotifications];
let scheduleDb: ScheduleEvent[] = [...mockSchedule];

type MockRequest =
  | { url: "/auth/me" }
  | { url: "/auth/login"; method: "POST"; body: LoginPayload }
  | { url: "/jobs"; params?: { search?: string; status?: string; page?: number } }
  | { url: "/jobs/byId"; params: { id: string } }
  | { url: "/jobs"; method: "POST"; body: Partial<Job> }
  | { url: "/jobs/update"; method: "PATCH"; body: Partial<Job> & { id: string } }
  | { url: "/jobs/delete"; method: "DELETE"; body: { id: string } }
  | { url: "/crew"; params?: CrewFilters }
  | { url: "/crew/byId"; params: { id: string } }
  | { url: "/applications"; params?: { status?: ApplicationStatus } }
  | {
      url: "/applications/status";
      method: "PATCH";
      body: { id: string; status: ApplicationStatus };
    }
  | { url: "/conversations" }
  | { url: "/messages"; params: { conversationId: string } }
  | {
      url: "/messages";
      method: "POST";
      body: { conversationId: string; text: string };
    }
  | { url: "/notifications" }
  | { url: "/notifications/read"; method: "PATCH"; body: { id?: string } }
  | { url: "/schedule" }
  | { url: "/schedule"; method: "POST"; body: Partial<ScheduleEvent> };

const mockBaseQuery: BaseQueryFn<MockRequest, unknown, { message: string }> = async (
  arg,
) => {
  await delay();

  try {
    switch (arg.url) {
      case "/auth/me":
        return { data: mockUser };

      case "/auth/login": {
        if (arg.method !== "POST") break;
        const session: AuthSession = {
          user: mockUser,
          accessToken: "demo-token",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
        };
        localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
        return { data: session };
      }

      case "/jobs": {
        if ("method" in arg && arg.method === "POST") {
          const id = `job_${Date.now()}`;
          const newJob: Job = {
            id,
            title: arg.body.title ?? "Untitled job",
            position: arg.body.position ?? "stewardess",
            status: arg.body.status ?? "open",
            contractType: arg.body.contractType ?? "permanent",
            yacht:
              arg.body.yacht ?? {
                name: "Untitled yacht",
                length: 0,
                type: "motor",
              },
            description: arg.body.description ?? "",
            responsibilities: arg.body.responsibilities ?? [],
            requirements: arg.body.requirements ?? [],
            certifications: arg.body.certifications ?? [],
            languages: arg.body.languages ?? [],
            salary:
              arg.body.salary ?? {
                currency: "EUR",
                min: 0,
                max: 0,
                period: "monthly",
              },
            location: arg.body.location ?? "",
            startDate: arg.body.startDate ?? new Date().toISOString(),
            endDate: arg.body.endDate,
            applicationsCount: 0,
            shortlistedCount: 0,
            postedById: mockUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          jobsDb = [newJob, ...jobsDb];
          return { data: newJob };
        }
        const filtered = jobsDb.filter((j) => {
          if (!("params" in arg) || !arg.params) return true;
          if (arg.params.status && j.status !== arg.params.status) return false;
          if (arg.params.search) {
            const q = arg.params.search.toLowerCase();
            return (
              j.title.toLowerCase().includes(q) ||
              j.yacht.name.toLowerCase().includes(q) ||
              j.location.toLowerCase().includes(q)
            );
          }
          return true;
        });
        return { data: paginate(filtered, arg.params?.page ?? 1, 10) };
      }

      case "/jobs/byId": {
        const job = jobsDb.find((j) => j.id === arg.params.id);
        if (!job) return { error: { message: "Job not found" } };
        return { data: job };
      }

      case "/jobs/update": {
        if (arg.method !== "PATCH") break;
        jobsDb = jobsDb.map((j) =>
          j.id === arg.body.id
            ? { ...j, ...arg.body, updatedAt: new Date().toISOString() }
            : j,
        );
        return { data: jobsDb.find((j) => j.id === arg.body.id)! };
      }

      case "/jobs/delete": {
        if (arg.method !== "DELETE") break;
        jobsDb = jobsDb.filter((j) => j.id !== arg.body.id);
        return { data: { id: arg.body.id } };
      }

      case "/crew": {
        const params = arg.params ?? {};
        const filtered = mockCrew.filter((c) => {
          if (params.position && c.position !== params.position) return false;
          if (params.availability && c.availability !== params.availability)
            return false;
          if (
            params.minExperience &&
            c.yearsOfExperience < params.minExperience
          )
            return false;
          if (
            params.location &&
            !c.location.toLowerCase().includes(params.location.toLowerCase())
          )
            return false;
          if (
            params.certifications &&
            params.certifications.length > 0 &&
            !params.certifications.every((cert) =>
              c.certifications.some((cc) =>
                cc.name.toLowerCase().includes(cert.toLowerCase()),
              ),
            )
          )
            return false;
          if (params.search) {
            const q = params.search.toLowerCase();
            return (
              c.fullName.toLowerCase().includes(q) ||
              c.headline.toLowerCase().includes(q) ||
              c.location.toLowerCase().includes(q)
            );
          }
          return true;
        });
        return {
          data: paginate(filtered, params.page ?? 1, params.pageSize ?? 12),
        };
      }

      case "/crew/byId": {
        const c = mockCrew.find((x) => x.id === arg.params.id);
        if (!c) return { error: { message: "Crew not found" } };
        return { data: c };
      }

      case "/applications": {
        const params = "params" in arg ? arg.params : undefined;
        const filtered = params?.status
          ? applicationsDb.filter((a) => a.status === params.status)
          : applicationsDb;
        return { data: filtered };
      }

      case "/applications/status": {
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

      case "/conversations":
        return { data: conversationsDb };

      case "/messages": {
        if ("method" in arg && arg.method === "POST") {
          const id = `msg_${Date.now()}`;
          const message: ChatMessage = {
            id,
            conversationId: arg.body.conversationId,
            senderId: mockUser.id,
            text: arg.body.text,
            createdAt: new Date().toISOString(),
            status: "sent",
          };
          messagesDb[arg.body.conversationId] = [
            ...(messagesDb[arg.body.conversationId] ?? []),
            message,
          ];
          conversationsDb = conversationsDb.map((c) =>
            c.id === arg.body.conversationId
              ? {
                  ...c,
                  lastMessage: message,
                  updatedAt: message.createdAt,
                }
              : c,
          );
          return { data: message };
        }
        return {
          data: messagesDb[arg.params.conversationId] ?? [],
        };
      }

      case "/notifications":
        return { data: notificationsDb };

      case "/notifications/read": {
        if (arg.method !== "PATCH") break;
        notificationsDb = notificationsDb.map((n) =>
          !arg.body.id || n.id === arg.body.id ? { ...n, read: true } : n,
        );
        return { data: notificationsDb };
      }

      case "/schedule": {
        if ("method" in arg && arg.method === "POST") {
          const newEvent: ScheduleEvent = {
            id: `sch_${Date.now()}`,
            type: arg.body.type ?? "interview",
            title: arg.body.title ?? "Untitled event",
            startAt: arg.body.startAt ?? new Date().toISOString(),
            endAt: arg.body.endAt,
            participants: arg.body.participants ?? [],
            description: arg.body.description,
            jobId: arg.body.jobId,
            applicationId: arg.body.applicationId,
            location: arg.body.location,
            meetingUrl: arg.body.meetingUrl,
          };
          scheduleDb = [newEvent, ...scheduleDb];
          return { data: newEvent };
        }
        return { data: scheduleDb };
      }

      default:
        return { error: { message: `Unhandled mock route: ${(arg as { url: string }).url}` } };
    }
  } catch (err) {
    return {
      error: { message: err instanceof Error ? err.message : "Unknown error" },
    };
  }
  return { error: { message: "Method not implemented for route" } };
};

/* ---------------- API definition ---------------- */

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: mockBaseQuery,
  tagTypes: [
    "Auth",
    "Jobs",
    "Job",
    "Crew",
    "CrewProfile",
    "Applications",
    "Conversations",
    "Messages",
    "Notifications",
    "Schedule",
  ] as const,
  endpoints: (b) => ({
    /* ---------- AUTH ---------- */
    me: b.query<User, void>({
      query: () => ({ url: "/auth/me" }),
      providesTags: ["Auth"],
    }),
    login: b.mutation<AuthSession, LoginPayload>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),

    /* ---------- JOBS ---------- */
    listJobs: b.query<
      PaginatedResponse<Job>,
      { search?: string; status?: string; page?: number } | void
    >({
      query: (params) => ({
        url: "/jobs",
        params: (params as { search?: string; status?: string; page?: number }) ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((j) => ({ type: "Job" as const, id: j.id })),
              { type: "Jobs" as const, id: "LIST" },
            ]
          : [{ type: "Jobs", id: "LIST" }],
    }),
    getJob: b.query<Job, string>({
      query: (id) => ({ url: "/jobs/byId", params: { id } }),
      providesTags: (_r, _e, id) => [{ type: "Job", id }],
    }),
    createJob: b.mutation<Job, Partial<Job>>({
      query: (body) => ({ url: "/jobs", method: "POST", body }),
      invalidatesTags: [{ type: "Jobs", id: "LIST" }],
    }),
    updateJob: b.mutation<Job, Partial<Job> & { id: string }>({
      query: (body) => ({ url: "/jobs/update", method: "PATCH", body }),
      invalidatesTags: (_r, _e, body) => [
        { type: "Job", id: body.id },
        { type: "Jobs", id: "LIST" },
      ],
    }),
    deleteJob: b.mutation<{ id: string }, string>({
      query: (id) => ({ url: "/jobs/delete", method: "DELETE", body: { id } }),
      invalidatesTags: [{ type: "Jobs", id: "LIST" }],
    }),

    /* ---------- CREW ---------- */
    listCrew: b.query<PaginatedResponse<CrewMember>, CrewFilters | void>({
      query: (params) => ({ url: "/crew", params: params as CrewFilters | undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((c) => ({ type: "CrewProfile" as const, id: c.id })),
              { type: "Crew" as const, id: "LIST" },
            ]
          : [{ type: "Crew", id: "LIST" }],
    }),
    getCrew: b.query<CrewMember, string>({
      query: (id) => ({ url: "/crew/byId", params: { id } }),
      providesTags: (_r, _e, id) => [{ type: "CrewProfile", id }],
    }),

    /* ---------- APPLICATIONS ---------- */
    listApplications: b.query<Application[], ApplicationStatus | void>({
      query: (status) => ({
        url: "/applications",
        params: status ? { status } : undefined,
      }),
      providesTags: ["Applications"],
    }),
    updateApplicationStatus: b.mutation<
      Application,
      { id: string; status: ApplicationStatus }
    >({
      query: (body) => ({
        url: "/applications/status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Applications"],
    }),

    /* ---------- CHAT ---------- */
    listConversations: b.query<Conversation[], void>({
      query: () => ({ url: "/conversations" }),
      providesTags: ["Conversations"],
    }),
    listMessages: b.query<ChatMessage[], string>({
      query: (conversationId) => ({
        url: "/messages",
        params: { conversationId },
      }),
      providesTags: (_r, _e, id) => [{ type: "Messages", id }],
    }),
    sendMessage: b.mutation<
      ChatMessage,
      { conversationId: string; text: string }
    >({
      query: (body) => ({ url: "/messages", method: "POST", body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Messages", id: arg.conversationId },
        "Conversations",
      ],
    }),

    /* ---------- NOTIFICATIONS ---------- */
    listNotifications: b.query<AppNotification[], void>({
      query: () => ({ url: "/notifications" }),
      providesTags: ["Notifications"],
    }),
    markNotificationRead: b.mutation<AppNotification[], string | void>({
      query: (id) => ({
        url: "/notifications/read",
        method: "PATCH",
        body: { id: id ?? undefined },
      }),
      invalidatesTags: ["Notifications"],
    }),

    /* ---------- SCHEDULE ---------- */
    listSchedule: b.query<ScheduleEvent[], void>({
      query: () => ({ url: "/schedule" }),
      providesTags: ["Schedule"],
    }),
    createScheduleEvent: b.mutation<ScheduleEvent, Partial<ScheduleEvent>>({
      query: (body) => ({ url: "/schedule", method: "POST", body }),
      invalidatesTags: ["Schedule"],
    }),
  }),
});

export const {
  useMeQuery,
  useLoginMutation,
  useListJobsQuery,
  useGetJobQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useListCrewQuery,
  useGetCrewQuery,
  useListApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useListConversationsQuery,
  useListMessagesQuery,
  useSendMessageMutation,
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
  useListScheduleQuery,
  useCreateScheduleEventMutation,
} = baseApi;
