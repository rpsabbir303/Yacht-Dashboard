/**
 * Settings shell — hosts the three top-level admin settings pages:
 *
 *   /admin/settings/profile   → personal admin profile management
 *   /admin/settings/security  → personal security center
 *   /admin/settings/platform  → platform-wide configuration (existing module)
 *
 * Renders a single PageHeader for the whole module plus an animated pill
 * sub-navigation. Active page lives in `<Outlet />`.
 */

import {
  SafetyCertificateOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { NavLink, Outlet } from "react-router-dom";

import { PageHeader } from "@components/common/PageHeader";
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
    hint: "System, notifications & legal documents",
  },
] as const;

const ACTIVE_BG_ID = "admin-settings-active-pill";
const ACTIVE_TRANSITION = {
  type: "spring",
  stiffness: 380,
  damping: 30,
} as const;

export const SettingsLayout = () => (
  <div>
    <PageHeader
      eyebrow="Admin · Settings"
      title="Settings"
      subtitle="Manage your administrator profile, secure your account and configure the platform."
    />

    {/* Sub-navigation */}
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
  </div>
);

export default SettingsLayout;
