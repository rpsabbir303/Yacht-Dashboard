import { useCallback } from "react";

import { useAppDispatch, useAppSelector } from "@redux/hooks";
import {
  clearFlow,
  resendOtp as resendOtpAction,
  setResetToken as setResetTokenAction,
  startRecovery as startRecoveryAction,
} from "@redux/slices/authFlowSlice";

/**
 * Thin selector + action facade for the recovery flow. Components should never
 * touch the `authFlow` slice directly — that way the persistence story (currently
 * sessionStorage) can change without ripple effects.
 */
export const useAuthFlow = () => {
  const dispatch = useAppDispatch();
  const snapshot = useAppSelector((s) => s.authFlow);

  const startRecovery = useCallback(
    (email: string, otpExpiresInSec: number) =>
      dispatch(startRecoveryAction({ email, otpExpiresInSec })),
    [dispatch],
  );

  const refreshOtp = useCallback(
    (otpExpiresInSec: number) =>
      dispatch(resendOtpAction({ otpExpiresInSec })),
    [dispatch],
  );

  const setResetToken = useCallback(
    (token: string) => dispatch(setResetTokenAction(token)),
    [dispatch],
  );

  const reset = useCallback(() => dispatch(clearFlow()), [dispatch]);

  return {
    ...snapshot,
    startRecovery,
    refreshOtp,
    setResetToken,
    reset,
  };
};
