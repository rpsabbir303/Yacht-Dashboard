/**
 * Types for the admin authentication flow.
 *
 * The flow is:
 *   sign-in  ─►  (forgot password)  ─►  verify OTP  ─►  reset password  ─►  success
 *
 * Each step has a tightly-typed request/response pair so the mock API and the
 * eventual real backend can be wired without UI changes.
 */

export interface SignInRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}
export interface ForgotPasswordResponse {
  /** OTP delivery channel — used for display only. */
  delivery: "email";
  /** Lifetime of the OTP, in seconds. The UI starts a countdown from this. */
  expiresInSec: number;
  /** Mock-only: the actual OTP. Real backends would never return this. */
  hintCode?: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}
export interface VerifyOtpResponse {
  /** Short-lived token authorising the next-step password reset. */
  resetToken: string;
  expiresInSec: number;
}

export interface ResetPasswordRequest {
  resetToken: string;
  password: string;
}
export interface ResetPasswordResponse {
  success: true;
}

/** Internal flow state persisted across pages. */
export interface AuthFlowSnapshot {
  email: string | null;
  resetToken: string | null;
  /** ISO-8601 timestamp of when the current OTP was issued. */
  otpRequestedAt: string | null;
  /** OTP lifetime in seconds, as reported by the server. */
  otpExpiresInSec: number | null;
}

/** Strength tiers surfaced by the password strength meter. */
export type PasswordStrengthTier =
  | "empty"
  | "weak"
  | "fair"
  | "good"
  | "strong";

export interface PasswordStrengthResult {
  tier: PasswordStrengthTier;
  /** Normalised score in [0,1]. */
  score: number;
  /** Human readable label for the meter. */
  label: string;
  /** Per-rule status — used to render a checklist below the input. */
  rules: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
  };
}
