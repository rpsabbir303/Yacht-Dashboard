import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "@layouts/DashboardLayout";
import { PageLoader } from "@components/feedback/PageLoader";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";

const LoginPage = lazy(() => import("@pages/Login/LoginPage"));
const DashboardPage = lazy(() => import("@modules/dashboard/DashboardPage"));
const JobsListPage = lazy(() => import("@modules/jobs/JobsListPage"));
const JobCreatePage = lazy(() => import("@modules/jobs/JobCreatePage"));
const JobDetailsPage = lazy(() => import("@modules/jobs/JobDetailsPage"));
const CrewListPage = lazy(() => import("@modules/crew/CrewListPage"));
const CrewProfilePage = lazy(() => import("@modules/crew/CrewProfilePage"));
const ApplicationsPage = lazy(
  () => import("@modules/applications/ApplicationsPage"),
);
const MessagesPage = lazy(() => import("@modules/messaging/MessagesPage"));
const SchedulePage = lazy(() => import("@modules/schedule/SchedulePage"));
const NotificationsPage = lazy(
  () => import("@modules/notifications/NotificationsPage"),
);
const SettingsPage = lazy(() => import("@modules/settings/SettingsPage"));
const NotFoundPage = lazy(() => import("@pages/NotFound/NotFoundPage"));

/* ---------------- Admin (lazy) ---------------- */
const AdminIndexRedirect = lazy(
  () => import("@modules/admin/AdminIndexRedirect"),
);
const VerificationsPage = lazy(
  () => import("@modules/admin/verifications/VerificationsPage"),
);
const UsersListPage = lazy(
  () => import("@modules/admin/users/UsersListPage"),
);
const UserDetailsPage = lazy(
  () => import("@modules/admin/users/UserDetailsPage"),
);
const ReportedJobsPage = lazy(
  () => import("@modules/admin/moderation/ReportedJobsPage"),
);
const ModerationPage = lazy(
  () => import("@modules/admin/moderation/ModerationPage"),
);
const DisputesPage = lazy(
  () => import("@modules/admin/disputes/DisputesPage"),
);
const AnnouncementsPage = lazy(
  () => import("@modules/admin/announcements/AnnouncementsPage"),
);
const AnalyticsPage = lazy(
  () => import("@modules/admin/analytics/AnalyticsPage"),
);
const SecurityPage = lazy(
  () => import("@modules/admin/security/SecurityPage"),
);

export const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/jobs" element={<JobsListPage />} />
        <Route
          path="/jobs/new"
          element={
            <ProtectedRoute allow={["owner", "agent", "captain", "admin"]}>
              <JobCreatePage />
            </ProtectedRoute>
          }
        />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />

        <Route path="/crew" element={<CrewListPage />} />
        <Route path="/crew/:id" element={<CrewProfilePage />} />

        <Route path="/applications" element={<ApplicationsPage />} />

        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:conversationId" element={<MessagesPage />} />

        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* ---------------- ADMIN ---------------- */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminIndexRedirect />
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
        <Route
          path="/admin/verifications"
          element={
            <AdminRoute required="verifications.read">
              <VerificationsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute required="users.read">
              <UsersListPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <AdminRoute required="users.read">
              <UserDetailsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reported-jobs"
          element={
            <AdminRoute required="moderation.read">
              <ReportedJobsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <AdminRoute required="moderation.read">
              <ModerationPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/disputes"
          element={
            <AdminRoute required="disputes.read">
              <DisputesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <AdminRoute required="announcements.send">
              <AnnouncementsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/security"
          element={
            <AdminRoute required="security.read">
              <SecurityPage />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);
