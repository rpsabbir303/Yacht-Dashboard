import { ArrowLeftOutlined, ClockCircleOutlined, SafetyOutlined } from "@ant-design/icons";
import { App as AntApp, Button } from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthCard } from "@auth/components/AuthCard";
import { OtpInput } from "@auth/components/OtpInput";
import { useAuthFlow } from "@auth/hooks/useAuthFlow";
import { useOtpCountdown } from "@auth/hooks/useOtpCountdown";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
} from "@auth/services/authApi";
import { cn } from "@utils/cn";

const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const head = user.slice(0, Math.min(2, user.length));
  const tail = user.length > 3 ? user.slice(-1) : "";
  return `${head}${"*".repeat(Math.max(2, user.length - head.length - tail.length))}${tail}@${domain}`;
};

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const {
    email,
    otpRequestedAt,
    otpExpiresInSec,
    refreshOtp,
    setResetToken,
  } = useAuthFlow();

  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();
  const [requestOtp, { isLoading: resending }] = useForgotPasswordMutation();

  const countdown = useOtpCountdown({
    startedAt: otpRequestedAt,
    expiresInSec: otpExpiresInSec,
  });

  useEffect(() => setErrorMessage(null), [code]);

  const handleVerify = async (raw?: string) => {
    const value = raw ?? code;
    if (!email) return;
    if (value.length !== 6) {
      setErrorMessage("Enter the full 6-digit code.");
      return;
    }
    try {
      const res = await verifyOtp({ email, code: value }).unwrap();
      setResetToken(res.resetToken);
      message.success("Verified — set your new password to continue.");
      navigate("/auth/reset-password");
    } catch (err) {
      const apiError = err as { message?: string };
      setErrorMessage(apiError?.message ?? "Incorrect code. Please try again.");
      setCode("");
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      const res = await requestOtp({ email }).unwrap();
      refreshOtp(res.expiresInSec);
      setCode("");
      setErrorMessage(null);
      message.success("A new code has been sent.");
      if (res.hintCode) {
        message.info({ content: `Demo OTP: ${res.hintCode}`, duration: 6 });
      }
    } catch (err) {
      const apiError = err as { message?: string };
      message.error(apiError?.message ?? "Unable to resend code.");
    }
  };

  return (
    <AuthCard
      eyebrow="Two-step verification"
      title="Enter the 6-digit code"
      description={
        <>
          We sent a one-time code to{" "}
          <strong className="text-white/85">
            {email ? maskEmail(email) : "your email"}
          </strong>
          . It expires shortly — check your inbox or spam folder.
        </>
      }
      footer={
        <Link
          to="/auth/forgot-password"
          className="inline-flex items-center gap-1.5 font-medium text-teal-300 hover:text-teal-200"
        >
          <ArrowLeftOutlined /> Use a different email
        </Link>
      }
    >
      <div className="space-y-6">
        <OtpInput
          value={code}
          onChange={setCode}
          autoFocus
          invalid={!!errorMessage}
          disabled={verifying || countdown.expired}
          onComplete={(full) => handleVerify(full)}
        />

        <div className="flex items-center justify-between text-[12px]">
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              countdown.expired ? "text-[#C24545]" : "text-grey-400",
            )}
          >
            <ClockCircleOutlined />
            {countdown.expired
              ? "Code expired"
              : `Expires in ${countdown.formatted}`}
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown.running || resending}
            className={cn(
              "font-medium transition",
              countdown.running || resending
                ? "cursor-not-allowed text-grey-500"
                : "text-teal-300 hover:text-teal-200",
            )}
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-[#AA2727]/40 bg-[#AA2727]/[0.08] px-3.5 py-2.5 text-[12.5px] text-[#F4C4C4]"
          >
            {errorMessage}
          </div>
        )}

        <Button
          type="primary"
          size="large"
          block
          icon={<SafetyOutlined />}
          loading={verifying}
          disabled={countdown.expired || code.length !== 6}
          onClick={() => handleVerify()}
        >
          Verify & continue
        </Button>
      </div>
    </AuthCard>
  );
};

export default OtpVerificationPage;
