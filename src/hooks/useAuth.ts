import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { logout, setSession } from "@redux/slices/authSlice";
import { clearFlow } from "@redux/slices/authFlowSlice";
import { useLoginMutation } from "@services/baseApi";
import type { LoginPayload } from "@/types";

/**
 * Thin facade around the auth Redux slice + login mutation.
 *
 * `signIn` is intentionally kept here so it remains useful from places that
 * don't render the full `SignInPage` (e.g. session-recovery prompts), while the
 * sign-in page itself handles the more nuanced UX (remember-me, errors, etc.).
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loginMutation, { isLoading }] = useLoginMutation();

  const { user, accessToken, status, error } = useAppSelector((s) => s.auth);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const session = await loginMutation(payload).unwrap();
      dispatch(setSession(session));
      navigate("/admin", { replace: true });
      return session;
    },
    [dispatch, loginMutation, navigate],
  );

  const signOut = useCallback(() => {
    dispatch(logout());
    dispatch(clearFlow());
    navigate("/auth/sign-in", { replace: true });
  }, [dispatch, navigate]);

  return {
    user,
    accessToken,
    status,
    error,
    isAuthenticated: status === "authenticated" && !!user,
    isAuthenticating: isLoading,
    signIn,
    signOut,
  };
};
