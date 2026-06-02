/**
 * Settings shell — hosts profile, security and platform (legal) settings.
 */

import {
  SafetyCertificateOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { AdminPageStack } from "@components/admin/AdminPageStack";
import { PageHeader, type PageHeaderSection } from "@components/common/PageHeader";
import { cn } from "@utils/cn";

const SUB_NAV = [
  {
    to: "/admin/settings/profile",
    label: "Profile",
    icon: <UserOutlined />,
    hint: "Personal information & preferences",
  },
  {
    to: "/admin/settings/security",
    label: "Security",
    icon: <SafetyCertificateOutlined />,
    hint: "Password, 2FA, sessions & recovery",
  },
  {
    to: "/admin/settings/platform",
    label: "Platform",
    icon: <SettingOutlined />,
    hint: "System configuration & legal documents",
  },
] as const;

const PAGE_META: Record<
  string,
  { section: PageHeaderSection; title: string; description: string }
> = {
  "/admin/settings/profile": {
    section: "ADMIN",
    title: "Profile",
    description:
      "Manage your administrator identity and how you appear in the console.",
  },
  "/admin/settings/security": {
    section: "ADMIN",
    title: "Security",
    description:
      "Update your password and keep your administrator account protected.",
  },
  "/admin/settings/platform": {
    section: "SYSTEM",
    title: "Legal Documents",
    description:
      "Manage terms, privacy policies and platform legal content for crew and owners.",
  },
};

const ACTIVE_BG_ID = "admin-settings-active-pill";
const ACTIVE_TRANSITION = {
  type: "spring",
  stiffness: 380,
  damping: 30,
} as const;

export const SettingsLayout = () => {
  const { pathname } = useLocation();
  const meta =
    PAGE_META[pathname] ?? PAGE_META["/admin/settings/profile"];

  return (
    <AdminPageStack>
      <PageHeader
        section={meta.section}
        title={meta.title}
        description={meta.description}
      />

      <nav
        className="mb-7 inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1"
        aria-label="Settings sections"
      >
        {SUB_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-2 rounded-lg px-4 py-2 text-[12.5px] font-medium transition-colors",
                isActive ? "text-white" : "text-grey-400 hover:text-white",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId={ACTIVE_BG_ID}
                    aria-hidden
                    className="absolute inset-0 rounded-lg bg-teal-500/[0.14]"
                    transition={ACTIVE_TRANSITION}
                  />
                )}
                <span className="relative z-[1] text-[14px] leading-none">
                  {item.icon}
                </span>
                <span className="relative z-[1]">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </AdminPageStack>
  );
};

export default SettingsLayout;
