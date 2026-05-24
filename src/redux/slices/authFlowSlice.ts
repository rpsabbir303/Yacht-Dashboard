import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthFlowSnapshot } from "@auth/types";

/**
 * Tracks the cross-page state for the password recovery flow. We persist to
 * sessionStorage (not localStorage) so a tab refresh during OTP doesn't lose
 * context, but closing the tab clears the flow — matching expected security UX.
 */

const FLOW_KEY = "meridian.admin.authFlow";

const initial: AuthFlowSnapshot = {
  email: null,
  resetToken: null,
  otpRequestedAt: null,
  otpExpiresInSec: null,
};

const hydrate = (): AuthFlowSnapshot => {
  if (typeof window === "undefined") return initial;
  try {
    const raw = sessionStorage.getItem(FLOW_KEY);
    if (!raw) return initial;
    return { ...initial, ...(JSON.parse(raw) as Partial<AuthFlowSnapshot>) };
  } catch {
    return initial;
  }
};

const persist = (state: AuthFlowSnapshot) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(FLOW_KEY, JSON.stringify(state));
  } catch {
    /* sessionStorage may be unavailable (private mode); fail silently */
  }
};

const slice = createSlice({
  name: "authFlow",
  initialState: hydrate(),
  reducers: {
    startRecovery: (
      state,
      action: PayloadAction<{ email: string; otpExpiresInSec: number }>,
    ) => {
      state.email = action.payload.email;
      state.otpRequestedAt = new Date().toISOString();
      state.otpExpiresInSec = action.payload.otpExpiresInSec;
      state.resetToken = null;
      persist(state);
    },
    resendOtp: (state, action: PayloadAction<{ otpExpiresInSec: number }>) => {
      state.otpRequestedAt = new Date().toISOString();
      state.otpExpiresInSec = action.payload.otpExpiresInSec;
      persist(state);
    },
    setResetToken: (state, action: PayloadAction<string>) => {
      state.resetToken = action.payload;
      persist(state);
    },
    clearFlow: (state) => {
      state.email = null;
      state.resetToken = null;
      state.otpRequestedAt = null;
      state.otpExpiresInSec = null;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(FLOW_KEY);
      }
    },
  },
});

export const { startRecovery, resendOtp, setResetToken, clearFlow } =
  slice.actions;
export default slice.reducer;
