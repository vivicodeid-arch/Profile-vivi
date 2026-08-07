import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * Tiptap rich-text editor wrapper.
 * Syncs external `value` changes (e.g. switching language tabs)
 * without triggering an infinite onChange loop.
 */
export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
    // editor intentionally omitted — adding it causes infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none min-h-[200px] p-4 text-sm focus:outline-none"
      />
    </div>
  );
}
