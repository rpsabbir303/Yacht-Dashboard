import { FileTextOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useState } from "react";

import { Modal } from "@components/common/Modal";
import { cn } from "@utils/cn";
import type { VerificationDocument } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  documents: VerificationDocument[];
  initialIndex?: number;
}

const KIND_LABEL: Record<VerificationDocument["kind"], string> = {
  passport: "Passport",
  "id-card": "ID card",
  license: "License",
  certification: "Certification",
  "company-registration": "Company registration",
  "tax-document": "Tax document",
  "yacht-registration": "Yacht registration",
};

export const DocumentPreviewModal = ({
  open,
  onClose,
  documents,
  initialIndex = 0,
}: Props) => {
  const [index, setIndex] = useState(initialIndex);
  const current = documents[index];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Document preview"
      width={920}
      footer={null}
    >
      {!current ? (
        <div className="py-20 text-center text-grey-500">
          No documents uploaded yet.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.06] bg-black">
            <img
              src={current.url}
              alt={current.name}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-1 text-[11px] text-white backdrop-blur-sm">
              {KIND_LABEL[current.kind]}
            </div>
            <div className="absolute right-3 top-3">
              <Tooltip title="Download original">
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  href={current.url}
                  target="_blank"
                />
              </Tooltip>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-grey-500">
              {documents.length} document{documents.length === 1 ? "" : "s"}
            </div>
            <div className="flex flex-col gap-1.5">
              {documents.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                    i === index
                      ? "border-teal-500/30 bg-teal-500/[0.06]"
                      : "border-white/[0.05] bg-white/[0.02] hover:border-white/[0.1]",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-lg border border-white/[0.06] text-[13px]",
                      i === index ? "text-teal-300" : "text-grey-400",
                    )}
                  >
                    <FileTextOutlined />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-white">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-grey-500">
                      {KIND_LABEL[d.kind]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
