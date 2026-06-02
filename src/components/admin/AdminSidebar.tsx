import {
  AppstoreOutlined,
  AreaChartOutlined,
  ControlOutlined,
  DashboardOutlined,
  LogoutOutlined,
  NotificationOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  SolutionOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

import { AdminBrandMark } from "@components/admin/AdminBrandMark";
import { useAuth } from "@hooks/useAuth";
import { usePermission } from "@hooks/usePermission";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setMobileSidebarOpen, toggleSidebar } from "@redux/slices/uiSlice";
import { cn } from "@utils/cn";
import { initials } from "@utils/format";
import type { Permission } from "@/types";

/**
 * Shared layout ID for the animated active pill. Framer Motion interpolates
 * the teal-tinted background between nav items when the route changes,
 * giving the sidebar a magnetic feel instead of a hard re-paint.
 */
const ACTIVE_BG_ID = "admin-sidebar-active-bg";
const ACTIVE_TRANSITION = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.7,
} as const;

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  /** Optional permission gate — hides the item when the user lacks it. */
  permission?: Permission;
  /** Optional unread / pending counter that surfaces next to the label. */
  badge?: number;
  /** Used for client-side prefix matching of nested routes. */
  match?: string;
}

const NAV_PRIMARY: NavItem[] = [
  { to: "/admin", label: "Overview", icon: <DashboardOutlined />, match: "/admin" },
];

const NAV_OPERATIONS: NavItem[] = [
  {
    to: "/admin/crew",
    label: "Crew Management",
    icon: <TeamOutlined />,
    permission: "crew.read",
  },
  {
    to: "/admin/owners",
    label: "Owner Verification",
    icon: <SafetyCertificateOutlined />,
    permission: "owners.read",
  },
  {
    to: "/admin/jobs",
    label: "Job Management",
    icon: <AppstoreOutlined />,
    permission: "jobs.read",
  },
  {
    to: "/admin/applications",
    label: "Applications",
    icon: <SolutionOutlined />,
    permission: "applications.read",
  },
  {
    to: "/admin/support",
    label: "Support",
    icon: <CustomerServiceOutlined />,
    permission: "support.read",
    match: "/admin/support",
  },
];

const NAV_INTELLIGENCE: NavItem[] = [
  {
    to: "/admin/analytics",
    label: "Analytics",
    icon: <AreaChartOutlined />,
    permission: "analytics.read",
  },
  {
    to: "/admin/notifications",
    label: "Notifications",
    icon: <NotificationOutlined />,
    permission: "announcements.send",
  },
];

const NAV_SYSTEM: NavItem[] = [
  {
    to: "/admin/settings",
    label: "Platform Settings",
    icon: <ControlOutlined />,
  },
];

interface SidebarProps {
  mobile?: boolean;
}

const NavGroup = ({
  label,
  items,
  collapsed,
  onNavigate,
}: {
  label?: string;
  items: NavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}) => {
  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
      {label && !collapsed && (
        <div className="px-2 pb-2 pt-3 text-[10px] font-medium uppercase tracking-[0.22em] text-grey-500">
          {label}
        </div>
      )}
      <ul className="admin-sidebar-nav m-0 list-none space-y-0.5 p-0">
        {items.map((item) => (
          <li key={item.to}>
            <Tooltip
              title={collapsed ? item.label : ""}
              placement="right"
              mouseEnterDelay={0.4}
            >
              <NavLink
                to={item.to}
                onClick={onNavigate}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-colors duration-200",
                    isActive
                      ? "text-white"
                      : "text-grey-400 hover:bg-white/[0.05] hover:text-white",
                    collapsed && "justify-center px-2",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId={ACTIVE_BG_ID}
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-xl bg-teal-500/[0.12]"
                        transition={ACTIVE_TRANSITION}
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-[1] text-[15px] leading-none transition-colors",
                        isActive
                          ? "text-teal-500"
                          : "text-grey-500 group-hover:text-white",
                      )}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="relative z-[1] flex-1 truncate font-medium">
                        {item.label}
                      </span>
                    )}
                    {!collapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="relative z-[1] rounded-full bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-medium text-teal-300 ring-1 ring-teal-500/20">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const AdminSidebar = ({ mobile = false }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed) && !mobile;
  const { user, signOut } = useAuth();
  const { hasPermission, adminRoleLabel } = usePermission();

  const filter = (items: NavItem[]) =>
    items.filter((i) => !i.permission || hasPermission(i.permission));

  const close = () => mobile && dispatch(setMobileSidebarOpen(false));

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-white/[0.08] bg-ink",
        collapsed ? "w-[76px]" : "w-[248px]",
        "transition-[width] duration-300",
      )}
    >
      {/* Brand + collapse — logo centered; toggle does not affect alignment */}
      <div
        className={cn(
          "relative flex shrink-0 border-b border-white/[0.08] overflow-visible",
          collapsed
            ? "flex-col items-center justify-center gap-2 px-3 py-4"
            : "items-center justify-center px-4 py-4",
        )}
      >
        <div className="flex w-full items-center justify-center overflow-visible">
          <AdminBrandMark collapsed={collapsed} />
        </div>

        {!mobile && (
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className={cn(
              "icon-btn shrink-0",
              collapsed
                ? "h-8 w-8"
                : "icon-btn-sm absolute right-4 top-1/2 h-8 w-8 -translate-y-1/2",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            <svg
              viewBox="0 0 24 24"
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                collapsed && "rotate-180",
              )}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto pb-3">
        <NavGroup items={NAV_PRIMARY} collapsed={collapsed} onNavigate={close} />

        <div className={cn("mt-2", collapsed ? "px-3" : "px-5")}>
          <div className="h-px bg-white/[0.08]" />
        </div>
        <NavGroup
          label="Operations"
          items={filter(NAV_OPERATIONS)}
          collapsed={collapsed}
          onNavigate={close}
        />

        <div className={cn("mt-2", collapsed ? "px-3" : "px-5")}>
          <div className="h-px bg-white/[0.08]" />
        </div>
        <NavGroup
          label="Intelligence"
          items={filter(NAV_INTELLIGENCE)}
          collapsed={collapsed}
          onNavigate={close}
        />

        <div className={cn("mt-2", collapsed ? "px-3" : "px-5")}>
          <div className="h-px bg-white/[0.08]" />
        </div>
        <NavGroup
          label="System"
          items={NAV_SYSTEM}
          collapsed={collapsed}
          onNavigate={close}
        />

      </nav>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-white/[0.08] p-3",
          collapsed && "flex justify-center",
        )}
      >
        {collapsed ? (
          <Tooltip title="Sign out" placement="right">
            <button
              onClick={signOut}
              className="icon-btn h-10 w-10"
              aria-label="Sign out"
            >
              <LogoutOutlined />
            </button>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-surface px-3 py-2.5">
            <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white/[0.05] text-[12px] font-semibold text-grey-400">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials(user?.fullName ?? "U")}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-white">
                {user?.fullName ?? "Guest"}
              </div>
              <div className="truncate text-[10px] uppercase tracking-[0.18em] text-gold-500">
                {adminRoleLabel ?? "Admin"}
              </div>
            </div>
            <Tooltip title="Sign out">
              <button
                onClick={signOut}
                className="icon-btn-subtle icon-btn-sm h-8 w-8 shrink-0"
                aria-label="Sign out"
              >
                <LogoutOutlined />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
};
