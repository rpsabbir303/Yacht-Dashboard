import { Button } from "antd";
import type { ReactNode } from "react";

import { Modal } from "@components/common/Modal";

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
}

/**
 * Declarative confirmation dialog for cases where the promise-based
 * `useConfirm()` hook isn't a good fit (e.g. when you need to render a
 * rich body with form fields).
 */
export const ConfirmModal = ({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger,
  loading,
}: Props) => (
  <Modal
    open={open}
    onCancel={onCancel}
    title={title}
    width={460}
    footer={
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button
          type="primary"
          danger={danger}
          loading={loading}
          onClick={() => void onConfirm()}
        >
          {confirmText}
        </Button>
      </div>
    }
  >
    {description && (
      <div className="text-[13.5px] leading-relaxed text-grey-400">
        {description}
      </div>
    )}
  </Modal>
);
