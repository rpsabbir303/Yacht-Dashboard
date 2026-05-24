import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAppSelector } from "@redux/hooks";

interface Props {
  children: ReactNode;
}

/**
 * Auth gate for the admin console — sends unauthenticated visitors to /login
 * and preserves their intended destination for post-login redirect.
 */
export const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation();
  const { user, status } = useAppSelector((s) => s.auth);

  if (status === "unauthenticated") {
    return (
      <Navigate
        to="/auth/sign-in"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!user) return null;

  return <>{children}</>;
};
