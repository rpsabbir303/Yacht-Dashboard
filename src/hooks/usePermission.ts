import { useMemo } from "react";

import { useAppSelector } from "@redux/hooks";
import {
  ADMIN_ROLE_LABEL,
  ROLE_PERMISSIONS,
  type AdminRole,
  type Permission,
} from "@/types";

/**
 * Single source of truth for role-based access in the admin layer.
 *
 * - `isAdmin` — whether the current user holds any admin role
 * - `hasPermission(p)` — check a single permission
 * - `hasAnyPermission(ps)` / `hasAllPermissions(ps)` — convenience checks
 * - `requireRole(roles)` — boolean check for adminRole membership
 */
export interface PermissionApi {
  isAdmin: boolean;
  adminRole?: AdminRole;
  adminRoleLabel?: string;
  permissions: Permission[];
  hasPermission: (p: Permission) => boolean;
  hasAnyPermission: (ps: Permission[]) => boolean;
  hasAllPermissions: (ps: Permission[]) => boolean;
  requireRole: (roles: AdminRole | AdminRole[]) => boolean;
}

export const usePermission = (): PermissionApi => {
  const adminRole = useAppSelector((s) => s.auth.user?.adminRole);

  return useMemo<PermissionApi>(() => {
    const permissions: Permission[] = adminRole
      ? ROLE_PERMISSIONS[adminRole]
      : [];
    const set = new Set(permissions);

    return {
      isAdmin: !!adminRole,
      adminRole,
      adminRoleLabel: adminRole ? ADMIN_ROLE_LABEL[adminRole] : undefined,
      permissions,
      hasPermission: (p) => set.has(p),
      hasAnyPermission: (ps) => ps.some((p) => set.has(p)),
      hasAllPermissions: (ps) => ps.every((p) => set.has(p)),
      requireRole: (roles) => {
        if (!adminRole) return false;
        return Array.isArray(roles) ? roles.includes(adminRole) : roles === adminRole;
      },
    };
  }, [adminRole]);
};
