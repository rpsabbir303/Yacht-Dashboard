import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAppSelector } from "@redux/hooks";

type Step = "otp" | "reset" | "success";

interface Props {
  step: Step;
  children: ReactNode;
}

/**
 * Gates the steps of the password recovery flow.
 *
 * - `otp`     → requires the user to have requested an OTP (email present).
 * - `reset`   → requires a successful OTP verification (resetToken present).
 * - `success` → requires either resetToken (still in-flight) or just-arrived
 *               from the reset page; we relax this one because the flow state
 *               gets cleared on success.
 *
 * If a prerequisite is missing we send the user back to the right place rather
 * than rendering an empty form they can't make progress on.
 */
export const RequireFlowStep = ({ step, children }: Props) => {
  const { email, resetToken } = useAppSelector((s) => s.authFlow);

  if (step === "otp" && !email) {
    return <Navigate to="/auth/forgot-password" replace />;
  }
  if (step === "reset" && (!email || !resetToken)) {
    return <Navigate to={email ? "/auth/verify-otp" : "/auth/forgot-password"} replace />;
  }
  // `success` is intentionally permissive — users may land here right after a
  // successful reset (which clears the flow), or by accident; either way the
  // page itself is harmless and points back to sign-in.
  return <>{children}</>;
};
