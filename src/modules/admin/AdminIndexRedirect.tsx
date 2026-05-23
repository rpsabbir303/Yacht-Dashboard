import { Navigate } from "react-router-dom";

import { usePermission } from "@hooks/usePermission";

/**
 * /admin landing — sends admins to the most relevant root page for their
 * effective permissions:
 *
 * - super-admin / moderator → Analytics (overview)
 * - support-agent           → Disputes (their primary surface)
 */
export const AdminIndexRedirect = () => {
  const { adminRole, hasPermission } = usePermission();

  if (adminRole === "support-agent") {
    return <Navigate to="/admin/disputes" replace />;
  }

  if (hasPermission("analytics.read")) {
    return <Navigate to="/admin/analytics" replace />;
  }

  if (hasPermission("verifications.read")) {
    return <Navigate to="/admin/verifications" replace />;
  }

  return <Navigate to="/admin/disputes" replace />;
};

export default AdminIndexRedirect;
