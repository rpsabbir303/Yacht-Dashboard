import { Drawer } from "antd";
import { Outlet } from "react-router-dom";

import { AdminPageContent } from "@components/admin/AdminPageContent";
import { AdminSidebar } from "@components/admin/AdminSidebar";
import { PageTransition } from "@components/transitions/PageTransition";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setMobileSidebarOpen } from "@redux/slices/uiSlice";

/**
 * Standalone admin shell — no consumer navigation, no consumer CTAs.
 * Mounts admin pages inside a consistent shell with sidebar navigation.
 */
export const AdminLayout = () => {
  const dispatch = useAppDispatch();
  const mobileOpen = useAppSelector((s) => s.ui.mobileSidebarOpen);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="hidden h-full lg:flex">
        <AdminSidebar />
      </div>

      <Drawer
        open={mobileOpen}
        placement="left"
        width={280}
        onClose={() => dispatch(setMobileSidebarOpen(false))}
        closable={false}
        styles={{ body: { padding: 0 }, content: { padding: 0 } }}
      >
        <AdminSidebar mobile />
      </Drawer>

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <main className="scrollbar-thin flex-1 overflow-y-auto bg-ink">
          <AdminPageContent>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </AdminPageContent>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
