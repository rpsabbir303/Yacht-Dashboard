import {
  BellOutlined,
  CheckOutlined,
  GlobalOutlined,
  LockOutlined,
  MailOutlined,
  NotificationOutlined,
  SafetyOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  InputNumber,
  Segmented,
  Select,
  Switch,
  message,
} from "antd";
import { useState } from "react";

import { PageHeader } from "@components/common/PageHeader";
import { GlassPanel } from "@components/common/GlassPanel";
import { Field } from "@components/form/Field";
import { cn } from "@utils/cn";

type Tab = "system" | "security" | "notifications";

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "system", label: "System", icon: <SettingOutlined /> },
  { value: "security", label: "Security", icon: <SafetyOutlined /> },
  { value: "notifications", label: "Notifications", icon: <BellOutlined /> },
];

export const PlatformSettingsPage = () => {
  const [tab, setTab] = useState<Tab>("system");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    message.success("Settings saved");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Platform settings"
        subtitle="Configure system, security and notification defaults for the entire platform."
        actions={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            Save changes
          </Button>
        }
      />

      <div className="mb-5">
        <Segmented
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          options={TABS.map((t) => ({
            value: t.value,
            label: (
              <span className="inline-flex items-center gap-2">
                {t.icon}
                {t.label}
              </span>
            ),
          }))}
        />
      </div>

      {tab === "system" && <SystemSettings />}
      {tab === "security" && <SecuritySettings />}
      {tab === "notifications" && <NotificationSettings />}
    </div>
  );
};

/* ---------------- System ---------------- */

const SystemSettings = () => (
  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
    <Group
      title="General"
      hint="Platform identity"
      icon={<GlobalOutlined />}
    >
      <Field label="Platform name">
        <Input defaultValue="Meridian Yachts" />
      </Field>
      <Field label="Support email" hint="Shown in user-facing emails and footer.">
        <Input prefix={<MailOutlined />} defaultValue="support@meridian.app" />
      </Field>
      <Field label="Default currency">
        <Select
          defaultValue="EUR"
          options={[
            { value: "EUR", label: "Euro (€)" },
            { value: "USD", label: "US Dollar ($)" },
            { value: "GBP", label: "British Pound (£)" },
          ]}
        />
      </Field>
      <Field label="Default timezone">
        <Select
          defaultValue="Europe/Monaco"
          options={[
            { value: "Europe/Monaco", label: "Europe/Monaco" },
            { value: "Europe/London", label: "Europe/London" },
            { value: "America/Fort_Lauderdale", label: "America/Fort Lauderdale" },
            { value: "UTC", label: "UTC" },
          ]}
        />
      </Field>
    </Group>

    <Group
      title="Platform operations"
      hint="Limits & moderation"
      icon={<SettingOutlined />}
    >
      <ToggleRow
        label="Maintenance mode"
        hint="Show a banner across the platform and block non-admin writes."
        defaultChecked={false}
      />
      <ToggleRow
        label="Allow new registrations"
        hint="Disable to temporarily freeze sign-ups."
        defaultChecked
      />
      <ToggleRow
        label="Auto-publish new job posts"
        hint="If disabled, all new postings enter manual review."
        defaultChecked
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Max active jobs per owner">
          <InputNumber min={1} max={500} defaultValue={20} className="w-full" />
        </Field>
        <Field label="Max applications per crew / day">
          <InputNumber min={1} max={200} defaultValue={25} className="w-full" />
        </Field>
      </div>
    </Group>
  </div>
);

/* ---------------- Security ---------------- */

const SecuritySettings = () => (
  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
    <Group
      title="Authentication"
      hint="Sessions and password policy"
      icon={<LockOutlined />}
    >
      <ToggleRow
        label="Require 2FA for admins"
        hint="Super-admins, moderators and support agents must enable TOTP."
        defaultChecked
      />
      <ToggleRow
        label="Require 2FA for owners"
        hint="Captains and owners are asked to enable 2FA at next login."
        defaultChecked={false}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Session lifetime (hours)">
          <InputNumber min={1} max={720} defaultValue={72} className="w-full" />
        </Field>
        <Field label="Idle timeout (minutes)">
          <InputNumber min={5} max={240} defaultValue={30} className="w-full" />
        </Field>
      </div>
      <Field label="Minimum password length">
        <InputNumber min={8} max={64} defaultValue={12} className="w-full" />
      </Field>
    </Group>

    <Group
      title="Anti-abuse"
      hint="Rate limits, anomaly detection"
      icon={<SafetyOutlined />}
    >
      <ToggleRow
        label="IP rate limiting"
        hint="Throttle login attempts per IP."
        defaultChecked
      />
      <ToggleRow
        label="Block disposable email domains"
        hint="Reject sign-ups from known temporary email providers."
        defaultChecked
      />
      <ToggleRow
        label="Notify admins on suspicious login"
        hint="Send an alert when unusual geo or device is detected."
        defaultChecked
      />
      <Field label="Failed login lockout">
        <Select
          defaultValue="5-attempts-15m"
          options={[
            { value: "3-attempts-5m", label: "3 attempts → 5 min lockout" },
            { value: "5-attempts-15m", label: "5 attempts → 15 min lockout" },
            { value: "10-attempts-1h", label: "10 attempts → 1 hr lockout" },
          ]}
        />
      </Field>
    </Group>
  </div>
);

/* ---------------- Notifications ---------------- */

const NotificationSettings = () => (
  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
    <Group
      title="Default channels"
      hint="What admins broadcast on by default"
      icon={<NotificationOutlined />}
    >
      <ToggleRow label="In-app inbox" hint="Always available" defaultChecked />
      <ToggleRow label="Email" hint="Transactional & digests" defaultChecked />
      <ToggleRow label="Push" hint="Mobile only" defaultChecked />
      <Field
        label="Digest cadence"
        hint="How often to bundle non-critical notifications into a single email."
      >
        <Select
          defaultValue="daily"
          options={[
            { value: "off", label: "Off — send immediately" },
            { value: "daily", label: "Daily at 09:00 local" },
            { value: "weekly", label: "Weekly on Monday" },
          ]}
        />
      </Field>
    </Group>

    <Group
      title="Provider"
      hint="Mock provider keys"
      icon={<MailOutlined />}
    >
      <Field label="Email sender">
        <Input
          prefix={<MailOutlined />}
          defaultValue="Meridian <no-reply@meridian.app>"
        />
      </Field>
      <Field label="Email provider">
        <Select
          defaultValue="postmark"
          options={[
            { value: "postmark", label: "Postmark" },
            { value: "sendgrid", label: "SendGrid" },
            { value: "ses", label: "Amazon SES" },
          ]}
        />
      </Field>
      <Field label="Push provider">
        <Select
          defaultValue="fcm"
          options={[
            { value: "fcm", label: "Firebase Cloud Messaging" },
            { value: "onesignal", label: "OneSignal" },
          ]}
        />
      </Field>
      <Field label="API key" hint="Stored encrypted server-side.">
        <Input.Password placeholder="••••••••••••••••" defaultValue="mock_key_28af" />
      </Field>
    </Group>
  </div>
);

/* ---------------- Building blocks ---------------- */

const Group = ({
  title,
  hint,
  icon,
  children,
}: {
  title: string;
  hint: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <GlassPanel padding="lg">
    <header className="mb-5 flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-grey-400">
        {icon}
      </span>
      <div>
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
        <p className="text-[12px] text-grey-500">{hint}</p>
      </div>
    </header>
    <div className="space-y-4">{children}</div>
  </GlassPanel>
);

const ToggleRow = ({
  label,
  hint,
  defaultChecked,
}: {
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) => {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border px-3.5 py-3 transition",
        on
          ? "border-teal-500/15 bg-teal-500/[0.025]"
          : "border-white/[0.04] bg-white/[0.015]",
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-white">
          {label}
          {on && <CheckOutlined className="text-teal-300" />}
        </div>
        {hint && <div className="mt-0.5 text-[11.5px] text-grey-500">{hint}</div>}
      </div>
      <Switch checked={on} onChange={setOn} />
    </div>
  );
};

export default PlatformSettingsPage;
