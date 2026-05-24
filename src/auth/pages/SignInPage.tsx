import { zodResolver } from "@hookform/resolvers/zod";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { App as AntApp, Button, Checkbox, Input } from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Field } from "@components/form/Field";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setAuthError, setSession } from "@redux/slices/authSlice";
import { AuthCard } from "@auth/components/AuthCard";
import { useRememberMe } from "@auth/hooks/useRememberMe";
import { useLoginMutation } from "@auth/services/authApi";
import {
  signInSchema,
  type SignInValues,
} from "@auth/validation/schemas";

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { message } = AntApp.useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMutation, { isLoading }] = useLoginMutation();
  const formError = useAppSelector((s) => s.auth.error);
  const remember = useRememberMe();

  const { control, handleSubmit, formState, setValue, watch } =
    useForm<SignInValues>({
      resolver: zodResolver(signInSchema),
      defaultValues: {
        email: remember.read() ?? "alex@meridian-yachts.com",
        password: "demo-pass",
        remember: !!remember.read(),
      },
    });

  const emailValue = watch("email");

  useEffect(() => {
    // Hint the demo password for first-time visitors only.
    if (!remember.read()) setValue("password", "demo-pass");
  }, [remember, setValue]);

  const redirectTarget = (location.state as { from?: string } | null)?.from ?? "/admin";

  const onSubmit = async (values: SignInValues) => {
    dispatch(setAuthError(null));
    try {
      const session = await loginMutation({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap();
      dispatch(setSession(session));
      if (values.remember) remember.save(values.email);
      else remember.clear();
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      const apiError = err as { message?: string };
      const text = apiError?.message ?? "Sign-in failed — please try again.";
      dispatch(setAuthError(text));
      message.error(text);
    }
  };

  return (
    <AuthCard
      eyebrow="Admin sign in"
      title="Welcome back"
      description="Sign in to manage verifications, moderation and platform health."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field label="Email" required error={formState.errors.email?.message}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                size="large"
                prefix={<MailOutlined className="text-grey-500" />}
                placeholder="you@company.com"
                autoComplete="email"
                {...field}
              />
            )}
          />
        </Field>

        <Field
          label="Password"
          required
          error={formState.errors.password?.message}
        >
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input
                size="large"
                type={showPassword ? "text" : "password"}
                prefix={<LockOutlined className="text-grey-500" />}
                placeholder="••••••••"
                autoComplete="current-password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-grey-500 transition hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                }
                {...field}
              />
            )}
          />
        </Field>

        <div className="flex items-center justify-between">
          <Controller
            control={control}
            name="remember"
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              >
                <span className="text-[12.5px] text-grey-400">Remember me</span>
              </Checkbox>
            )}
          />
          <Link
            to="/auth/forgot-password"
            state={emailValue ? { email: emailValue } : undefined}
            className="text-[12.5px] font-medium text-teal-300 hover:text-teal-200"
          >
            Forgot password?
          </Link>
        </div>

        {formError && (
          <div
            className="rounded-xl border border-[#AA2727]/40 bg-[#AA2727]/[0.08] px-3.5 py-2.5 text-[12.5px] text-[#F4C4C4]"
            role="alert"
          >
            {formError}
          </div>
        )}

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={isLoading}
        >
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
};

export default SignInPage;
