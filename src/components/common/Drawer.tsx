import { Drawer as AntDrawer, type DrawerProps } from "antd";

import { cn } from "@utils/cn";

export const Drawer = ({ className, ...rest }: DrawerProps) => (
  <AntDrawer
    placement="right"
    width={420}
    {...rest}
    className={cn(className)}
  />
);
