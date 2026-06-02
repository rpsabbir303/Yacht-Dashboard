import { ArrowLeftOutlined, MenuOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { PageHeaderToolbar } from "@components/admin/PageHeaderToolbar";
import { useAppDispatch } from "@redux/hooks";
import { setMobileSidebarOpen } from "@redux/slices/uiSlice";
import { cn } from "@utils/cn";

export type PageHeaderSection =
  | "ADMIN"
  | "OPERATIONS"
  | "SYSTEM"
  | "INTELLIGENCE";

interface BackLink {
  label: string;
  to: string;
}

interface Props {
  section: PageHeaderSection | string;
  title: string;
  description?: string;
  /** Optional back link shown above the section label. */
  back?: BackLink;
  /** Page-specific actions (buttons, badges) — rendered below the main header row. */
  extra?: ReactNode;
  className?: string;
}

/**
 * Unified admin page header — page info (left) + global toolbar (right).
 * Used on every dashboard route for a consistent executive layout.
 */
export const PageHeader = ({
  section,
  title,
  description,
  back,
  extra,
  className,
}: Props) => {
  const dispatch = useAppDispatch();

  return (
    <header className={cn("admin-page-header", className)}>
      <div className="admin-page-header__row">
        <button
          type="button"
          onClick={() => dispatch(setMobileSidebarOpen(true))}
          className="icon-btn admin-page-header__menu lg:hidden"
          aria-label="Open menu"
        >
          <MenuOutlined />
        </button>

        <div className="admin-page-header__info min-w-0 flex-1">
          {back && (
            <Link
              to={back.to}
              className="admin-page-header__back mb-2 inline-flex items-center gap-1.5 text-[12px] text-grey-400 transition-colors hover:text-white"
            >
              <ArrowLeftOutlined className="text-[11px]" aria-hidden />
              {back.label}
            </Link>
          )}
          <div className="eyebrow">{section}</div>
          <h1 className="display-xl">{title}</h1>
          {description && (
            <p className="admin-page-header__description">{description}</p>
          )}
        </div>

        <PageHeaderToolbar />
      </div>

      {extra && (
        <div className="admin-page-header__extra">{extra}</div>
      )}
    </header>
  );
};
