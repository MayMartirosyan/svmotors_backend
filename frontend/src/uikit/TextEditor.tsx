"use client";

import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Table } from "@tiptap/extension-table";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Table as TableIcon,
  Undo,
  Redo,
  ImageIcon,
} from "lucide-react";

interface TextEditorProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  error?: string;
}

const ToolbarButton = ({
  active,
  onClick,
  icon: Icon,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  icon: any;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors ${
      active ? "bg-gray-200 text-blue-600" : "hover:bg-gray-100 text-gray-700"
    }`}
  >
    <Icon size={18} />
  </button>
);

const TextEditor: React.FC<TextEditorProps> = ({
  label,
  value,
  onChange,
  error,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),

      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: "Введите текст...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value]);

 

  return (
    <div className="mb-6">
      {label && (
        <label className="block text-base font-medium text-gray-800 mb-2">
          {label}
        </label>
      )}

      <div
        className={`border rounded-lg overflow-hidden shadow-sm bg-white ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-gray-50">
          <ToolbarButton
            icon={Bold}
            title="Жирный"
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            icon={Italic}
            title="Курсив"
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            icon={UnderlineIcon}
            title="Подчеркнутый"
            active={editor?.isActive("underline")}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          />
          <ToolbarButton
            icon={List}
            title="Маркированный список"
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            icon={ListOrdered}
            title="Нумерованный список"
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            icon={Heading2}
            title="Заголовок (H2)"
            active={editor?.isActive("heading", { level: 2 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
          
          {/* Разделитель */}
          <div className="w-[1px] h-6 bg-gray-300 mx-2" />

          <ToolbarButton
            icon={TableIcon}
            title="Вставить таблицу"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          />
          <ToolbarButton
            icon={Undo}
            title="Отменить"
            onClick={() => editor?.chain().focus().undo().run()}
          />
          <ToolbarButton
            icon={Redo}
            title="Повторить"
            onClick={() => editor?.chain().focus().redo().run()}
          />
        </div>

        {/* Content Area */}
        <div className="p-3 min-h-[200px] prose max-w-none focus:outline-none text-gray-800">
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default TextEditor;
