import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAppSelector } from "@redux/hooks";
import type { UserRole } from "@/types";

interface Props {
  children: ReactNode;
  /** Optional list of roles allowed to access this route. */
  allow?: UserRole[];
}

export const ProtectedRoute = ({ children, allow }: Props) => {
  const location = useLocation();
  const { user, status } = useAppSelector((s) => s.auth);

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Wait for the AuthProvider to finish bootstrapping before deciding.
  if (!user) return null;

  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
