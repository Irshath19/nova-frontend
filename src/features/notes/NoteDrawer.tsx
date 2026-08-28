import React, { useState, useEffect, useRef, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { TipTapEditor } from '@/features/notes/TipTapEditor'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { NoteBook } from '@/types'
import { getNotebookIcon } from '@/stores/notebook-store'
import {
  X,
  Sparkles,
  Check,
  Trash2,
  Link2,
  Tag as TagIcon,
  BookOpen,
  Eye,
  PenTool,
  ExternalLink,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NoteDrawerProps {
  isOpen: boolean
  onClose: () => void
  isEditing: boolean
  title: string
  setTitle: (val: string) => void
  content: string
  setContent: (val: string) => void
  source: string
  setSource: (val: string) => void
  tagsList: string[]
  setTagsList: (tags: string[]) => void
  onSave: () => Promise<void>
  onDelete?: () => Promise<void>
  isSaving?: boolean
  isSummarizing?: boolean
  onTriggerAISummarizer?: () => void
  notebookId?: string | null
  setNotebookId?: (id: string | null) => void
  notebooks?: NoteBook[]
}

/**
 * Centered Split-Pane Modal for creating and editing knowledge notes.
 * Features a TipTap rich text editor on the left pane and a real-time
 * Markdown preview with Tailwind Typography on the right pane.
 */
export function NoteDrawer({
  isOpen,
  onClose,
  isEditing,
  title,
  setTitle,
  content,
  setContent,
  source,
  setSource,
  tagsList,
  setTagsList,
  onSave,
  onDelete,
  isSaving = false,
  isSummarizing = false,
  onTriggerAISummarizer,
  notebookId,
  setNotebookId,
  notebooks = [],
}: NoteDrawerProps) {
  const [tagInput, setTagInput] = useState('')
  const [activeMobileTab, setActiveMobileTab] = useState<'write' | 'preview'>('write')
  const [debouncedContent, setDebouncedContent] = useState(content)
  const modalRef = useRef<HTMLDivElement>(null)

  const selectedNotebookObj = notebooks.find((nb) => nb.id === notebookId)
  const currentNotebookName = selectedNotebookObj?.name || 'NoteBook'
  const currentNotebookIcon = selectedNotebookObj?.icon || getNotebookIcon(selectedNotebookObj?.name)

  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Sync debounced content for smooth live preview rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContent(content)
    }, 150)
    return () => clearTimeout(timer)
  }, [content])

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    if (modalRef.current && !modalRef.current.contains(document.activeElement)) {
      modalRef.current.focus()
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Reset mobile tab to write view when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveMobileTab('write')
    }
  }, [isOpen])

  // Calculate statistics
  const stats = useMemo(() => {
    const plainText = content
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const wordCount = plainText ? plainText.split(' ').length : 0
    const charCount = plainText.length
    return { wordCount, charCount }
  }, [content])

  if (!isOpen) return null

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const cleanTag = tagInput.trim().replace(/^#/, '')
      if (cleanTag && !tagsList.includes(cleanTag)) {
        setTagsList([...tagsList, cleanTag])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagName: string) => {
    setTagsList(tagsList.filter((t) => t !== tagName))
  }

  const isContentEmpty =
    !debouncedContent.trim() ||
    debouncedContent === '<p></p>' ||
    debouncedContent === '<p><br></p>'

  const isSaveDisabled =
    !title.trim() ||
    !content.trim() ||
    content === '<p></p>' ||
    content === '<p><br></p>' ||
    isSaving

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-note-modal-title"
    >
      {/* Semi-transparent backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative z-10 w-[90vw] max-w-6xl h-[90vh] max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden outline-none animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-nova-500/15 border border-nova-500/30 flex items-center justify-center text-nova-400 shadow-sm shadow-nova-500/10">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="create-note-modal-title"
                className="font-bold text-base sm:text-lg text-slate-100 tracking-tight"
              >
                {isEditing ? 'Edit Knowledge Note' : 'Create Knowledge Note'}
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                TipTap Rich Editor with automated AI synthesis
              </p>
            </div>
          </div>

          {/* Responsive Mobile Tab Switcher */}
          <div className="flex lg:hidden items-center bg-slate-800/90 border border-slate-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveMobileTab('write')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all',
                activeMobileTab === 'write'
                  ? 'bg-nova-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
              aria-label="Switch to Editor"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileTab('preview')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all',
                activeMobileTab === 'preview'
                  ? 'bg-nova-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
              aria-label="Switch to Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden p-4 sm:p-6 bg-slate-900/60">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left Pane (Editor) */}
            <div
              className={cn(
                'flex flex-col gap-4 h-full lg:overflow-y-auto lg:pr-2',
                activeMobileTab !== 'write' && 'hidden lg:flex'
              )}
            >
              {/* Note Title Input */}
              <div className="space-y-1.5 shrink-0">
                <label
                  htmlFor="note-title-input"
                  className="text-xs font-semibold text-slate-300 flex items-center justify-between"
                >
                  <span>Title</span>
                  <span className="text-[10px] text-slate-400 font-normal">Required</span>
                </label>
                <Input
                  id="note-title-input"
                  placeholder="e.g., Vector Embeddings & Cosine Similarity"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="font-semibold text-sm h-10 bg-slate-950/60 border-slate-800 focus:border-nova-500 focus:bg-slate-950 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              {/* NoteBook Selector & Source URL Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
                {/* NoteBook Selector (from notebooks table in DB) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="note-notebook-select"
                    className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>NoteBook</span>
                  </label>

                  <div className="relative">
                    <select
                      id="note-notebook-select"
                      aria-label="NoteBook"
                      value={notebookId || ''}
                      onChange={(e) => setNotebookId?.(e.target.value || null)}
                      className="w-full h-9 px-3 text-xs font-medium rounded-xl bg-slate-950/60 border border-slate-800 focus:border-nova-500 focus:bg-slate-950 text-slate-200 outline-none transition-colors"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">
                        None (Unassigned)
                      </option>
                      {notebooks.map((nb) => (
                        <option key={nb.id} value={nb.id} className="bg-slate-900 text-slate-200">
                          {nb.icon || '📚'} {nb.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Source URL Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="note-source-input"
                    className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                  >
                    <Link2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Source URL</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    id="note-source-input"
                    placeholder="https://example.com/docs"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="text-xs h-9 bg-slate-950/60 border-slate-800 focus:border-nova-500 focus:bg-slate-950 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div className="space-y-2 shrink-0">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <TagIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tags</span>
                </label>

                {tagsList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tagsList.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 text-xs py-1 px-2.5 bg-slate-800 text-slate-200 border-slate-700"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400 text-slate-400 ml-0.5"
                          aria-label={`Remove tag ${tag}`}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <Input
                  placeholder="Add tags (type name & press Enter)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="h-8 text-xs bg-slate-950/60 border-slate-800 focus:border-nova-500 focus:bg-slate-950 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              {/* Tiptap Rich Editor */}
              <div className="space-y-1.5 flex-1 flex flex-col min-h-[280px]">
                <div className="flex items-center justify-between shrink-0">
                  <label className="text-xs font-semibold text-slate-300">Content</label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Markdown supported
                  </span>
                </div>
                <TipTapEditor
                  content={content}
                  onChange={(newContent) => setContent(newContent)}
                  className="flex-1 min-h-[220px] bg-slate-950/60 border-slate-800 text-slate-100"
                />
              </div>

              {/* AI Synthesizer Trigger Button */}
              {onTriggerAISummarizer && (
                <div className="pt-1 shrink-0">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onTriggerAISummarizer}
                    isLoading={isSummarizing}
                    disabled={!content.trim() || content === '<p></p>'}
                    className="w-full justify-center bg-nova-500/10 hover:bg-nova-500/20 text-nova-400 border border-nova-500/20 py-2.5 h-auto text-xs font-medium"
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-nova-400" />
                    AI Synthesize & Summarize Note
                  </Button>
                </div>
              )}
            </div>

            {/* Right Pane (Live Markdown Preview) */}
            <div
              className={cn(
                'flex flex-col h-full overflow-hidden border border-slate-800/80 bg-slate-950/70 rounded-xl',
                activeMobileTab !== 'preview' && 'hidden lg:flex'
              )}
            >
              {/* Preview Header Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-nova-400" />
                  <span className="text-xs font-semibold text-slate-200">Live Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Sync</span>
                  </div>
                </div>
              </div>

              {/* Live Preview Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Note Title Preview */}
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight leading-snug">
                    {title.trim() || (
                      <span className="text-slate-500 italic font-normal">Untitled Note</span>
                    )}
                  </h1>

                  {/* Metadata preview row */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-1">
                    {selectedNotebookObj && (
                      <Badge
                        variant="secondary"
                        className="text-[11px] py-0.5 px-2 bg-slate-800 text-slate-200 border-slate-700/80 gap-1 font-medium"
                      >
                        <span>{currentNotebookIcon}</span>
                        <span>{currentNotebookName}</span>
                      </Badge>
                    )}

                    {tagsList.length > 0 ? (
                      tagsList.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[11px] py-0.5 px-2 bg-slate-800/80 text-slate-300 border-slate-700/80 gap-1"
                        >
                          <TagIcon className="w-2.5 h-2.5 opacity-60" />
                          <span>{tag}</span>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No tags added</span>
                    )}

                    {source.trim() && (
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-nova-400 hover:text-nova-300 underline underline-offset-2 ml-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="max-w-[200px] truncate">{source}</span>
                      </a>
                    )}
                  </div>
                </div>

                <hr className="border-slate-800" />

                {/* Markdown & HTML Body Content Render */}
                {isContentEmpty ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                    <FileText className="w-8 h-8 opacity-40 text-slate-400" />
                    <p className="text-xs">
                      Start typing in the editor on the left to see your formatted preview here.
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-100 prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-nova-400 hover:prose-a:text-nova-300 prose-code:text-nova-300 prose-code:bg-slate-800/70 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-pre:bg-slate-900/90 prose-pre:border prose-pre:border-slate-800 prose-blockquote:border-l-nova-500 prose-blockquote:bg-nova-500/5 prose-blockquote:text-slate-300 prose-blockquote:rounded-r-lg prose-ul:text-slate-300 prose-ol:text-slate-300">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {debouncedContent}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <footer className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete Note
              </Button>
            )}

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
              <span>{stats.wordCount} words</span>
              <span>•</span>
              <span>{stats.charCount} characters</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              isLoading={isSaving}
              disabled={isSaveDisabled}
              className="shadow-md shadow-nova-500/25 text-xs bg-nova-500 hover:bg-nova-600 text-white font-medium"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Save Note
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}
