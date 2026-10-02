'use client';

import Link from '@tiptap/extension-link';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo, Undo, Unlink } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

function ToolbarButton({ onClick, active, label, children, disabled }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn('grid size-8 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-40', active && 'bg-navy-100 text-navy-900')}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL (https://…, mailto: or tel:)', previous ?? 'https://');
    if (url === null) return;
    if (url === '') return void editor.chain().focus().unsetLink().run();
    if (!/^(https?:|mailto:|tel:|\/)/.test(url)) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };
  return (
    <div className="flex flex-wrap gap-0.5 border-b border-slate-200 bg-slate-50 p-1.5" role="toolbar" aria-label="Formatting">
      <ToolbarButton label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
        <Heading3 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Add link" onClick={setLink} active={editor.isActive('link')}>
        <Link2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Remove link" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')}>
        <Unlink className="size-4" />
      </ToolbarButton>
      <span className="mx-1 w-px bg-slate-200" aria-hidden />
      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo className="size-4" />
      </ToolbarButton>
    </div>
  );
}

/** TipTap rich text editor. Output HTML is sanitised again by the API before storage. */
export default function RichTextEditor({ value, onChange, id, minHeight = 220 }: { value: string; onChange: (html: string) => void; id?: string; minHeight?: number }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: false }), Link.configure({ openOnClick: false, autolink: true })],
    content: value,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: 'rich-text px-4 py-3 focus:outline-none',
        style: `min-height:${minHeight}px`,
        'aria-multiline': 'true',
        role: 'textbox',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) editor.commands.setContent(value || '', { emitUpdate: false });
  }, [value, editor]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-navy-500 focus-within:ring-4 focus-within:ring-navy-100">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
