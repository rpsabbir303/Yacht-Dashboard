import { zodResolver } from "@hookform/resolvers/zod";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { App as AntApp, Button, Input } from "antd";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { z } from "zod";

import { BrandMark } from "@components/common/BrandMark";
import { Field } from "@components/form/Field";
import { useAuth } from "@hooks/useAuth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

type LoginValues = z.infer<typeof schema>;

const LoginPage = () => {
  const { signIn, isAuthenticated, isAuthenticating } = useAuth();
  const { message } = AntApp.useApp();

  const { control, handleSubmit, setValue, formState } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "alex@meridian-yachts.com", password: "demo-pass" },
  });

  useEffect(() => {
    setValue("email", "alex@meridian-yachts.com");
    setValue("password", "demo-pass");
  }, [setValue]);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (values: LoginValues) => {
    try {
      await signIn(values);
    } catch {
      message.error("Login failed — check your credentials.");
    }
  };

  return (
    <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Left — quiet visual */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=1600&q=80"
          alt="Superyacht at sea"
          className="absolute inset-0 h-full w-full object-cover grayscale-[40%]"
        />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink/60 to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <BrandMark size="lg" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="max-w-md space-y-4"
          >
            <div className="eyebrow">A calmer way to hire</div>
            <h2 className="text-[42px] font-semibold leading-[1.05] tracking-tighter2 text-white">
              The crew hiring platform built for the world's finest yachts.
            </h2>
            <p className="text-[14.5px] leading-relaxed text-grey-400">
              From captains to chief stewardesses — manage your entire
              hiring journey from one quiet, focused workspace.
            </p>
          </motion.div>

          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-grey-500">
            <span>Helm · Yacht Crew Hiring</span>
            <span>v1.0</span>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="relative grid place-items-center px-6 py-12 sm:px-10">
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6 lg:hidden">
          <BrandMark />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px]"
        >
          <div className="eyebrow">Sign in</div>
          <h1 className="mt-3 text-[28px] font-semibold tracking-tighter2 text-white">
            Welcome back
          </h1>
          <p className="muted mt-2 text-[13.5px]">
            Demo credentials are pre-filled — just click <strong className="text-white/85">Sign in</strong>.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <Field
              label="Email"
              required
              error={formState.errors.email?.message}
            >
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    size="large"
                    prefix={<MailOutlined className="text-grey-500" />}
                    placeholder="you@example.com"
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
                  <Input.Password
                    size="large"
                    prefix={<LockOutlined className="text-grey-500" />}
                    placeholder="••••••••"
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
              loading={isAuthenticating}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-8 grid grid-cols-3 items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-grey-500">
            <div className="h-px bg-white/[0.06]" />
            <span className="text-center">Or</span>
            <div className="h-px bg-white/[0.06]" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button size="large">Continue with Google</Button>
            <Button size="large">SSO</Button>
          </div>

          <p className="muted mt-10 text-center text-[11.5px]">
            By signing in you agree to our terms & privacy policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
