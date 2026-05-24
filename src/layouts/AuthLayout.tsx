import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { AdminBrandMark } from "@components/admin/AdminBrandMark";
import { useAppSelector } from "@redux/hooks";

/**
 * Shell for every page in the `/auth/*` tree.
 *
 * - Two-column split on desktop (hero on the left, form card on the right).
 * - Single column on mobile, with a compact brand mark.
 * - Redirects authenticated visitors straight to `/admin` so the auth pages
 *   never flash when the session is already valid.
 *
 * The layout is intentionally chrome-free — no top nav, no breadcrumbs — so
 * focus stays on the form. Page-specific eyebrow/title live in `AuthCard`.
 */
export const AuthLayout = () => {
  const location = useLocation();
  const { status, user } = useAppSelector((s) => s.auth);

  if (status === "authenticated" && user) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Left — hero */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=1600&q=80"
          alt="Superyacht at sea at dusk"
          className="absolute inset-0 h-full w-full object-cover grayscale-[40%]"
        />
        <div className="absolute inset-0 bg-ink/75" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink/60 to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <AdminBrandMark />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="max-w-md space-y-4"
          >
            <div className="eyebrow">Platform operations</div>
            <h2 className="text-[42px] font-semibold leading-[1.05] tracking-tighter2 text-white">
              The admin console for the Meridian yacht hiring platform.
            </h2>
            <p className="text-[14.5px] leading-relaxed text-grey-400">
              Verifications, moderation, disputes and platform health — managed
              from a single quiet workspace built for moderators and admins.
            </p>
          </motion.div>

          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-grey-500">
            <span>Meridian · Admin Console</span>
            <span>v1.0</span>
          </div>
        </div>
      </div>

      {/* Right — form column */}
      <div className="relative grid min-h-screen place-items-center px-6 py-12 sm:px-10">
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6 lg:hidden">
          <AdminBrandMark />
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
