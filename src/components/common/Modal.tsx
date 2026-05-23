import { Modal as AntModal, type ModalProps } from "antd";

import { cn } from "@utils/cn";

interface Props extends ModalProps {
  /** Visually highlight the modal as the focus action (gold accent border). */
  emphasis?: "default" | "accent";
}

export const Modal = ({ emphasis = "default", className, ...rest }: Props) => (
  <AntModal
    centered
    destroyOnClose
    {...rest}
    className={cn(
      "[&_.ant-modal-content]:rounded-3xl",
      emphasis === "accent" && "[&_.ant-modal-content]:!border-ocean-400/50",
      className,
    )}
  />
);
