import {
  BellOutlined,
  CameraOutlined,
  LockOutlined,
  SafetyOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  App as AntApp,
  Avatar,
  Button,
  Input,
  Segmented,
  Switch,
  Upload,
  type UploadFile,
} from "antd";
import { useState } from "react";

import { Field } from "@components/form/Field";
import { GlassPanel } from "@components/common/GlassPanel";
import { PageHeader } from "@components/common/PageHeader";
import { useAppSelector } from "@redux/hooks";
import { initials } from "@utils/format";

type Section = "profile" | "yacht" | "notifications" | "security";

const SettingsPage = () => {
  const { message } = AntApp.useApp();
  const user = useAppSelector((s) => s.auth.user);
  const [section, setSection] = useState<Section>("profile");

  // Notification prefs (local-only for the demo)
  const [emailNew, setEmailNew] = useState(true);
  const [emailMessage, setEmailMessage] = useState(true);
  const [pushAll, setPushAll] = useState(true);
  const [marketing, setMarketing] = useState(false);

  // Yacht gallery (local-only)
  const [files, setFiles] = useState<UploadFile[]>([
    {
      uid: "1",
      name: "aurora.jpg",
      status: "done",
      url: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=70",
    },
    {
      uid: "2",
      name: "equinox.jpg",
      status: "done",
      url: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=600&q=70",
    },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        subtitle="Manage your profile, yacht details, notifications and security."
      />

      <Segmented
        value={section}
        onChange={(v) => setSection(v as Section)}
        options={[
          { label: "Profile", value: "profile", icon: <UserOutlined /> },
          { label: "Yacht / Company", value: "yacht", icon: <SafetyOutlined /> },
          { label: "Notifications", value: "notifications", icon: <BellOutlined /> },
          { label: "Security", value: "security", icon: <LockOutlined /> },
        ]}
      />

      {section === "profile" && (
        <GlassPanel padding="lg" className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar size={120} src={user?.avatarUrl}>
                  {initials(user?.fullName ?? "U")}
                </Avatar>
                <Button
                  size="small"
                  shape="circle"
                  icon={<CameraOutlined />}
                  className="!absolute !bottom-1 !right-1 !shadow-glow"
                />
              </div>
              <h3 className="font-display text-lg text-white">
                {user?.fullName}
              </h3>
              <span className="text-xs uppercase tracking-wider text-slate-400">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:col-span-2 md:grid-cols-2">
            <Field label="Full name">
              <Input size="large" defaultValue={user?.fullName} />
            </Field>
            <Field label="Email">
              <Input size="large" defaultValue={user?.email} />
            </Field>
            <Field label="Company">
              <Input size="large" defaultValue={user?.companyName} />
            </Field>
            <Field label="Phone">
              <Input size="large" defaultValue={user?.phone} />
            </Field>
            <Field label="Headline" className="md:col-span-2">
              <Input
                size="large"
                placeholder="e.g. Founder · Meridian Yachting Group"
              />
            </Field>
            <div className="md:col-span-2 flex justify-end">
              <Button
                type="primary"
                size="large"
                onClick={() => message.success("Profile updated")}
                className="!rounded-xl !shadow-glow"
              >
                Save changes
              </Button>
            </div>
          </div>
        </GlassPanel>
      )}

      {section === "yacht" && (
        <GlassPanel padding="lg" className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Company name">
              <Input size="large" defaultValue={user?.companyName} />
            </Field>
            <Field label="Tax / VAT">
              <Input size="large" placeholder="EU000000000" />
            </Field>
            <Field label="Registered address" className="md:col-span-2">
              <Input size="large" placeholder="Street, City, Country" />
            </Field>
            <Field label="About" className="md:col-span-2">
              <Input.TextArea
                rows={4}
                placeholder="A short story about your fleet and culture..."
              />
            </Field>
          </div>

          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-300/80">
              Yacht photo gallery
            </div>
            <Upload
              listType="picture-card"
              fileList={files}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFiles(fileList)}
              multiple
            >
              <div className="flex flex-col items-center gap-1 text-slate-300">
                <UploadOutlined />
                <span className="text-xs">Upload</span>
              </div>
            </Upload>
          </div>

          <div className="flex justify-end">
            <Button
              type="primary"
              size="large"
              onClick={() => message.success("Company profile saved")}
              className="!rounded-xl !shadow-glow"
            >
              Save
            </Button>
          </div>
        </GlassPanel>
      )}

      {section === "notifications" && (
        <GlassPanel padding="lg" className="space-y-3">
          <Pref
            title="New application emails"
            description="Receive an email whenever a crew member applies."
            value={emailNew}
            onChange={setEmailNew}
          />
          <Pref
            title="Message emails"
            description="Email me when I receive a new message."
            value={emailMessage}
            onChange={setEmailMessage}
          />
          <Pref
            title="In-app push notifications"
            description="Browser notifications for all activity."
            value={pushAll}
            onChange={setPushAll}
          />
          <Pref
            title="Marketing updates"
            description="Occasional updates on platform features."
            value={marketing}
            onChange={setMarketing}
          />
        </GlassPanel>
      )}

      {section === "security" && (
        <GlassPanel padding="lg" className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Current password">
              <Input.Password size="large" />
            </Field>
            <div />
            <Field label="New password">
              <Input.Password size="large" />
            </Field>
            <Field label="Confirm new password">
              <Input.Password size="large" />
            </Field>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div>
              <div className="font-medium text-white">Two-factor authentication</div>
              <p className="muted text-sm">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex justify-end">
            <Button
              type="primary"
              size="large"
              onClick={() => message.success("Password updated")}
              className="!rounded-xl !shadow-glow"
            >
              Update password
            </Button>
          </div>
        </GlassPanel>
      )}
    </div>
  );
};

const Pref = ({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
    <div className="min-w-0">
      <div className="font-medium text-white">{title}</div>
      <p className="muted text-sm">{description}</p>
    </div>
    <Switch checked={value} onChange={onChange} />
  </div>
);

export default SettingsPage;
