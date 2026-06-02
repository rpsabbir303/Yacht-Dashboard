import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "@layouts/AdminLayout";
import { AuthLayout } from "@layouts/AuthLayout";
import { PageLoader } from "@components/feedback/PageLoader";
import { RequireFlowStep } from "@auth/components/RequireFlowStep";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";

/* ---- Auth flow ---- */
const SignInPage = lazy(() => import("@auth/pages/SignInPage"));
const ForgotPasswordPage = lazy(() => import("@auth/pages/ForgotPasswordPage"));
const OtpVerificationPage = lazy(
  () => import("@auth/pages/OtpVerificationPage"),
);
const ResetPasswordPage = lazy(() => import("@auth/pages/ResetPasswordPage"));
const ResetSuccessPage = lazy(() => import("@auth/pages/ResetSuccessPage"));

/* ---- Misc public ---- */
const NotFoundPage = lazy(() => import("@pages/NotFound/NotFoundPage"));

/* ---- Admin console ---- */
const AdminDashboardPage = lazy(
  () => import("@admin/dashboard/AdminDashboardPage"),
);
const CrewManagementPage = lazy(
  () => import("@admin/crew/CrewManagementPage"),
);
const CrewProfilePage = lazy(() => import("@admin/crew/CrewProfilePage"));
const OwnerVerificationPage = lazy(
  () => import("@admin/owners/OwnerVerificationPage"),
);
const JobManagementPage = lazy(() => import("@admin/jobs/JobManagementPage"));
const JobDetailsPage = lazy(() => import("@admin/jobs/JobDetailsPage"));
const ApplicationsPage = lazy(
  () => import("@admin/applications/ApplicationsPage"),
);
const AdminNotificationsPage = lazy(
  () => import("@admin/notifications/NotificationsPage"),
);
const AnalyticsPage = lazy(() => import("@admin/analytics/AnalyticsPage"));
const SupportCenterPage = lazy(
  () => import("@admin/support/SupportCenterPage"),
);
const TicketDetailsPage = lazy(
  () => import("@admin/support/TicketDetailsPage"),
);
const SettingsLayout = lazy(() => import("@admin/settings/SettingsLayout"));
const ProfileSettingsPage = lazy(
  () => import("@admin/settings/ProfileSettingsPage"),
);
const SecuritySettingsPage = lazy(
  () => import("@admin/settings/SecuritySettingsPage"),
);
const PlatformSettingsPage = lazy(
  () => import("@admin/settings/PlatformSettingsPage"),
);

/**
 * The dashboard is admin-only — every authenticated route lives under
 * `/admin/*` inside `AdminLayout`. The `/auth/*` tree hosts the public sign-in
 * and password-recovery flow inside the dedicated `AuthLayout`. Legacy
 * `/login` is preserved as a redirect for back-compat.
 */
export const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Root + legacy redirects */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<Navigate to="/auth/sign-in" replace />} />

      {/* -------- Auth flow (public) -------- */}
      <Route element={<AuthLayout />}>
        <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route
          path="/auth/forgot-password"
          element={<ForgotPasswordPage />}
        />
        <Route
          path="/auth/verify-otp"
          element={
            <RequireFlowStep step="otp">
              <OtpVerificationPage />
            </RequireFlowStep>
          }
        />
        <Route
          path="/auth/reset-password"
          element={
            <RequireFlowStep step="reset">
              <ResetPasswordPage />
            </RequireFlowStep>
          }
        />
        <Route
          path="/auth/success"
          element={
            <RequireFlowStep step="success">
              <ResetSuccessPage />
            </RequireFlowStep>
          }
        />
      </Route>

      {/* -------- Admin console (protected) -------- */}
      <Route
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />

        <Route
          path="/admin/crew"
          element={
            <AdminRoute required="crew.read">
              <CrewManagementPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/crew/:id"
          element={
            <AdminRoute required="crew.read">
              <CrewProfilePage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/owners"
          element={
            <AdminRoute required="owners.read">
              <OwnerVerificationPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <AdminRoute required="jobs.read">
              <JobManagementPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/jobs/:id"
          element={
            <AdminRoute required="jobs.read">
              <JobDetailsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <AdminRoute required="applications.read">
              <ApplicationsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <AdminRoute required="support.read">
              <SupportCenterPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/support/:id"
          element={
            <AdminRoute required="support.read">
              <TicketDetailsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <AdminRoute required="announcements.send">
              <AdminNotificationsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute required="analytics.read">
              <AnalyticsPage />
            </AdminRoute>
          }
        />
        <Route path="/admin/settings" element={<SettingsLayout />}>
          <Route
            index
            element={<Navigate to="/admin/settings/profile" replace />}
          />
          <Route path="profile" element={<ProfileSettingsPage />} />
          <Route path="security" element={<SecuritySettingsPage />} />
          <Route path="platform" element={<PlatformSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);
