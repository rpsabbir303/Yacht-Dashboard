/**
 * Legal Documents — admin management console.
 *
 * Minimal, focused layout. The parent `SettingsLayout` already provides the
 * page-level "Settings" heading, so this view starts immediately with the
 * document selectors and content:
 *
 *   ┌─ Filter bar ─────────────────────────────────────────────────┐
 *   │ Role: [ Crew ] [ Owners ]   │   Document: [ T&C ] [ Privacy ] │
 *   ├─ Full-width Document Card ───────────────────────────────────┤
 *   │   Header  →  title · status · meta · actions                  │
 *   │   Content →  view / rich-text edit                             │
 *   │   Sticky action bar (edit mode only)                           │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Versioning still happens server-side on publish (see baseApi) but is
 * intentionally hidden from this surface.
 */

import {
  CheckCircleFilled,
  CloseOutlined,
  EditOutlined,
  EyeOutlined,
  FileAddOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  Loading3QuartersOutlined,
  SaveOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { App, Button, Empty, Skeleton, Tooltip } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GlassPanel } from "@components/common/GlassPanel";
import { useAutoSave } from "@hooks/useAutoSave";
import { useKeyboardShortcuts } from "@hooks/useKeyboardShortcuts";
import {
  useCreateLegalDocumentMutation,
  useListLegalDocumentsQuery,
  usePublishLegalDocumentMutation,
  useUpdateLegalDocumentMutation,
} from "@services/baseApi";
import { cn } from "@utils/cn";
import type {
  LegalDocument,
  LegalDocumentId,
  LegalDocumentType,
  LegalUserRole,
} from "@/types";
import { composeLegalDocumentId } from "@/types";

import { LegalPreviewModal } from "./legal/LegalPreviewModal";
import { LegalRichTextEditor } from "./legal/LegalRichTextEditor";

/* ================================================================ */
/*  Helpers                                                          */
/* ================================================================ */

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtRelative = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d < 7) return `${d}d ago`;
  return fmtDate(iso);
};

const titleFor = (role: LegalUserRole, type: LegalDocumentType): string =>
  `${role === "crew" ? "Crew" : "Owner"} ${type === "terms" ? "Terms & Conditions" : "Privacy Policy"}`;

const DEFAULT_TEMPLATE = `
<h2>1. Introduction</h2>
<p>Start writing your document here. Use the formatting toolbar to add headings, lists, links and emphasis.</p>
`.trim();

/* ================================================================ */
/*  Small UI atoms                                                   */
/* ================================================================ */

interface TogglePillProps {
  active: boolean;
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
}

/** Compact toggle pill used in the role + document-type filter rows. */
const TogglePill = ({ active, icon, label, onClick }: TogglePillProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "group inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40",
      active
        ? "bg-teal-500 text-white shadow-[0_8px_24px_-12px_rgba(34,199,184,0.55)]"
        : "border border-white/[0.08] bg-surface text-grey-400 hover:border-teal-500/35 hover:text-white",
    )}
  >
    {icon && (
      <span
        className={cn(
          "text-[12.5px] transition-colors",
          active ? "text-white" : "text-grey-400 group-hover:text-teal-300",
        )}
      >
        {icon}
      </span>
    )}
    <span>{label}</span>
  </button>
);

interface StatusBadgeProps {
  status: LegalDocument["status"];
  dirty?: boolean;
}

const StatusBadge = ({ status, dirty = false }: StatusBadgeProps) => {
  const isPublished = status === "published" && !dirty;
  const label = dirty ? "Unsaved changes" : isPublished ? "Published" : "Draft";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
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
      {label}
    </span>
  );
};

interface AutoSaveIndicatorProps {
  status: "idle" | "dirty" | "saving" | "saved" | "error";
}

const AutoSaveIndicator = ({ status }: AutoSaveIndicatorProps) => {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-teal-300">
        <Loading3QuartersOutlined spin className="text-[11px]" />
        Saving…
      </span>
    );
  }
  if (status === "dirty") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-gold-400">
        <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
        Unsaved changes
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        Autosave failed — try again
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-grey-500">
      <CheckCircleFilled className="text-teal-400" />
      All changes saved
    </span>
  );
};

interface FilterGroupProps {
  label: string;
  children: React.ReactNode;
}

const FilterGroup = ({ label, children }: FilterGroupProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-grey-500">
      {label}
    </span>
    <div className="flex flex-wrap items-center gap-1.5">{children}</div>
  </div>
);

/* ================================================================ */
/*  Main exported component                                          */
/* ================================================================ */

export const LegalSettings = () => {
  const { message, modal } = App.useApp();

  /* ---- selector state ---- */
  const [role, setRole] = useState<LegalUserRole>("crew");
  const [docType, setDocType] = useState<LegalDocumentType>("terms");

  /* ---- editor state ---- */
  const [editing, setEditing] = useState(false);
  const [draftContent, setDraftContent] = useState<string>("");
  const editorContentRef = useRef<string>("");

  /* ---- preview modal ---- */
  const [previewOpen, setPreviewOpen] = useState(false);

  /* ---- RTK Query ---- */
  const { data: documents = [], isLoading: docsLoading } =
    useListLegalDocumentsQuery();
  const [createDoc, { isLoading: creating }] = useCreateLegalDocumentMutation();
  const [updateDoc] = useUpdateLegalDocumentMutation();
  const [publishDoc, { isLoading: publishing }] =
    usePublishLegalDocumentMutation();

  /* ---- active document ---- */
  const activeId: LegalDocumentId = composeLegalDocumentId(docType, role);
  const activeDoc = useMemo(
    () => documents.find((d) => d.id === activeId) ?? null,
    [documents, activeId],
  );

  /* ---- track whether draft differs from server doc ---- */
  const draftDirty =
    editing && !!activeDoc && draftContent !== activeDoc.content;

  /* Reset draft whenever the active document changes (role/type switch or a
   * remote update). When leaving edit mode, also reset. */
  useEffect(() => {
    if (!activeDoc) {
      setDraftContent("");
      editorContentRef.current = "";
      return;
    }
    if (!editing) {
      setDraftContent(activeDoc.content);
      editorContentRef.current = activeDoc.content;
    }
  }, [activeDoc, editing]);

  /* Keep ref in sync so flush() always reads the latest content. */
  useEffect(() => {
    editorContentRef.current = draftContent;
  }, [draftContent]);

  /* ---- autosave (silent — no toast) ---- */
  const handleSilentSave = useCallback(
    async (next: string) => {
      if (!activeDoc) return;
      await updateDoc({
        id: activeDoc.id,
        content: next,
        silent: true,
      }).unwrap();
    },
    [activeDoc, updateDoc],
  );

  const { status: autoSaveStatus, flush: flushAutoSave } = useAutoSave({
    value: draftContent,
    onSave: handleSilentSave,
    enabled: editing && !!activeDoc,
    idleDelayMs: 3000,
    maxIntervalMs: 30000,
  });

  /* ---- actions ---- */

  const guardSwitch = useCallback(
    (onContinue: () => void) => {
      if (!editing || !draftDirty) {
        onContinue();
        return;
      }
      modal.confirm({
        title: "Discard unsaved changes?",
        content:
          "You have unsaved edits in this document. Switching now will discard them.",
        okText: "Discard changes",
        cancelText: "Keep editing",
        okButtonProps: { danger: true },
        onOk: () => {
          setEditing(false);
          onContinue();
        },
      });
    },
    [editing, draftDirty, modal],
  );

  const handleSelectRole = (next: LegalUserRole) => {
    if (next === role) return;
    guardSwitch(() => setRole(next));
  };
  const handleSelectType = (next: LegalDocumentType) => {
    if (next === docType) return;
    guardSwitch(() => setDocType(next));
  };

  const handleEnterEdit = () => {
    if (!activeDoc) return;
    setDraftContent(activeDoc.content);
    editorContentRef.current = activeDoc.content;
    setEditing(true);
  };

  const handleCancelEdit = () => {
    if (!draftDirty) {
      setEditing(false);
      return;
    }
    modal.confirm({
      title: "Discard unsaved changes?",
      content: "Any edits you've made will be lost.",
      okText: "Discard",
      cancelText: "Keep editing",
      okButtonProps: { danger: true },
      onOk: () => setEditing(false),
    });
  };

  const handleSaveDraft = useCallback(async () => {
    if (!activeDoc) return;
    try {
      await flushAutoSave();
      await updateDoc({
        id: activeDoc.id,
        content: editorContentRef.current,
      }).unwrap();
      message.success("Draft saved successfully");
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to save draft",
      );
    }
  }, [activeDoc, flushAutoSave, message, updateDoc]);

  const handlePublish = useCallback(
    async (closePreviewOnSuccess = false) => {
      if (!activeDoc) return;
      try {
        if (editing) {
          await updateDoc({
            id: activeDoc.id,
            content: editorContentRef.current,
          }).unwrap();
        }
        await publishDoc({ id: activeDoc.id }).unwrap();
        message.success("Document published successfully");
        setEditing(false);
        if (closePreviewOnSuccess) setPreviewOpen(false);
      } catch (err) {
        message.error(
          err instanceof Error ? err.message : "Failed to publish document",
        );
      }
    },
    [activeDoc, editing, message, publishDoc, updateDoc],
  );

  const handleOpenPreview = useCallback(() => {
    if (!activeDoc) return;
    setPreviewOpen(true);
  }, [activeDoc]);

  const handleClosePreview = () => setPreviewOpen(false);

  /** Used by the empty state when no document exists for the current
   *  (role, type) combination — this is the only way to bootstrap one. */
  const handleCreateFromEmpty = async () => {
    try {
      const created = await createDoc({
        documentType: docType,
        userRole: role,
        title: titleFor(role, docType),
        content: DEFAULT_TEMPLATE,
      }).unwrap();
      setDraftContent(created.content);
      editorContentRef.current = created.content;
      setEditing(true);
      message.success("Document created — start editing your draft");
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to create document",
      );
    }
  };

  /* ---- keyboard shortcuts (only while editing) ---- */
  useKeyboardShortcuts({
    enabled: editing,
    bindings: [
      {
        combo: "mod+s",
        preventDefault: true,
        onTrigger: () => void handleSaveDraft(),
      },
      {
        combo: "mod+p",
        preventDefault: true,
        onTrigger: handleOpenPreview,
      },
    ],
  });

  /* ---- selector data ---- */
  const ROLES: { id: LegalUserRole; label: string; icon: React.ReactNode }[] = [
    { id: "crew", label: "Crew", icon: <TeamOutlined /> },
    { id: "owner", label: "Owners", icon: <UserOutlined /> },
  ];
  const TYPES: {
    id: LegalDocumentType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: "terms", label: "Terms & Conditions", icon: <FileTextOutlined /> },
    { id: "privacy", label: "Privacy Policy", icon: <FileProtectOutlined /> },
  ];

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div>
      {/* ===================== Filter bar (top of page) ===================== */}
      <section
        className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-white/[0.08] bg-surface px-4 py-3"
        aria-label="Document filters"
      >
        <FilterGroup label="Role">
          {ROLES.map((r) => (
            <TogglePill
              key={r.id}
              active={role === r.id}
              icon={r.icon}
              label={r.label}
              onClick={() => handleSelectRole(r.id)}
            />
          ))}
        </FilterGroup>

        <span
          aria-hidden
          className="hidden h-6 w-px bg-white/[0.08] sm:inline-block"
        />

        <FilterGroup label="Document">
          {TYPES.map((t) => (
            <TogglePill
              key={t.id}
              active={docType === t.id}
              icon={t.icon}
              label={t.label}
              onClick={() => handleSelectType(t.id)}
            />
          ))}
        </FilterGroup>
      </section>

      {/* ===================== Document body ===================== */}
      <div>
        {docsLoading ? (
          <GlassPanel padding="lg">
            <Skeleton active paragraph={{ rows: 10 }} />
          </GlassPanel>
        ) : !activeDoc ? (
          /* ----------- Empty state ----------- */
          <GlassPanel padding="lg">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-[13.5px] text-grey-400">
                  No document found for{" "}
                  <span className="text-white">{titleFor(role, docType)}</span>
                  .
                </span>
              }
            >
              <Button
                type="primary"
                icon={<FileAddOutlined />}
                loading={creating}
                onClick={handleCreateFromEmpty}
              >
                Create Document
              </Button>
            </Empty>
          </GlassPanel>
        ) : (
          <DocumentCard
            doc={activeDoc}
            editing={editing}
            draftContent={draftContent}
            draftDirty={draftDirty}
            autoSaveStatus={autoSaveStatus}
            publishing={publishing}
            onChange={setDraftContent}
            onEnterEdit={handleEnterEdit}
            onCancelEdit={handleCancelEdit}
            onSaveDraft={handleSaveDraft}
            onPreview={handleOpenPreview}
            onPublish={() => handlePublish(false)}
          />
        )}
      </div>

      {/* ===================== Preview modal ===================== */}
      <LegalPreviewModal
        open={previewOpen}
        document={activeDoc}
        liveContent={editing ? draftContent : undefined}
        publishing={publishing}
        onClose={handleClosePreview}
        onPublish={() => handlePublish(true)}
      />
    </div>
  );
};

/* ================================================================ */
/*  Document card — view OR edit mode                                */
/* ================================================================ */

interface DocumentCardProps {
  doc: LegalDocument;
  editing: boolean;
  draftContent: string;
  draftDirty: boolean;
  autoSaveStatus: "idle" | "dirty" | "saving" | "saved" | "error";
  publishing: boolean;
  onChange: (html: string) => void;
  onEnterEdit: () => void;
  onCancelEdit: () => void;
  onSaveDraft: () => void;
  onPreview: () => void;
  onPublish: () => void;
}

const DocumentCard = ({
  doc,
  editing,
  draftContent,
  draftDirty,
  autoSaveStatus,
  publishing,
  onChange,
  onEnterEdit,
  onCancelEdit,
  onSaveDraft,
  onPreview,
  onPublish,
}: DocumentCardProps) => {
  return (
    <GlassPanel padding="none" className="overflow-hidden">
      {/* -------- Compact card header (title · status · meta · actions) -------- */}
      <header className="flex flex-col gap-3 border-b border-white/[0.08] px-5 py-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[16.5px] font-semibold leading-tight text-white">
              {doc.title}
            </h3>
            <StatusBadge status={doc.status} dirty={draftDirty} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-grey-500">
            <span>
              Last Updated:{" "}
              <span className="text-grey-300">{fmtDate(doc.updatedAt)}</span>
            </span>
            <span>
              Updated By:{" "}
              <span className="text-grey-300">{doc.updatedBy}</span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {editing ? (
            <>
              <Button size="small" icon={<CloseOutlined />} onClick={onCancelEdit}>
                Cancel
              </Button>
              <Tooltip title="Save draft (Ctrl+S)" mouseEnterDelay={0.4}>
                <Button
                  size="small"
                  icon={<SaveOutlined />}
                  loading={autoSaveStatus === "saving"}
                  onClick={onSaveDraft}
                >
                  Save draft
                </Button>
              </Tooltip>
              <Tooltip title="Preview (Ctrl+P)" mouseEnterDelay={0.4}>
                <Button size="small" icon={<EyeOutlined />} onClick={onPreview}>
                  Preview
                </Button>
              </Tooltip>
              <Button
                size="small"
                type="primary"
                icon={<SendOutlined />}
                loading={publishing}
                onClick={onPublish}
              >
                Publish
              </Button>
            </>
          ) : (
            <>
              <Button
                size="small"
                type="primary"
                icon={<EditOutlined />}
                onClick={onEnterEdit}
              >
                Edit Document
              </Button>
              <Button size="small" icon={<EyeOutlined />} onClick={onPreview}>
                Preview
              </Button>
              <Tooltip
                title={
                  doc.status === "published"
                    ? "Re-publish current draft as a new version"
                    : "Publish this draft"
                }
                mouseEnterDelay={0.4}
              >
                <Button
                  size="small"
                  icon={<SendOutlined />}
                  loading={publishing}
                  onClick={onPublish}
                >
                  Publish
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      </header>

      {/* -------- Body — view OR edit -------- */}
      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <LegalRichTextEditor
              key={doc.id}
              content={draftContent}
              onChange={onChange}
              editable
            />
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
            className="px-5 py-7 sm:px-10 sm:py-9"
          >
            <article
              className="legal-preview mx-auto max-w-3xl"
              dangerouslySetInnerHTML={{ __html: doc.content }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------- Sticky action bar (edit mode only) -------- */}
      {editing && (
        <div className="sticky bottom-0 z-[2] flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] bg-[#0F1724]/95 px-5 py-3 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <AutoSaveIndicator status={autoSaveStatus} />
            <span className="hidden text-grey-600 sm:inline">·</span>
            <span className="hidden text-[11.5px] text-grey-500 sm:inline">
              Updated {fmtRelative(doc.updatedAt)} by {doc.updatedBy}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button icon={<CloseOutlined />} onClick={onCancelEdit}>
              Cancel
            </Button>
            <Button
              icon={<SaveOutlined />}
              loading={autoSaveStatus === "saving"}
              onClick={onSaveDraft}
            >
              Save draft
            </Button>
            <Button icon={<EyeOutlined />} onClick={onPreview}>
              Preview
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={publishing}
              onClick={onPublish}
            >
              Publish
            </Button>
          </div>
        </div>
      )}
    </GlassPanel>
  );
};

export default LegalSettings;
