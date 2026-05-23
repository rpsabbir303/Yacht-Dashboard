import {
  AlertOutlined,
  AppstoreOutlined,
  AreaChartOutlined,
  AuditOutlined,
  BellOutlined,
  CalendarOutlined,
  CompassOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  LogoutOutlined,
  MessageOutlined,
  NotificationOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { NavLink } from "react-router-dom";

import { BrandMark } from "@components/common/BrandMark";
import { useAuth } from "@hooks/useAuth";
import { usePermission } from "@hooks/usePermission";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setMobileSidebarOpen, toggleSidebar } from "@redux/slices/uiSlice";
import { cn } from "@utils/cn";
import { initials } from "@utils/format";
import type { Permission } from "@/types";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  /** Optional permission gate — hides the item when the user lacks it. */
  permission?: Permission;
}

const NAV_PRIMARY: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: <DashboardOutlined /> },
  { to: "/jobs", label: "Jobs", icon: <AppstoreOutlined /> },
  { to: "/crew", label: "Crew", icon: <CompassOutlined /> },
  { to: "/applications", label: "Applications", icon: <TeamOutlined /> },
  { to: "/messages", label: "Messages", icon: <MessageOutlined /> },
];

const NAV_SECONDARY: NavItem[] = [
  { to: "/schedule", label: "Schedule", icon: <CalendarOutlined /> },
  { to: "/notifications", label: "Notifications", icon: <BellOutlined /> },
  { to: "/settings", label: "Settings", icon: <SettingOutlined /> },
];

const NAV_ADMIN: NavItem[] = [
  { to: "/admin/analytics", label: "Analytics", icon: <AreaChartOutlined />, permission: "analytics.read" },
  { to: "/admin/verifications", label: "Verifications", icon: <SafetyCertificateOutlined />, permission: "verifications.read" },
  { to: "/admin/users", label: "Users", icon: <UserOutlined />, permission: "users.read" },
  { to: "/admin/reported-jobs", label: "Reports", icon: <FlagOutlined />, permission: "moderation.read" },
  { to: "/admin/moderation", label: "Fraud monitor", icon: <AlertOutlined />, permission: "moderation.read" },
  { to: "/admin/disputes", label: "Disputes", icon: <ExclamationCircleOutlined />, permission: "disputes.read" },
  { to: "/admin/announcements", label: "Announcements", icon: <NotificationOutlined />, permission: "announcements.send" },
  { to: "/admin/security", label: "Security", icon: <AuditOutlined />, permission: "security.read" },
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
}) => (
  <div className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
    {label && !collapsed && (
      <div className="px-2 pb-2 pt-3 text-[10px] font-medium uppercase tracking-[0.22em] text-grey-500">
        {label}
      </div>
    )}
    <ul className="space-y-0.5">
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
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-colors duration-200",
                  isActive
                    ? "bg-white/[0.04] text-white"
                    : "text-grey-400 hover:bg-white/[0.025] hover:text-white",
                  collapsed && "justify-center px-2",
                )
              }
              end={item.to === "/dashboard"}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-1 left-0 w-[2px] rounded-r-full bg-teal-500"
                    />
                  )}
                  <span
                    className={cn(
                      "text-[15px] leading-none transition-colors",
                      isActive ? "text-teal-400" : "text-grey-500 group-hover:text-white",
                    )}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="flex-1 truncate font-medium">
                      {item.label}
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

export const Sidebar = ({ mobile = false }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed) && !mobile;
  const { user, signOut } = useAuth();
  const { isAdmin, hasPermission, adminRoleLabel } = usePermission();

  const adminItems = NAV_ADMIN.filter(
    (i) => !i.permission || hasPermission(i.permission),
  );

  const close = () => mobile && dispatch(setMobileSidebarOpen(false));

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-white/[0.05] bg-ink",
        collapsed ? "w-[76px]" : "w-[248px]",
        "transition-[width] duration-300",
      )}
    >
      <div
        className={cn(
          "flex items-center px-5 pb-5 pt-6",
          collapsed && "justify-center px-3",
        )}
      >
        <BrandMark collapsed={collapsed} />
      </div>

      {!mobile && (
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="absolute -right-3 top-8 hidden h-6 w-6 items-center justify-center rounded-full border border-white/[0.06] bg-surface text-grey-400 transition hover:border-teal-500/40 hover:text-white lg:flex"
          aria-label="Toggle sidebar"
        >
          <svg
            viewBox="0 0 24 24"
            className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      <nav className="scrollbar-thin flex-1 overflow-y-auto pb-3">
        <NavGroup items={NAV_PRIMARY} collapsed={collapsed} onNavigate={close} />
        <div className={cn("mt-2", collapsed ? "px-3" : "px-5")}>
          <div className="h-px bg-white/[0.04]" />
        </div>
        <NavGroup
          label="Workspace"
          items={NAV_SECONDARY}
          collapsed={collapsed}
          onNavigate={close}
        />

        {isAdmin && adminItems.length > 0 && (
          <>
            <div className={cn("mt-2", collapsed ? "px-3" : "px-5")}>
              <div className="h-px bg-white/[0.04]" />
            </div>
            <NavGroup
              label="Admin"
              items={adminItems}
              collapsed={collapsed}
              onNavigate={close}
            />
            {!collapsed && adminRoleLabel && (
              <div className="mx-3 mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-500/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-gold-400 ring-1 ring-gold-500/15">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                {adminRoleLabel}
              </div>
            )}
          </>
        )}
      </nav>

      <div
        className={cn(
          "border-t border-white/[0.05] p-3",
          collapsed && "flex justify-center",
        )}
      >
        {collapsed ? (
          <Tooltip title="Sign out" placement="right">
            <button
              onClick={signOut}
              className="grid h-10 w-10 place-items-center rounded-xl text-grey-400 transition hover:bg-white/[0.04] hover:text-white"
              aria-label="Sign out"
            >
              <LogoutOutlined />
            </button>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-surface px-3 py-2.5">
            <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white/[0.04] text-[12px] font-semibold text-grey-400">
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
              <div className="truncate text-[10px] uppercase tracking-[0.18em] text-grey-500">
                {user?.role ?? "—"}
              </div>
            </div>
            <button
              onClick={signOut}
              className="rounded-lg p-1.5 text-grey-400 transition hover:bg-white/[0.04] hover:text-white"
              aria-label="Sign out"
            >
              <LogoutOutlined />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
