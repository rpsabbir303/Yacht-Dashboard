/**
 * Tiptap rich-text editor used by the Legal Documents page.
 *
 *   • Edit mode  → renders the formatting toolbar + editable surface.
 *   • View mode  → renders the same HTML through a read-only Tiptap instance,
 *                  which keeps typography & link behaviour pixel-identical
 *                  to the editing experience.
 */

import { EditorContent, useEditor } from "@tiptap/react";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect, useImperativeHandle, forwardRef } from "react";

import { cn } from "@utils/cn";
import { LegalEditorToolbar } from "./LegalEditorToolbar";

export interface LegalRichTextEditorHandle {
  focus: () => void;
  getHTML: () => string;
  setContent: (html: string) => void;
}

interface LegalRichTextEditorProps {
  /** Initial / controlled HTML content. */
  content: string;
  /** Emit updated HTML on every keystroke. Required in edit mode. */
  onChange?: (html: string) => void;
  /** When false the editor is rendered read-only (no toolbar). */
  editable?: boolean;
  className?: string;
}

export const LegalRichTextEditor = forwardRef<
  LegalRichTextEditorHandle,
  LegalRichTextEditorProps
>(({ content, onChange, editable = true, className }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        blockquote: {},
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor: e }) => onChange?.(e.getHTML()),
    editorProps: {
      attributes: {
        class: cn("focus:outline-none", !editable && "select-text"),
      },
    },
    immediatelyRender: false,
  });

  /* Keep the Tiptap editable flag in sync with the prop. */
  useEffect(() => {
    if (!editor) return;
    if (editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  /* Sync external content changes (e.g. when switching documents). */
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => editor?.commands.focus("end"),
      getHTML: () => editor?.getHTML() ?? "",
      setContent: (html: string) => {
        editor?.commands.setContent(html, { emitUpdate: true });
      },
    }),
    [editor],
  );

  if (!editor) return null;

  return (
    <div className={cn("flex flex-col", className)}>
      {editable && <LegalEditorToolbar editor={editor} />}
      <div className="legal-editor px-4 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
});

LegalRichTextEditor.displayName = "LegalRichTextEditor";
