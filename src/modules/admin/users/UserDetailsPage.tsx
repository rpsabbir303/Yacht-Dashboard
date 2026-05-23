import {
  ArrowLeftOutlined,
  StopOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Tabs, message } from "antd";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { StatusBadge } from "@components/admin/StatusBadge";
import { PageLoader } from "@components/feedback/PageLoader";
import { EmptyState } from "@components/feedback/EmptyState";
import {
  useGetAdminUserActivityQuery,
  useGetAdminUserQuery,
  useRemoveAdminUserVerificationMutation,
  useUpdateAdminUserStatusMutation,
} from "@services/adminApi";
import { useConfirm } from "@hooks/useConfirm";
import { initials, formatDate, fromNow } from "@utils/format";
import type { AdminAccountStatus } from "@/types";

import { ActivityTimeline } from "./components/ActivityTimeline";
import { WarningModal } from "./components/WarningModal";

type WarnAction = Exclude<AdminAccountStatus, "active" | "pending-verification">;

export const UserDetailsPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const { data: user, isLoading } = useGetAdminUserQuery(id, { skip: !id });
  const { data: activity = [] } = useGetAdminUserActivityQuery(id, { skip: !id });
  const [updateStatus, { isLoading: statusLoading }] =
    useUpdateAdminUserStatusMutation();
  const [removeVerification] = useRemoveAdminUserVerificationMutation();
  const confirm = useConfirm();

  const [pending, setPending] = useState<WarnAction | null>(null);

  const stats = useMemo(
    () => ({
      jobs: user?.jobsPosted ?? 0,
      apps: user?.applicationsSubmitted ?? 0,
      reports: user?.reportsAgainst ?? 0,
    }),
    [user],
  );

  if (isLoading) return <PageLoader />;

  if (!user) {
    return (
      <div>
        <PageHeader eyebrow="Admin" title="User not found" />
        <EmptyState
          title="We couldn't find that user"
          description="They may have been deleted or the URL is incorrect."
          action={
            <Link to="/admin/users">
              <Button icon={<ArrowLeftOutlined />}>Back to users</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const performStatus = async (status: WarnAction, reason: string) => {
    try {
      await updateStatus({ id: user.id, status, reason }).unwrap();
      message.success(`User ${status}`);
      setPending(null);
    } catch {
      message.error("Action failed. Please try again.");
    }
  };

  const handleRemoveVerification = async () => {
    const ok = await confirm({
      title: "Remove verification?",
      description:
        "The user will lose their verified status and the gold badge across the platform.",
      danger: true,
      confirmText: "Remove verification",
    });
    if (!ok) return;
    try {
      await removeVerification(user.id).unwrap();
      message.success("Verification removed");
    } catch {
      message.error("Action failed. Please try again.");
    }
  };

  const handleReactivate = async () => {
    const ok = await confirm({
      title: "Reactivate account?",
      description: "The user will regain full access to the platform.",
    });
    if (!ok) return;
    try {
      await updateStatus({ id: user.id, status: "active" }).unwrap();
      message.success("Account reactivated");
    } catch {
      message.error("Action failed. Please try again.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-grey-500 transition hover:text-white"
          >
            <ArrowLeftOutlined />
            <span>Admin · Users</span>
          </Link>
        }
        title={user.fullName}
        subtitle={user.email}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {user.status === "active" || user.status === "warned" || user.status === "pending-verification" ? (
              <>
                <Button
                  icon={<WarningOutlined />}
                  onClick={() => setPending("warned")}
                >
                  Warn
                </Button>
                <Button
                  icon={<StopOutlined />}
                  onClick={() => setPending("suspended")}
                  danger
                >
                  Suspend
                </Button>
                <Button
                  icon={<CloseCircleOutlined />}
                  onClick={() => setPending("banned")}
                  danger
                  type="primary"
                >
                  Ban
                </Button>
              </>
            ) : (
              <Button
                icon={<CheckCircleOutlined />}
                onClick={handleReactivate}
                type="primary"
              >
                Reactivate
              </Button>
            )}
            {user.verified && (
              <Button
                icon={<SafetyCertificateOutlined />}
                onClick={handleRemoveVerification}
              >
                Remove verification
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_2fr]">
        {/* Profile card */}
        <GlassPanel padding="lg">
          <div className="flex flex-col items-center text-center">
            <Avatar
              src={user.avatarUrl}
              size={88}
              className="!bg-white/[0.04] !text-grey-400"
            >
              {initials(user.fullName)}
            </Avatar>
            <h2 className="mt-4 text-[17px] font-semibold text-white">
              {user.fullName}
            </h2>
            <div className="mt-0.5 text-[12.5px] text-grey-500">
              {user.email}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <StatusBadge kind="account" value={user.status} variant="chip" />
              {user.verified && (
                <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-teal-300 ring-1 ring-teal-500/20">
                  Verified
                </span>
              )}
              {user.adminRole && (
                <span className="rounded-full bg-gold-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold-400 ring-1 ring-gold-500/20">
                  {user.adminRole.replace("-", " ")}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/[0.05] py-4">
            <Stat label="Jobs" value={stats.jobs} />
            <Stat label="Apps" value={stats.apps} />
            <Stat
              label="Reports"
              value={stats.reports}
              tone={stats.reports >= 5 ? "danger" : stats.reports > 0 ? "gold" : "neutral"}
            />
          </div>

          <dl className="mt-5 space-y-3 text-[13px]">
            <Row k="Role" v={user.role} />
            <Row k="Country" v={user.country ?? "—"} />
            <Row k="Joined" v={formatDate(user.joinedAt)} />
            <Row
              k="Last active"
              v={user.lastActiveAt ? fromNow(user.lastActiveAt) : "—"}
            />
          </dl>
        </GlassPanel>

        {/* Tabs */}
        <GlassPanel padding="none">
          <Tabs
            className="admin-user-tabs"
            tabBarStyle={{
              padding: "0 24px",
              margin: 0,
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
            items={[
              {
                key: "activity",
                label: "Activity",
                children: (
                  <div className="p-6">
                    <ActivityTimeline entries={activity} />
                  </div>
                ),
              },
              {
                key: "documents",
                label: "Documents",
                children: (
                  <div className="p-6">
                    <EmptyState
                      title="No documents on file"
                      description="Verification documents will appear here once submitted."
                    />
                  </div>
                ),
              },
              {
                key: "yachts",
                label: "Yachts & Company",
                children: (
                  <div className="p-6">
                    {user.role === "owner" || user.role === "agent" ? (
                      <EmptyState
                        title="No yachts linked"
                        description="Registered yachts and company filings appear here."
                      />
                    ) : (
                      <EmptyState
                        title="Not applicable"
                        description="This section is only available for owners and agents."
                      />
                    )}
                  </div>
                ),
              },
            ]}
          />
        </GlassPanel>
      </div>

      <WarningModal
        open={!!pending}
        action={pending ?? "warned"}
        userName={user.fullName}
        loading={statusLoading}
        onCancel={() => setPending(null)}
        onConfirm={(reason) => {
          if (pending) return performStatus(pending, reason);
        }}
      />
    </div>
  );
};

const Stat = ({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "gold" | "danger";
}) => (
  <div className="text-center">
    <div
      className={
        tone === "danger"
          ? "text-xl font-semibold text-[#C24545]"
          : tone === "gold"
            ? "text-xl font-semibold text-gold-400"
            : "text-xl font-semibold text-white"
      }
    >
      {value}
    </div>
    <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
      {label}
    </div>
  </div>
);

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex items-center justify-between">
    <dt className="text-grey-500">{k}</dt>
    <dd className="text-white capitalize">{v}</dd>
  </div>
);

export default UserDetailsPage;
