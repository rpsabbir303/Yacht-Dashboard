/**
 * Security Settings — change password only.
 *
 * Backend is mocked. Validation requires:
 *   • Current password is ≥ 8 chars
 *   • New password scores above "weak"
 *   • Confirmation matches
 */

import {
  EyeInvisibleOutlined,
  EyeOutlined,
  KeyOutlined,
  LockOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { Button, Input, message } from "antd";
import { useState } from "react";

import { GlassPanel } from "@components/common/GlassPanel";
import { Field } from "@components/form/Field";
import { PasswordStrength } from "@auth/components/PasswordStrength";
import { scorePassword } from "@auth/validation/passwordStrength";

const ChangePasswordCard = () => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const score = scorePassword(next);
  const matches = next.length > 0 && next === confirm;
  const valid =
    current.length >= 8 &&
    next.length >= 8 &&
    score.tier !== "weak" &&
    matches;

  const submit = async () => {
    if (!valid) {
      message.error("Please fix the validation errors first");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    message.success("Password updated successfully");
  };

  return (
    <GlassPanel padding="lg">
      <header className="mb-5 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-grey-400">
          <LockOutlined />
        </span>
        <div>
          <h3 className="text-[15px] font-semibold text-white">
            Change password
          </h3>
          <p className="text-[12px] text-grey-500">
            Use at least 8 characters with mixed case, a number and a symbol.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Current password" required className="md:col-span-2">
          <Input
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            prefix={<LockOutlined className="text-grey-500" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="text-grey-400 transition hover:text-white"
                aria-label={
                  showCurrent ? "Hide password" : "Show password"
                }
              >
                {showCurrent ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            }
            placeholder="••••••••••••"
            autoComplete="current-password"
          />
        </Field>

        <Field
          label="New password"
          required
          error={
            next.length > 0 && next.length < 8
              ? "Password must be at least 8 characters"
              : undefined
          }
        >
          <Input
            type={showNext ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            prefix={<KeyOutlined className="text-grey-500" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowNext((v) => !v)}
                className="text-grey-400 transition hover:text-white"
                aria-label={showNext ? "Hide password" : "Show password"}
              >
                {showNext ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            }
            placeholder="Choose a strong password"
            autoComplete="new-password"
          />
        </Field>

        <Field
          label="Confirm new password"
          required
          error={
            confirm.length > 0 && !matches
              ? "Passwords do not match"
              : undefined
          }
        >
          <Input
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            prefix={<KeyOutlined className="text-grey-500" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-grey-400 transition hover:text-white"
                aria-label={
                  showConfirm ? "Hide password" : "Show password"
                }
              >
                {showConfirm ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            }
            placeholder="Repeat new password"
            autoComplete="new-password"
          />
        </Field>
      </div>

      {next.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <PasswordStrength value={next} />
        </div>
      )}

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button
          type="primary"
          icon={<SafetyOutlined />}
          loading={saving}
          onClick={submit}
          disabled={!valid}
        >
          Update password
        </Button>
      </div>
    </GlassPanel>
  );
};

export const SecuritySettingsPage = () => <ChangePasswordCard />;

export default SecuritySettingsPage;
