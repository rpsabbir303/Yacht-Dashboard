/**
 * Sticky formatting toolbar for the legal document Tiptap editor.
 *
 * Buttons (left → right):
 *   H1  H2  H3   |   B  I  U   |   • list   1. list   ❝ quote   🔗 link
 *                                                            |   ↶ undo   ↷ redo
 */

import {
  BoldOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  RedoOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import type { Editor } from "@tiptap/react";

import { cn } from "@utils/cn";

/* ================================================================ */
/*  Atoms                                                            */
/* ================================================================ */

interface ToolBtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  shortcut?: string;
  children: React.ReactNode;
}

const ToolBtn = ({
  onClick,
  active = false,
  disabled = false,
  title,
  shortcut,
  children,
}: ToolBtnProps) => (
  <Tooltip
    title={
      <span className="flex items-center gap-1.5">
        <span>{title}</span>
        {shortcut && (
          <kbd className="rounded border border-white/[0.08] bg-white/[0.05] px-1 py-px text-[10px] text-grey-300">
            {shortcut}
          </kbd>
        )}
      </span>
    }
    mouseEnterDelay={0.4}
  >
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onMouseDown={(e) => {
        // Prevent the editor from losing focus when clicking toolbar buttons.
        e.preventDefault();
        if (!disabled) onClick();
      }}
      className={cn(
        "inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-[13px] font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40",
        active
          ? "bg-teal-500/[0.16] text-teal-300"
          : "text-grey-400 hover:bg-white/[0.04] hover:text-white",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-grey-400",
      )}
    >
      {children}
    </button>
  </Tooltip>
);

const ToolDivider = () => (
  <span className="mx-1 h-5 w-px shrink-0 bg-white/[0.08]" />
);

const HeadingLabel = ({ level }: { level: 1 | 2 | 3 }) => (
  <span className="text-[12px] font-bold leading-none">H{level}</span>
);

/* ================================================================ */
/*  Toolbar                                                          */
/* ================================================================ */

interface LegalEditorToolbarProps {
  editor: Editor;
}

export const LegalEditorToolbar = ({ editor }: LegalEditorToolbarProps) => {
  const promptLink = () => {
    const previousUrl = (editor.getAttributes("link").href as string) || "";
    const input = window.prompt("Enter URL (leave empty to remove)", previousUrl);
    if (input === null) return; // dismissed
    if (input === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const safe = /^(https?:|mailto:)/i.test(input) ? input : `https://${input}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: safe, target: "_blank", rel: "noopener noreferrer" })
      .run();
  };

  return (
    <div
      role="toolbar"
      aria-label="Document formatting"
      className={cn(
        "sticky top-0 z-[2] flex flex-wrap items-center gap-0.5",
        "border-b border-white/[0.08] bg-[#0F1724]/95 px-3 py-2 backdrop-blur-sm",
      )}
    >
      {/* Headings */}
      <ToolBtn
        title="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
      >
        <HeadingLabel level={1} />
      </ToolBtn>
      <ToolBtn
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <HeadingLabel level={2} />
      </ToolBtn>
      <ToolBtn
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        <HeadingLabel level={3} />
      </ToolBtn>

      <ToolDivider />

      {/* Inline marks */}
      <ToolBtn
        title="Bold"
        shortcut="Ctrl+B"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldOutlined />
      </ToolBtn>
      <ToolBtn
        title="Italic"
        shortcut="Ctrl+I"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicOutlined />
      </ToolBtn>
      <ToolBtn
        title="Underline"
        shortcut="Ctrl+U"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineOutlined />
      </ToolBtn>

      <ToolDivider />

      {/* Lists / quote / link */}
      <ToolBtn
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <UnorderedListOutlined />
      </ToolBtn>
      <ToolBtn
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <OrderedListOutlined />
      </ToolBtn>
      <ToolBtn
        title="Block quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <span className="text-[15px] leading-none">&ldquo;</span>
      </ToolBtn>
      <ToolBtn
        title="Insert / edit link"
        active={editor.isActive("link")}
        onClick={promptLink}
      >
        <LinkOutlined />
      </ToolBtn>

      <span className="flex-1" />

      {/* History */}
      <ToolBtn
        title="Undo"
        shortcut="Ctrl+Z"
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <UndoOutlined />
      </ToolBtn>
      <ToolBtn
        title="Redo"
        shortcut="Ctrl+Shift+Z"
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <RedoOutlined />
      </ToolBtn>
    </div>
  );
};
