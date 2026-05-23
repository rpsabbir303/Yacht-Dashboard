import { MenuOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

import { NotificationDropdown } from "@components/common/NotificationDropdown";
import { useAppDispatch } from "@redux/hooks";
import { setCommandPaletteOpen, setMobileSidebarOpen } from "@redux/slices/uiSlice";

export const Topbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-ink/85 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-8">
        <button
          onClick={() => dispatch(setMobileSidebarOpen(true))}
          className="grid h-10 w-10 place-items-center rounded-xl text-grey-400 transition hover:bg-white/[0.04] hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <MenuOutlined />
        </button>

        {/* Search trigger — opens the command palette */}
        <button
          type="button"
          onClick={() => dispatch(setCommandPaletteOpen(true))}
          className="group ml-auto flex h-10 w-full max-w-xl flex-1 items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.015] px-3.5 text-left text-grey-500 transition hover:border-white/[0.1] hover:bg-white/[0.025] hover:text-grey-400 sm:ml-0"
          aria-label="Open search"
        >
          <SearchOutlined />
          <span className="flex-1 truncate text-[13px]">
            Search crew, jobs, users, reports…
          </span>
          <kbd className="hidden rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-grey-500 group-hover:text-grey-400 sm:inline-flex">
            ⌘ K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-2 sm:ml-4">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/jobs/new")}
            className="hidden !h-10 !rounded-xl sm:inline-flex"
          >
            <span className="hidden md:inline">Post a job</span>
            <span className="md:hidden">New</span>
          </Button>
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
};
