import { ClockCircleOutlined, SafetyOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";

import { NotificationDropdown } from "@components/common/NotificationDropdown";
import { usePermission } from "@hooks/usePermission";

/**
 * Right cluster for every admin page header — date/time, role badge, notifications.
 */
export const PageHeaderToolbar = () => {
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
    <div className="admin-page-header__toolbar">
      <div className="admin-page-header__time">
        <ClockCircleOutlined className="text-[13px]" aria-hidden />
        <span className="tabular-nums">{dateLabel}</span>
      </div>

      {adminRoleLabel && (
        <div className="admin-page-header__role">
          <SafetyOutlined aria-hidden />
          {adminRoleLabel}
        </div>
      )}

      <NotificationDropdown />
    </div>
  );
};

export default PageHeaderToolbar;
