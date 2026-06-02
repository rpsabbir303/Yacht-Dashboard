import type { ReactNode } from "react";

import { cn } from "@utils/cn";

interface AdminPageStackProps {
  children: ReactNode;
  className?: string;
}

/**
 * Vertical stack for admin pages — page title, KPI cards, filters and tables
 * share the same horizontal rail (no separate title margins).
 */
export const AdminPageStack = ({
  children,
  className,
}: AdminPageStackProps) => (
  <div className={cn("admin-page-stack", className)}>{children}</div>
);

export default AdminPageStack;
