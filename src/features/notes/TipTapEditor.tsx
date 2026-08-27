import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Code, Heading1, Heading2, List, ListOrdered, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = 'Write notes, code insights, or ideas here...',
  editable = true,
  className,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Synchronize content if updated externally
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div className={cn('rounded-2xl border border-input bg-card/60 overflow-hidden flex flex-col', className)}>
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/60 bg-muted/20">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              editor.isActive('bold') && 'bg-nova-500/20 text-nova-400'
            )}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              editor.isActive('italic') && 'bg-nova-500/20 text-nova-400'
            )}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              editor.isActive('code') && 'bg-nova-500/20 text-nova-400'
            )}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-border/60 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              editor.isActive('heading', { level: 1 }) && 'bg-nova-500/20 text-nova-400'
            )}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              editor.isActive('heading', { level: 2 }) && 'bg-nova-500/20 text-nova-400'
            )}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-border/60 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              editor.isActive('bulletList') && 'bg-nova-500/20 text-nova-400'
            )}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              editor.isActive('orderedList') && 'bg-nova-500/20 text-nova-400'
            )}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              editor.isActive('blockquote') && 'bg-nova-500/20 text-nova-400'
            )}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="p-4 flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
