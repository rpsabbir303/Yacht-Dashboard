import { z } from "zod";

/**
 * Server-side rules transcribed into Zod for client-side validation. Keep these
 * in lock-step with the rules surfaced in `passwordStrength.ts` so the form's
 * "Reset password" button reflects the same gate as the strength meter.
 */

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const passwordPolicy = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Maximum 72 characters")
  .regex(/[A-Z]/, "Add at least one uppercase letter")
  .regex(/[a-z]/, "Add at least one lowercase letter")
  .regex(/\d/, "Add at least one number")
  .regex(/[^A-Za-z0-9]/, "Add at least one symbol");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean().optional(),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "Enter the full 6-digit code")
    .regex(/^\d{6}$/, "Code must be numeric"),
});
export type OtpValues = z.infer<typeof otpSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordPolicy,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
