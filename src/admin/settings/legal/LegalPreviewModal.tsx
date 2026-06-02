/**
 * Centered preview modal for a Legal Document.
 *
 * Renders the document exactly as platform users will see it, framed in a
 * compact centered modal. No version metadata is shown — only:
 *   • Document title
 *   • Status badge
 *   • Document content
 *   • Footer actions: Close · Publish
 */

import { CloseOutlined, EyeOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";

import { cn } from "@utils/cn";

import type { LegalDocument } from "@/types";

interface LegalPreviewModalProps {
  open: boolean;
  document: LegalDocument | null;
  /** Live editor content. Overrides `document.content` when provided. */
  liveContent?: string;
  onClose: () => void;
  onPublish?: () => void;
  publishing?: boolean;
}

export const LegalPreviewModal = ({
  open,
  document,
  liveContent,
  onClose,
  onPublish,
  publishing = false,
}: LegalPreviewModalProps) => {
  if (!document) return null;

  const html = liveContent ?? document.content;
  const isPublished = document.status === "published";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={920}
      styles={{
        content: {
          background: "#0F1724",
          padding: 0,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          overflow: "hidden",
        },
        body: { padding: 0 },
        mask: {
          background: "rgba(2, 6, 12, 0.86)",
          backdropFilter: "blur(4px)",
        },
      }}
      closeIcon={null}
      footer={null}
      destroyOnClose
    >
      <div className="flex max-h-[85vh] flex-col">
        {/* ====== Header ====== */}
        <header className="flex items-start gap-3 border-b border-white/[0.08] px-6 py-5 sm:px-8 sm:py-6">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-500/[0.12] text-teal-300"
            aria-hidden
          >
            <EyeOutlined />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-grey-500">
              Document preview
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[16px] font-semibold leading-tight text-white">
                {document.title}
              </h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
                  isPublished
                    ? "bg-teal-500/[0.12] text-teal-300"
                    : "bg-gold-500/[0.12] text-gold-400",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isPublished ? "bg-teal-400" : "bg-gold-400",
                  )}
                />
                {isPublished ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        </header>

        {/* ====== Body ====== */}
        <main className="flex-1 overflow-y-auto bg-[#050B14] px-6 py-8 sm:px-10 sm:py-10">
          <article
            className="legal-preview mx-auto max-w-2xl"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </main>

        {/* ====== Footer ====== */}
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.08] px-6 py-4 sm:px-8">
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Close
          </Button>
          {onPublish && (
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={publishing}
              onClick={onPublish}
            >
              Publish
            </Button>
          )}
        </footer>
      </div>
    </Modal>
  );
};
