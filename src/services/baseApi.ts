/**
 * Shared RTK Query API for the admin console.
 *
 * The platform was converted into an admin-only product, so this slice now
 * exposes only the cross-cutting endpoints that the admin surface needs:
 *
 *   - auth (current user, login)
 *   - jobs (read-only — surfaced in the Job Moderation page)
 *   - notifications (bell dropdown in the admin topbar)
 *
 * Everything else (crew, applications, conversations, schedule) was removed
 * with the consumer dashboard.
 */
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";

import { ACCESS_TOKEN_KEY } from "@utils/constants";
import { mockJobs, mockNotifications, mockUser } from "./mockData";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@auth/types";
import type {
  AppNotification,
  AuthSession,
  Job,
  LoginPayload,
  PaginatedResponse,
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
const jobsDb: Job[] = [...mockJobs];
let notificationsDb: AppNotification[] = [...mockNotifications];

/* ---------------- mock OTP / reset token store ----------------
 * In a real backend the OTP would be sent over email/SMS and stored
 * server-side with an expiry. For demo purposes we keep an in-memory map
 * keyed by email and use a hard-coded code (`123456`) so QA can complete
 * the full flow without touching a mailbox.
 */
const DEMO_OTP_CODE = "123456";
const OTP_EXPIRES_IN_SEC = 60;
const RESET_TOKEN_EXPIRES_IN_SEC = 5 * 60;

interface OtpRecord {
  code: string;
  expiresAt: number;
}
interface ResetRecord {
  email: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpRecord>();
const resetTokenStore = new Map<string, ResetRecord>();

const isValidEmail = (raw: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);

type MockRequest =
  | { url: "/auth/me" }
  | { url: "/auth/login"; method: "POST"; body: LoginPayload }
  | { url: "/auth/forgot-password"; method: "POST"; body: ForgotPasswordRequest }
  | { url: "/auth/verify-otp"; method: "POST"; body: VerifyOtpRequest }
  | { url: "/auth/reset-password"; method: "POST"; body: ResetPasswordRequest }
  | { url: "/jobs"; params?: { search?: string; status?: string; page?: number } }
  | { url: "/notifications" }
  | { url: "/notifications/read"; method: "PATCH"; body: { id?: string } };

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
        const { email, password } = arg.body;
        if (!isValidEmail(email)) {
          return { error: { message: "Enter a valid email address." } };
        }
        if (!password || password.length < 6) {
          return { error: { message: "Incorrect email or password." } };
        }
        const session: AuthSession = {
          user: mockUser,
          accessToken: "demo-token",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
        };
        localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
        return { data: session };
      }

      case "/auth/forgot-password": {
        if (arg.method !== "POST") break;
        const email = arg.body.email.trim().toLowerCase();
        if (!isValidEmail(email)) {
          return { error: { message: "Enter a valid email address." } };
        }
        otpStore.set(email, {
          code: DEMO_OTP_CODE,
          expiresAt: Date.now() + OTP_EXPIRES_IN_SEC * 1000,
        });
        const payload: ForgotPasswordResponse = {
          delivery: "email",
          expiresInSec: OTP_EXPIRES_IN_SEC,
          hintCode: DEMO_OTP_CODE,
        };
        return { data: payload };
      }

      case "/auth/verify-otp": {
        if (arg.method !== "POST") break;
        const email = arg.body.email.trim().toLowerCase();
        const code = arg.body.code.trim();
        const record = otpStore.get(email);
        if (!record) {
          return {
            error: { message: "Request a new OTP — this one is no longer valid." },
          };
        }
        if (Date.now() > record.expiresAt) {
          otpStore.delete(email);
          return { error: { message: "This OTP has expired. Please request a new one." } };
        }
        if (code !== record.code) {
          return { error: { message: "Incorrect code. Please try again." } };
        }
        otpStore.delete(email);
        const token = `rst_${Math.random().toString(36).slice(2)}_${Date.now()}`;
        resetTokenStore.set(token, {
          email,
          expiresAt: Date.now() + RESET_TOKEN_EXPIRES_IN_SEC * 1000,
        });
        const payload: VerifyOtpResponse = {
          resetToken: token,
          expiresInSec: RESET_TOKEN_EXPIRES_IN_SEC,
        };
        return { data: payload };
      }

      case "/auth/reset-password": {
        if (arg.method !== "POST") break;
        const record = resetTokenStore.get(arg.body.resetToken);
        if (!record) {
          return {
            error: {
              message:
                "Reset link expired or invalid. Please request a new OTP.",
            },
          };
        }
        if (Date.now() > record.expiresAt) {
          resetTokenStore.delete(arg.body.resetToken);
          return {
            error: { message: "Reset link expired. Please request a new OTP." },
          };
        }
        if (arg.body.password.length < 8) {
          return {
            error: { message: "Choose a stronger password (8+ characters)." },
          };
        }
        resetTokenStore.delete(arg.body.resetToken);
        const payload: ResetPasswordResponse = { success: true };
        return { data: payload };
      }

      case "/jobs": {
        const params = (arg as { params?: { search?: string; status?: string; page?: number } })
          .params;
        let list = [...jobsDb];
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(
            (j) =>
              j.title.toLowerCase().includes(q) ||
              j.yacht.name.toLowerCase().includes(q) ||
              j.location.toLowerCase().includes(q),
          );
        }
        if (params?.status) {
          list = list.filter((j) => j.status === params.status);
        }
        return { data: paginate(list, params?.page ?? 1, 25) };
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

      default:
        return {
          error: { message: `Unhandled mock route: ${(arg as { url: string }).url}` },
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

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: mockBaseQuery,
  tagTypes: ["Auth", "Jobs", "Notifications"] as const,
  endpoints: (b) => ({
    me: b.query<User, void>({
      query: () => ({ url: "/auth/me" }),
      providesTags: ["Auth"],
    }),
    login: b.mutation<AuthSession, LoginPayload>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),

    listJobs: b.query<
      PaginatedResponse<Job>,
      { search?: string; status?: string; page?: number } | void
    >({
      query: (params) => ({
        url: "/jobs",
        params:
          (params as { search?: string; status?: string; page?: number }) ??
          undefined,
      }),
      providesTags: ["Jobs"],
    }),

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
  }),
});

export const {
  useMeQuery,
  useLoginMutation,
  useListJobsQuery,
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
} = baseApi;
