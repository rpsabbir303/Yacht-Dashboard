import { Drawer } from "antd";
import { Outlet } from "react-router-dom";

import { Sidebar } from "@components/common/Sidebar";
import { Topbar } from "@components/common/Topbar";
import { CommandPalette } from "@components/admin/CommandPalette";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setMobileSidebarOpen } from "@redux/slices/uiSlice";

export const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const mobileOpen = useAppSelector((s) => s.ui.mobileSidebarOpen);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="hidden h-full lg:flex">
        <Sidebar />
      </div>

      <Drawer
        open={mobileOpen}
        placement="left"
        width={280}
        onClose={() => dispatch(setMobileSidebarOpen(false))}
        closable={false}
        styles={{ body: { padding: 0 }, content: { padding: 0 } }}
      >
        <Sidebar mobile />
      </Drawer>

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="scrollbar-thin flex-1 overflow-y-auto bg-ink px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[1320px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global ⌘K command palette — keyboard wired by useGlobalSearch */}
      <CommandPalette />
    </div>
  );
};
