import { Link } from "react-router-dom";

import { SeavLogo } from "@components/brand/SeavLogo";
import { cn } from "@utils/cn";

interface Props {
  collapsed?: boolean;
  className?: string;
}

/** Admin shell brand link — full wordmark or compact monogram when collapsed. */
export const AdminBrandMark = ({ collapsed, className }: Props) => (
  <Link
    to="/admin"
    aria-label="SEAV admin dashboard home"
    className={cn(
      "group flex items-center justify-center outline-none focus-visible:ring-1 focus-visible:ring-teal-500/40",
      className,
    )}
  >
    <SeavLogo variant={collapsed ? "compact" : "full"} height={28} />
  </Link>
);
