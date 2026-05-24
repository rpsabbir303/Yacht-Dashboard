/**
 * Admin authentication RTK Query slice.
 *
 * We inject the auth flow endpoints into the shared `baseApi` so that they
 * benefit from the same `mockBaseQuery` (and, later, the same `fetchBaseQuery`)
 * without duplicating middleware. Re-exporting from this module gives the auth
 * feature folder a single point of contact for everything network-related.
 */
import { baseApi } from "@services/baseApi";

import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@auth/types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    forgotPassword: b.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: b.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
    resetPassword: b.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} = authApi;

/** Convenience re-exports so callers can import everything from `@auth/services`. */
export {
  useLoginMutation,
  useMeQuery,
} from "@services/baseApi";
