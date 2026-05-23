import { WarningOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { useState } from "react";

import { Modal } from "@components/common/Modal";
import type { AdminAccountStatus } from "@/types";

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
  action: Exclude<AdminAccountStatus, "active" | "pending-verification">;
  userName: string;
  loading?: boolean;
}

const COPY: Record<
  Exclude<AdminAccountStatus, "active" | "pending-verification">,
  { title: string; description: string; cta: string; danger: boolean }
> = {
  warned: {
    title: "Issue a warning",
    description:
      "The user will receive an in-app warning notice. Use this for first-time minor violations.",
    cta: "Send warning",
    danger: false,
  },
  suspended: {
    title: "Suspend account",
    description:
      "The user will be temporarily blocked from posting jobs, applying or messaging.",
    cta: "Suspend account",
    danger: true,
  },
  banned: {
    title: "Ban account permanently",
    description:
      "This action permanently blocks the account from accessing the platform. It cannot be undone without a manual review.",
    cta: "Ban account",
    danger: true,
  },
};

/**
 * Unified destructive-action modal for the user monitoring page. Encodes
 * copy and tone per action so callers only pass the target action.
 */
export const WarningModal = ({
  open,
  onCancel,
  onConfirm,
  action,
  userName,
  loading,
}: Props) => {
  const [reason, setReason] = useState("");
  const copy = COPY[action];

  const handleCancel = () => {
    setReason("");
    onCancel();
  };

  const handleConfirm = async () => {
    await onConfirm(reason);
    setReason("");
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={null}
      width={460}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            danger={copy.danger}
            loading={loading}
            onClick={handleConfirm}
          >
            {copy.cta}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3 pb-4">
        <span
          className={
            copy.danger
              ? "grid h-10 w-10 place-items-center rounded-full bg-[#AA2727]/10 text-[#C24545]"
              : "grid h-10 w-10 place-items-center rounded-full bg-gold-500/10 text-gold-400"
          }
        >
          <WarningOutlined />
        </span>
        <div>
          <h3 className="text-[16px] font-semibold text-white">{copy.title}</h3>
          <p className="mt-1 text-[13px] text-grey-400">
            {copy.description}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
          Target
        </div>
        <div className="mt-0.5 text-[13.5px] text-white">{userName}</div>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-grey-500">
          Reason (visible in audit log)
        </div>
        <Input.TextArea
          rows={3}
          placeholder="Provide a short reason for this action…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </Modal>
  );
};
