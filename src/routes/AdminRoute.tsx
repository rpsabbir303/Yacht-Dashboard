import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { usePermission } from "@hooks/usePermission";
import type { AdminRole, Permission } from "@/types";

interface Props {
  children: ReactNode;
  /** Optional permission(s) required to access this route. */
  required?: Permission | Permission[];
  /** Optional explicit admin role(s) allowed. */
  roles?: AdminRole | AdminRole[];
  /** Where to redirect on access denied. */
  redirectTo?: string;
}

/**
 * Gates an admin route. Non-admins are redirected to /dashboard.
 * Authenticated admins lacking the required permission/role are redirected
 * to `redirectTo` (default: /admin).
 */
export const AdminRoute = ({
  children,
  required,
  roles,
  redirectTo = "/admin",
}: Props) => {
  const { isAdmin, hasAllPermissions, requireRole } = usePermission();

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  if (roles && !requireRole(roles)) {
    return <Navigate to={redirectTo} replace />;
  }

  if (required) {
    const list = Array.isArray(required) ? required : [required];
    if (!hasAllPermissions(list)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};
