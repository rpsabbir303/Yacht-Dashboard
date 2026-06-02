import { useEffect, type ReactNode } from "react";
import { skipToken } from "@reduxjs/toolkit/query";

import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { logout, setSession } from "@redux/slices/authSlice";
import { useMeQuery } from "@services/baseApi";

/**
 * Bootstraps the admin session on first mount.
 *
 * - If there is no token in localStorage we leave the user as unauthenticated
 *   so the routing layer can show the `/auth/*` flow.
 * - If there is a token but the user object hasn't been hydrated yet (e.g. a
 *   page refresh on a long-running session), we fetch `/auth/me` to rebuild the
 *   profile and keep them signed in.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const user = useAppSelector((s) => s.auth.user);

  const shouldHydrateUser = !!accessToken && !user;
  const { data: me } = useMeQuery(shouldHydrateUser ? undefined : skipToken);

  useEffect(() => {
    // Defensive: prevent redirect loops if a legacy stored user is missing adminRole.
    if (accessToken && user && !user.adminRole) {
      dispatch(logout());
    }
  }, [accessToken, user, dispatch]);

  useEffect(() => {
    if (me && accessToken && !user) {
      dispatch(
        setSession({
          user: me,
          accessToken,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
        }),
      );
    }
  }, [me, user, accessToken, dispatch]);

  return <>{children}</>;
};
