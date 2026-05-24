import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftOutlined, MailOutlined } from "@ant-design/icons";
import { App as AntApp, Button, Input } from "antd";
import { Controller, useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Field } from "@components/form/Field";
import { AuthCard } from "@auth/components/AuthCard";
import { useAuthFlow } from "@auth/hooks/useAuthFlow";
import { useForgotPasswordMutation } from "@auth/services/authApi";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@auth/validation/schemas";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = AntApp.useApp();
  const { startRecovery, email: storedEmail } = useAuthFlow();
  const [requestOtp, { isLoading }] = useForgotPasswordMutation();

  const prefillEmail =
    (location.state as { email?: string } | null)?.email ?? storedEmail ?? "";

  const { control, handleSubmit, formState } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: prefillEmail },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    const email = values.email.trim().toLowerCase();
    try {
      const res = await requestOtp({ email }).unwrap();
      startRecovery(email, res.expiresInSec);
      message.success({
        content: `Verification code sent to ${email}.`,
        duration: 3,
      });
      if (res.hintCode) {
        // Demo helper — surfaced once so QA can complete the flow without a
        // mailbox; harmless in production because the server never returns it.
        message.info({
          content: `Demo OTP: ${res.hintCode}`,
          duration: 6,
        });
      }
      navigate("/auth/verify-otp");
    } catch (err) {
      const apiError = err as { message?: string };
      message.error(apiError?.message ?? "Unable to send code. Try again.");
    }
  };

  return (
    <AuthCard
      eyebrow="Recover access"
      title="Forgot password?"
      description="Enter the email tied to your admin account and we'll send a one-time verification code."
      footer={
        <Link
          to="/auth/sign-in"
          className="inline-flex items-center gap-1.5 font-medium text-teal-300 hover:text-teal-200"
        >
          <ArrowLeftOutlined /> Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field
          label="Work email"
          required
          error={formState.errors.email?.message}
          hint="We'll send a 6-digit code that expires shortly."
        >
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                size="large"
                prefix={<MailOutlined className="text-grey-500" />}
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
                {...field}
              />
            )}
          />
        </Field>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={isLoading}
        >
          Send OTP
        </Button>
      </form>
    </AuthCard>
  );
};

export default ForgotPasswordPage;
