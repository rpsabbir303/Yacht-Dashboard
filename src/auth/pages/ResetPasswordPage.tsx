import { zodResolver } from "@hookform/resolvers/zod";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { App as AntApp, Button, Input } from "antd";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Field } from "@components/form/Field";
import { AuthCard } from "@auth/components/AuthCard";
import { PasswordStrength } from "@auth/components/PasswordStrength";
import { useAuthFlow } from "@auth/hooks/useAuthFlow";
import { useResetPasswordMutation } from "@auth/services/authApi";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@auth/validation/schemas";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const { resetToken } = useAuthFlow();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { control, handleSubmit, watch, formState } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const passwordValue = watch("password");

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!resetToken) {
      message.error("Session expired — please restart the recovery flow.");
      navigate("/auth/forgot-password", { replace: true });
      return;
    }
    try {
      await resetPassword({
        resetToken,
        password: values.password,
      }).unwrap();
      navigate("/auth/success", { replace: true });
    } catch (err) {
      const apiError = err as { message?: string };
      message.error(apiError?.message ?? "Unable to reset password.");
    }
  };

  return (
    <AuthCard
      eyebrow="Reset password"
      title="Choose a new password"
      description="Pick something strong — at least 8 characters with a mix of uppercase, numbers and symbols."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field
          label="New password"
          required
          error={formState.errors.password?.message}
        >
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input
                size="large"
                type={showPw ? "text" : "password"}
                prefix={<LockOutlined className="text-grey-500" />}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="text-grey-500 transition hover:text-white"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                }
                {...field}
              />
            )}
          />
        </Field>

        <PasswordStrength value={passwordValue ?? ""} />

        <Field
          label="Confirm password"
          required
          error={formState.errors.confirmPassword?.message}
        >
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <Input
                size="large"
                type={showConfirm ? "text" : "password"}
                prefix={<LockOutlined className="text-grey-500" />}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="text-grey-500 transition hover:text-white"
                    aria-label={
                      showConfirm ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirm ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                }
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
          disabled={!formState.isValid}
        >
          Reset password
        </Button>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordPage;
