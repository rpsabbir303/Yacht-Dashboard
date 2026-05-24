import { Drawer } from "antd";
import { Outlet } from "react-router-dom";

import { AdminSidebar } from "@components/admin/AdminSidebar";
import { AdminTopbar } from "@components/admin/AdminTopbar";
import { CommandPalette } from "@components/admin/CommandPalette";
import { PageTransition } from "@components/transitions/PageTransition";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setMobileSidebarOpen } from "@redux/slices/uiSlice";

/**
 * Standalone admin shell — no consumer navigation, no consumer CTAs.
 * Mounts the global ⌘K command palette inside the same context as the
 * admin pages so search results stay scoped to admin surfaces.
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
        <AdminTopbar />
        <main className="scrollbar-thin flex-1 overflow-y-auto bg-ink px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[1320px]">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
};

export default AdminLayout;
