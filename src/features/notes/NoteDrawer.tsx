import React, { useState } from 'react'
import { TipTapEditor } from '@/features/notes/TipTapEditor'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { X, Sparkles, Check, Trash2, Link2, Tag as TagIcon, BookOpen } from 'lucide-react'

interface NoteDrawerProps {
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
}

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
}: NoteDrawerProps) {
  const [tagInput, setTagInput] = useState('')

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

  return (
    <>
      {/* Subtle Backdrop - not heavily blurred/dimmed */}
      <div
        className="fixed inset-0 bg-background/50 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right-Side Drawer Panel (440px-500px wide on desktop, full width on mobile) */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[520px] bg-card border-l border-border/80 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-nova-500/15 border border-nova-500/30 flex items-center justify-center text-nova-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 id="drawer-title" className="font-bold text-base text-foreground tracking-tight">
                {isEditing ? 'Edit Knowledge Note' : 'Create Knowledge Note'}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                TipTap Rich Editor with automated AI synthesis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/70 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Note Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">Title</label>
            <Input
              placeholder="e.g., Vector Embeddings & Cosine Similarity"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-semibold text-sm h-10 bg-background/50 focus:bg-background"
            />
          </div>

          {/* Source Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Source URL / Documentation</span>
              <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
            </label>
            <Input
              placeholder="https://example.com/docs/vector-search"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="text-xs h-9 bg-background/50 focus:bg-background"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Tags</span>
            </label>

            {tagsList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {tagsList.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs py-1 px-2.5">
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive text-muted-foreground ml-0.5"
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
              className="h-8 text-xs bg-background/50 focus:bg-background"
            />
          </div>

          {/* TipTap Rich Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/80">Content</label>
              <span className="text-[10px] text-muted-foreground font-mono">Markdown supported</span>
            </div>
            <TipTapEditor
              content={content}
              onChange={(newContent) => setContent(newContent)}
              className="min-h-[280px] max-h-[380px] bg-background/40"
            />
          </div>

          {/* AI Synthesizer Trigger Button */}
          {onTriggerAISummarizer && (
            <div className="pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onTriggerAISummarizer}
                isLoading={isSummarizing}
                disabled={!content.trim() || content === '<p></p>'}
                className="w-full justify-center bg-nova-500/10 hover:bg-nova-500/20 text-nova-400 border border-nova-500/20 py-2.5 h-auto text-xs"
              >
                <Sparkles className="w-4 h-4 mr-2 text-nova-400" />
                AI Synthesize & Summarize Note
              </Button>
            </div>
          )}
        </div>

        {/* Drawer Footer - Action Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/80 bg-card/95 backdrop-blur-md shrink-0">
          <div>
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:bg-destructive/10 text-xs"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              isLoading={isSaving}
              disabled={!title.trim() || !content.trim() || content === '<p></p>'}
              className="shadow-md shadow-nova-500/25 text-xs"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Save Note
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
