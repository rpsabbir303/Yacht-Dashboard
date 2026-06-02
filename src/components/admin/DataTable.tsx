import { Table, type TableProps } from "antd";

import { cn } from "@utils/cn";

/**
 * Thin wrapper around Ant Design's `<Table>` that locks in our admin styling
 * (uppercase eyebrow headers, hairline rows, restrained hover) and exposes
 * the canonical props we use across admin pages.
 */
export function DataTable<RecordType extends object = object>({
  rowKey = "id" as keyof RecordType,
  pageSize = 10,
  className,
  bordered,
  framed = true,
  ...rest
}: TableProps<RecordType> & {
  pageSize?: number;
  /** When false, skip the outer surface (e.g. table already inside GlassPanel). */
  framed?: boolean;
}) {
  return (
    <div
      className={cn(
        "admin-data-table",
        framed && "surface-card overflow-hidden",
        className,
      )}
    >
      <Table<RecordType>
        rowKey={rowKey as string}
        bordered={bordered}
        pagination={{
          pageSize,
          showSizeChanger: false,
          hideOnSinglePage: true,
        }}
        {...rest}
      />
    </div>
  );
}
