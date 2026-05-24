import {
  AlertOutlined,
  AppstoreOutlined,
  BellOutlined,
  CheckOutlined,
  NotificationOutlined,
  SafetyOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Badge, Dropdown, Empty } from "antd";
import { useNavigate } from "react-router-dom";

import {
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
} from "@services/baseApi";
import { fromNow } from "@utils/format";
import { cn } from "@utils/cn";
import type { AppNotification, NotificationCategory } from "@/types";

const CATEGORY_META: Record<
  NotificationCategory,
  { icon: React.ReactNode; tone: string }
> = {
  verification: { icon: <SafetyOutlined />, tone: "text-gold-400" },
  crew: { icon: <TeamOutlined />, tone: "text-teal-300" },
  owner: { icon: <UserOutlined />, tone: "text-gold-400" },
  job: { icon: <AppstoreOutlined />, tone: "text-white" },
  application: { icon: <SolutionOutlined />, tone: "text-teal-300" },
  security: { icon: <AlertOutlined />, tone: "text-[#C24545]" },
  announcement: { icon: <NotificationOutlined />, tone: "text-teal-300" },
  system: { icon: <SettingOutlined />, tone: "text-grey-400" },
};

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { data: items = [] } = useListNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();

  const unread = items.filter((n) => !n.read).length;

  const onClickItem = (n: AppNotification) => {
    if (!n.read) markRead(n.id);
    if (n.href) navigate(n.href);
  };

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{ items: [] }}
      dropdownRender={() => (
        <div className="surface-card w-[380px] overflow-hidden !p-0">
          <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
            <div>
              <div className="text-[13px] font-semibold text-white">
                Admin notifications
              </div>
              <div className="mt-0.5 text-[11px] text-grey-500">
                {unread} unread
              </div>
            </div>
            {unread > 0 && (
              <button
                onClick={() => markRead()}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-teal-300 hover:bg-white/[0.04]"
              >
                <CheckOutlined /> Mark all read
              </button>
            )}
          </div>

          <div className="scrollbar-thin max-h-[440px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-10">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No notifications"
                />
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {items.map((n) => {
                  const meta = CATEGORY_META[n.category];
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => onClickItem(n)}
                        className={cn(
                          "flex w-full items-start gap-3 px-5 py-3.5 text-left transition hover:bg-white/[0.02]",
                          !n.read && "bg-white/[0.015]",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid h-8 w-8 place-items-center rounded-xl border border-white/[0.05] bg-white/[0.02]",
                            meta.tone,
                          )}
                        >
                          {meta.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[13px] font-medium text-white">
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                            )}
                          </div>
                          {n.body && (
                            <p className="mt-0.5 line-clamp-2 text-[12px] text-grey-400">
                              {n.body}
                            </p>
                          )}
                          <span className="mt-1 inline-block text-[10.5px] text-grey-500">
                            {fromNow(n.createdAt)}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-white/[0.05] px-5 py-3 text-right">
            <button
              onClick={() => navigate("/admin/notifications")}
              className="text-[12px] font-medium text-teal-300 hover:text-teal-200"
            >
              Manage announcements
            </button>
          </div>
        </div>
      )}
    >
      <button
        className="relative grid h-10 w-10 place-items-center rounded-xl text-grey-400 transition hover:bg-white/[0.04] hover:text-white"
        aria-label="Notifications"
      >
        <Badge dot={unread > 0} offset={[-2, 4]} color="#14B8A6">
          <BellOutlined style={{ color: "inherit", fontSize: 18 }} />
        </Badge>
      </button>
    </Dropdown>
  );
};
