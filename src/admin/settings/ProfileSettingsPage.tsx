/**
 * Profile Settings — minimal administrator profile management.
 *
 * Fields:
 *   • Profile picture (upload / remove)
 *   • Full name
 *   • Email address
 *   • Phone number
 *
 * Save persists to the auth slice via `setSession`. Backend is mocked.
 */

import {
  CameraOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Input, message } from "antd";
import { useMemo, useRef, useState } from "react";

import { GlassPanel } from "@components/common/GlassPanel";
import { Field } from "@components/form/Field";
import { useAuth } from "@hooks/useAuth";
import { useAppDispatch } from "@redux/hooks";
import { setSession } from "@redux/slices/authSlice";
import { initials } from "@utils/format";
import { cn } from "@utils/cn";

/* ================================================================ */
/*  Photo upload                                                     */
/* ================================================================ */

interface PhotoUploadProps {
  fullName: string;
  avatarUrl: string | undefined;
  onChange: (dataUrl: string | undefined) => void;
}

const PhotoUpload = ({ fullName, avatarUrl, onChange }: PhotoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = () => inputRef.current?.click();
  const remove = () => onChange(undefined);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      message.error("Please choose an image file");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      message.error("Image must be smaller than 4 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-wrap items-start gap-5">
      <div className="relative">
        <div
          className={cn(
            "grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-white/[0.08]",
            avatarUrl ? "bg-transparent" : "bg-white/[0.05]",
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[22px] font-semibold text-grey-400">
              {initials(fullName)}
            </span>
          )}
        </div>
        <button
          onClick={pick}
          className="icon-btn icon-btn-sm absolute -bottom-1.5 -right-1.5 h-7 w-7"
          aria-label="Change photo"
        >
          <CameraOutlined />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-white">Profile photo</div>
        <p className="mt-0.5 text-[12px] text-grey-500">
          PNG, JPG up to 4 MB. Square images at least 256×256 render best.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Button icon={<CameraOutlined />} onClick={pick}>
            Upload new
          </Button>
          {avatarUrl && (
            <Button icon={<DeleteOutlined />} danger onClick={remove}>
              Remove
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
};

/* ================================================================ */
/*  Page                                                             */
/* ================================================================ */

export const ProfileSettingsPage = () => {
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAuth();

  // Seed local form state from the signed-in admin.
  const initial = useMemo(
    () => ({
      avatarUrl: user?.avatarUrl,
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    }),
    [user],
  );

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    initial.avatarUrl,
  );
  const [fullName, setFullName] = useState(initial.fullName);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [saving, setSaving] = useState(false);

  const dirty =
    avatarUrl !== initial.avatarUrl ||
    fullName !== initial.fullName ||
    email !== initial.email ||
    phone !== initial.phone;

  const cancel = () => {
    setAvatarUrl(initial.avatarUrl);
    setFullName(initial.fullName);
    setEmail(initial.email);
    setPhone(initial.phone);
  };

  const save = async () => {
    if (!user || !accessToken) return;
    if (!fullName.trim()) {
      message.error("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      message.error("Please enter your email address");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    dispatch(
      setSession({
        user: { ...user, fullName, email, phone, avatarUrl },
        accessToken,
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      }),
    );
    setSaving(false);
    message.success("Profile updated");
  };

  return (
    <GlassPanel padding="lg">
      <header className="mb-5 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-grey-400">
          <UserOutlined />
        </span>
        <div>
          <h3 className="text-[15px] font-semibold text-white">
            Profile information
          </h3>
          <p className="text-[12px] text-grey-500">
            How you appear across the admin console.
          </p>
        </div>
      </header>

      <PhotoUpload
        fullName={fullName || "Admin"}
        avatarUrl={avatarUrl}
        onChange={setAvatarUrl}
      />

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Full name" required className="md:col-span-2">
          <Input
            prefix={<UserOutlined className="text-grey-500" />}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </Field>
        <Field label="Email address" required>
          <Input
            prefix={<MailOutlined className="text-grey-500" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@meridian.app"
            type="email"
          />
        </Field>
        <Field label="Phone number">
          <Input
            prefix={<PhoneOutlined className="text-grey-500" />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+377 6 12 34 56 78"
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-5">
        <div className="flex items-center gap-2 text-[11.5px] text-grey-500">
          {dirty ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              <span>Unsaved changes</span>
            </>
          ) : (
            <>
              <CheckCircleFilled className="text-teal-400" />
              <span>All changes saved</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={cancel} disabled={!dirty || saving}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={save}
            disabled={!dirty}
          >
            Save changes
          </Button>
        </div>
      </div>
    </GlassPanel>
  );
};

export default ProfileSettingsPage;
