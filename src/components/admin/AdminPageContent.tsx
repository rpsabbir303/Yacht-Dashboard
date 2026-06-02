import type { ReactNode } from "react";

import { cn } from "@utils/cn";

interface AdminPageContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Standard admin page content grid — shared horizontal alignment for
 * page titles, KPI cards, filters, and tables.
 *
 *   padding-inline: 32px (16px on narrow mobile)
 *   Page headers supply their own top spacing (24px).
 *   width: 100%, no max-width cap
 */
export const AdminPageContent = ({
  children,
  className,
}: AdminPageContentProps) => (
  <div className={cn("admin-page-content", className)}>{children}</div>
);

export default AdminPageContent;
