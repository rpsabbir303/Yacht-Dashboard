import {
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CrownOutlined,
  LockOutlined,
  SafetyOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Tabs, Tag, message } from "antd";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { DataTable } from "@components/admin/DataTable";
import { EmptyState } from "@components/feedback/EmptyState";
import {
  useListActiveSessionsQuery,
  useListAuditTrailQuery,
  useListSecurityEventsQuery,
  useRevokeSessionMutation,
} from "@services/adminApi";
import { useConfirm } from "@hooks/useConfirm";
import { formatDateTime, fromNow, initials } from "@utils/format";
import { cn } from "@utils/cn";
import type {
  ActiveSession,
  AdminAuditEntry,
  SecurityEvent,
  SecurityEventKind,
} from "@/types";

const EVENT_LABEL: Record<SecurityEventKind, string> = {
  "login-success": "Login",
  "login-failed": "Failed login",
  "password-reset": "Password reset",
  "mfa-enabled": "MFA enabled",
  "mfa-disabled": "MFA disabled",
  "suspicious-login": "Suspicious login",
  "session-revoked": "Session revoked",
};

const EVENT_ICON: Record<SecurityEventKind, React.ReactNode> = {
  "login-success": <CheckCircleOutlined />,
  "login-failed": <CloseCircleOutlined />,
  "password-reset": <LockOutlined />,
  "mfa-enabled": <SafetyOutlined />,
  "mfa-disabled": <SafetyOutlined />,
  "suspicious-login": <AlertOutlined />,
  "session-revoked": <StopOutlined />,
};

const TONE = (kind: SecurityEventKind, risk: "low" | "medium" | "high") => {
  if (kind === "suspicious-login" || kind === "login-failed" || risk === "high") {
    return { icon: "text-[#C24545] bg-[#AA2727]/10", text: "text-[#C24545]" };
  }
  if (risk === "medium" || kind === "mfa-disabled") {
    return { icon: "text-gold-400 bg-gold-500/10", text: "text-gold-400" };
  }
  return { icon: "text-teal-300 bg-teal-500/10", text: "text-teal-300" };
};

export const SecurityPage = () => {
  const { data: events = [], isLoading: eventsLoading } = useListSecurityEventsQuery();
  const { data: audit = [], isLoading: auditLoading } = useListAuditTrailQuery();
  const { data: sessions = [], isLoading: sessionsLoading } = useListActiveSessionsQuery();
  const [revoke] = useRevokeSessionMutation();
  const confirm = useConfirm();

  const failedLogins = events.filter(
    (e) => e.kind === "login-failed" || e.kind === "suspicious-login",
  );

  const onRevoke = async (s: ActiveSession) => {
    const ok = await confirm({
      title: `Revoke ${s.user.name}'s session?`,
      description: `${s.device} · ${s.ip}`,
      danger: true,
      confirmText: "Revoke",
    });
    if (!ok) return;
    try {
      await revoke(s.id).unwrap();
      message.success("Session revoked");
    } catch {
      message.error("Action failed");
    }
  };

  const counts = {
    failed: failedLogins.length,
    sessions: sessions.length,
    admin: audit.length,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Security & system logs"
        subtitle="Authentication anomalies, active sessions and a full audit trail of administrator actions."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi label="Failed logins (24h)" value={counts.failed} tone="danger" />
        <Kpi label="Active sessions" value={counts.sessions} tone="white" />
        <Kpi label="Admin actions logged" value={counts.admin} tone="gold" />
      </div>

      <GlassPanel padding="none">
        <Tabs
          tabBarStyle={{
            padding: "0 24px",
            margin: 0,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
          items={[
            {
              key: "logs",
              label: "Activity logs",
              children: (
                <div className="p-1">
                  <DataTable<SecurityEvent>
                    loading={eventsLoading}
                    dataSource={events}
                    locale={{
                      emptyText: (
                        <EmptyState
                          title="No security events"
                          description="Nothing unusual to report."
                        />
                      ),
                    }}
                    columns={[
                      {
                        title: "Event",
                        dataIndex: "kind",
                        render: (_: unknown, e: SecurityEvent) => {
                          const tone = TONE(e.kind, e.risk);
                          return (
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "grid h-8 w-8 place-items-center rounded-lg",
                                  tone.icon,
                                )}
                              >
                                {EVENT_ICON[e.kind]}
                              </span>
                              <span className="text-[13px] text-white">
                                {EVENT_LABEL[e.kind]}
                              </span>
                            </div>
                          );
                        },
                      },
                      {
                        title: "User",
                        dataIndex: "user",
                        render: (_: unknown, e: SecurityEvent) => (
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={e.user.avatarUrl}
                              size={28}
                              className="!bg-white/[0.04] !text-grey-400"
                            >
                              {initials(e.user.name)}
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate text-[13px] text-white">
                                {e.user.name}
                              </div>
                              <div className="truncate text-[11px] text-grey-500">
                                {e.user.email}
                              </div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: "IP / Device",
                        dataIndex: "ip",
                        width: 240,
                        render: (_: unknown, e: SecurityEvent) => (
                          <div className="text-[12.5px] text-grey-400">
                            <div className="font-mono text-[11.5px]">{e.ip}</div>
                            <div className="text-[11px] text-grey-500">
                              {e.device}
                              {e.country ? ` · ${e.country}` : ""}
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: "Risk",
                        dataIndex: "risk",
                        width: 100,
                        render: (v: SecurityEvent["risk"]) => (
                          <Tag
                            color={
                              v === "high" ? "red" : v === "medium" ? "gold" : "default"
                            }
                            bordered={false}
                          >
                            {v.toUpperCase()}
                          </Tag>
                        ),
                      },
                      {
                        title: "When",
                        dataIndex: "createdAt",
                        width: 160,
                        render: (v: string) => (
                          <span className="text-[12.5px] text-grey-400">
                            {fromNow(v)}
                          </span>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: "failed-logins",
              label: `Failed logins (${counts.failed})`,
              children: (
                <div className="p-1">
                  <DataTable<SecurityEvent>
                    dataSource={failedLogins}
                    locale={{
                      emptyText: (
                        <EmptyState
                          title="No failed logins"
                          description="No suspicious or failed login attempts in the last 24 hours."
                        />
                      ),
                    }}
                    columns={[
                      {
                        title: "User",
                        dataIndex: "user",
                        render: (_: unknown, e: SecurityEvent) => (
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={e.user.avatarUrl}
                              size={28}
                              className="!bg-white/[0.04] !text-grey-400"
                            >
                              {initials(e.user.name)}
                            </Avatar>
                            <span className="text-[13px] text-white">
                              {e.user.name}
                            </span>
                          </div>
                        ),
                      },
                      {
                        title: "Reason",
                        dataIndex: "kind",
                        width: 200,
                        render: (v: SecurityEventKind) => EVENT_LABEL[v],
                      },
                      {
                        title: "IP",
                        dataIndex: "ip",
                        width: 160,
                        render: (v: string) => (
                          <span className="font-mono text-[12px] text-grey-400">
                            {v}
                          </span>
                        ),
                      },
                      { title: "Country", dataIndex: "country", width: 140 },
                      {
                        title: "When",
                        dataIndex: "createdAt",
                        width: 160,
                        render: (v: string) => fromNow(v),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: "sessions",
              label: `Sessions (${counts.sessions})`,
              children: (
                <div className="p-1">
                  <DataTable<ActiveSession>
                    loading={sessionsLoading}
                    dataSource={sessions}
                    locale={{
                      emptyText: (
                        <EmptyState
                          title="No active sessions"
                          description="No live sessions to display."
                        />
                      ),
                    }}
                    columns={[
                      {
                        title: "User",
                        dataIndex: "user",
                        render: (_: unknown, s: ActiveSession) => (
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={s.user.avatarUrl}
                              size={28}
                              className="!bg-white/[0.04] !text-grey-400"
                            >
                              {initials(s.user.name)}
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate text-[13px] text-white">
                                {s.user.name}
                              </div>
                              <div className="truncate text-[11px] text-grey-500">
                                {s.user.email}
                              </div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: "Device / IP",
                        width: 240,
                        render: (_: unknown, s: ActiveSession) => (
                          <div className="text-[12.5px] text-grey-400">
                            <div>{s.device}</div>
                            <div className="font-mono text-[11px] text-grey-500">
                              {s.ip}
                              {s.country ? ` · ${s.country}` : ""}
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: "Started",
                        dataIndex: "startedAt",
                        width: 140,
                        render: (v: string) => fromNow(v),
                      },
                      {
                        title: "Last seen",
                        dataIndex: "lastSeenAt",
                        width: 140,
                        render: (v: string) => fromNow(v),
                      },
                      {
                        title: "",
                        width: 110,
                        align: "right",
                        render: (_: unknown, s: ActiveSession) => (
                          <Button
                            danger
                            size="small"
                            icon={<StopOutlined />}
                            onClick={() => onRevoke(s)}
                          >
                            Revoke
                          </Button>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: "audit",
              label: `Admin actions (${counts.admin})`,
              children: (
                <div className="p-1">
                  <DataTable<AdminAuditEntry>
                    loading={auditLoading}
                    dataSource={audit}
                    locale={{
                      emptyText: (
                        <EmptyState
                          title="No admin actions yet"
                          description="When you or other admins take action, it'll be recorded here."
                        />
                      ),
                    }}
                    columns={[
                      {
                        title: "Admin",
                        dataIndex: "admin",
                        render: (_: unknown, e: AdminAuditEntry) => (
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold-500/10 text-gold-400">
                              <CrownOutlined />
                            </span>
                            <div className="min-w-0">
                              <div className="text-[13px] text-white">{e.admin.name}</div>
                              <div className="text-[11px] uppercase tracking-wider text-grey-500">
                                {e.admin.role.replace("-", " ")}
                              </div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: "Action",
                        dataIndex: "action",
                        render: (v: string) => (
                          <span className="text-[13px] text-white">{v}</span>
                        ),
                      },
                      {
                        title: "Target",
                        dataIndex: "target",
                        render: (t: AdminAuditEntry["target"]) =>
                          t ? (
                            <span className="text-[12.5px] text-grey-400">
                              <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-grey-400">
                                {t.type}
                              </span>{" "}
                              {t.label}
                            </span>
                          ) : (
                            <span className="text-[12px] text-grey-500">—</span>
                          ),
                      },
                      {
                        title: "When",
                        dataIndex: "createdAt",
                        width: 180,
                        render: (v: string) => (
                          <span
                            className="text-[12.5px] text-grey-400"
                            title={formatDateTime(v)}
                          >
                            {fromNow(v)}
                          </span>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
          ]}
        />
      </GlassPanel>
    </div>
  );
};

const Kpi = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "white" | "gold" | "danger";
}) => (
  <div className="surface-card flex items-center justify-between px-5 py-4">
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tighter2 text-white">
        {value}
      </div>
    </div>
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        tone === "white" && "bg-white",
        tone === "gold" && "bg-gold-500",
        tone === "danger" && "bg-[#AA2727]",
      )}
    />
  </div>
);

export default SecurityPage;
