import {
  ClockCircleOutlined,
  MenuOutlined,
  SafetyOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";

import { NotificationDropdown } from "@components/common/NotificationDropdown";
import { usePermission } from "@hooks/usePermission";
import { useAppDispatch } from "@redux/hooks";
import {
  setCommandPaletteOpen,
  setMobileSidebarOpen,
} from "@redux/slices/uiSlice";

/**
 * Admin-only topbar — no "Post a job" CTA (that's a consumer surface).
 * Surfaces the global search trigger, current platform date, and the
 * admin role badge.
 */
export const AdminTopbar = () => {
  const dispatch = useAppDispatch();
  const { adminRoleLabel } = usePermission();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(i);
  }, []);

  const dateLabel = useMemo(
    () =>
      now.toLocaleString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [now],
  );

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-ink/85 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-8">
        <button
          onClick={() => dispatch(setMobileSidebarOpen(true))}
          className="icon-btn h-10 w-10 lg:hidden"
          aria-label="Open menu"
        >
          <MenuOutlined />
        </button>

        {/* Search trigger */}
        <button
          type="button"
          onClick={() => dispatch(setCommandPaletteOpen(true))}
          className="group ml-auto flex h-10 w-full max-w-xl flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-left text-grey-500 transition hover:border-teal-500/35 hover:bg-white/[0.05] hover:text-grey-400 sm:ml-0"
          aria-label="Open admin search"
        >
          <SearchOutlined />
          <span className="flex-1 truncate text-[13px]">
            Search crew, owners, jobs, applications…
          </span>
          <kbd className="hidden rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-grey-500 group-hover:text-grey-400 sm:inline-flex">
            ⌘ K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-3 sm:ml-4">
          <div className="hidden items-center gap-1.5 text-[11.5px] text-grey-500 md:flex">
            <ClockCircleOutlined />
            <span>{dateLabel}</span>
          </div>

          {adminRoleLabel && (
            <div className="hidden items-center gap-1.5 rounded-full bg-gold-500/[0.06] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.18em] text-gold-500 ring-1 ring-gold-500/15 sm:inline-flex">
              <SafetyOutlined />
              {adminRoleLabel}
            </div>
          )}

          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
};
