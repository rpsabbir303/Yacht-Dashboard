import { Modal } from "antd";
import { useCallback } from "react";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

/**
 * Promise-based confirmation prompt — resolves `true` on confirm, `false`
 * on cancel. Lets us avoid prop-drilling open/close state through every
 * destructive action.
 *
 * Example:
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "Suspend user?", danger: true })) {...}
 */
export const useConfirm = () => {
  return useCallback(
    ({
      title,
      description,
      confirmText = "Confirm",
      cancelText = "Cancel",
      danger,
    }: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        Modal.confirm({
          title,
          content: description,
          okText: confirmText,
          cancelText,
          centered: true,
          icon: null,
          okButtonProps: { danger, type: danger ? "primary" : "primary" },
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      }),
    [],
  );
};
