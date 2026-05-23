import { useEffect, type ReactNode } from "react";

import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setSession } from "@redux/slices/authSlice";
import { useMeQuery } from "@services/baseApi";

/**
 * Bootstraps the session on first mount.
 *
 * Demo behaviour: if no token is in localStorage, we silently log the user in
 * via the mock `/auth/me` endpoint so the dashboard is browseable without a
 * login wall. Swap this out for production by removing the auto-bootstrap
 * branch and relying entirely on the explicit login flow.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const user = useAppSelector((s) => s.auth.user);

  // Skip when we already have a hydrated user from localStorage.
  const { data: me } = useMeQuery(undefined, { skip: !!user });

  useEffect(() => {
    if (me && !user) {
      dispatch(
        setSession({
          user: me,
          accessToken: accessToken ?? "demo-token",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
        }),
      );
    }
  }, [me, user, accessToken, dispatch]);

  return <>{children}</>;
};
