import React from 'react'
import { Note } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge, ProcessingStatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import {
  Edit3,
  Trash2,
  ExternalLink,
  Tag as TagIcon,
  Sparkles,
  Calendar,
  Clock,
  ArrowLeft,
  BookOpen,
  Plus,
} from 'lucide-react'

interface NoteViewerProps {
  note: Note | null
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
  onTagClick?: (tagId: string) => void
  onConceptClick?: (conceptId: string) => void
  onBackToList?: () => void
  onCreateNew?: () => void
  isLoading?: boolean
}

export function NoteViewer({
  note,
  onEdit,
  onDelete,
  onTagClick,
  onConceptClick,
  onBackToList,
  onCreateNew,
  isLoading = false,
}: NoteViewerProps) {
  if (isLoading) {
    return (
      <div className="flex-1 h-full p-8 space-y-6 overflow-y-auto animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted/40 rounded-lg" />
          <div className="h-8 w-24 bg-muted/40 rounded-lg" />
        </div>
        <div className="h-10 w-3/4 bg-muted/40 rounded-xl" />
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-muted/40 rounded-full" />
          <div className="h-5 w-16 bg-muted/40 rounded-full" />
        </div>
        <div className="h-28 bg-muted/30 rounded-2xl" />
        <div className="space-y-3 pt-4">
          <div className="h-4 w-full bg-muted/30 rounded" />
          <div className="h-4 w-5/6 bg-muted/30 rounded" />
          <div className="h-4 w-4/6 bg-muted/30 rounded" />
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center bg-card/20">
        <div className="w-16 h-16 rounded-3xl bg-nova-500/10 border border-nova-500/20 flex items-center justify-center text-nova-400 mb-4 shadow-xl shadow-nova-500/5">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Note Selected</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          Select a note from the sidebar to view its detailed knowledge breakdown, or create a new
          atomic note.
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew} size="sm" className="shadow-lg shadow-nova-500/20">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Knowledge Note
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-background/50 overflow-hidden">
      {/* Top Action / Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 sm:px-8 py-4 border-b border-border/80 bg-card/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile Back button */}
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Back to notes list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <ProcessingStatusBadge status={note.processing_status} />

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 opacity-60" />
            <span>Updated {formatDate(note.updated_at || note.created_at)}</span>
          </div>
        </div>

        {/* Note Actions */}
        <div className="flex items-center gap-2">
          {note.source && (
            <a
              href={note.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 border border-border/60 transition-colors"
              title="Open Source Link"
            >
              <ExternalLink className="w-3.5 h-3.5 text-nova-400" />
              <span className="max-w-[140px] truncate">Source</span>
            </a>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(note)}
            className="text-xs h-8 px-3 hover:border-nova-500/40"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5 text-nova-400" />
            Edit Note
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note.id)}
            className="text-xs h-8 px-2.5 text-destructive hover:bg-destructive/10"
            title="Delete Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Note Reading Workspace - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-12 py-8 space-y-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Note Title */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              {note.title}
            </h1>

            {/* Concepts and Tags Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {note.concepts &&
                note.concepts.map((concept) => (
                  <button
                    key={concept.id}
                    onClick={() => onConceptClick?.(concept.id)}
                    className="focus:outline-none"
                  >
                    <Badge
                      variant="info"
                      className="text-xs py-1 px-2.5 hover:bg-cyan-500/25 transition-colors cursor-pointer"
                    >
                      {concept.name}
                    </Badge>
                  </button>
                ))}

              {note.tags &&
                note.tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => onTagClick?.(tag.id)}
                    className="focus:outline-none"
                  >
                    <Badge
                      variant="secondary"
                      className="text-xs py-1 px-2.5 hover:bg-accent transition-colors cursor-pointer gap-1"
                    >
                      <TagIcon className="w-3 h-3 opacity-60" />
                      {tag.name}
                    </Badge>
                  </button>
                ))}

              <span className="text-xs text-muted-foreground/60 sm:hidden flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                {formatDate(note.created_at)}
              </span>
            </div>
          </div>

          {/* AI Knowledge Summary Callout Box (if available) */}
          {note.summary && (
            <div className="p-4 sm:p-5 rounded-2xl bg-nova-500/10 border border-nova-500/20 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-nova-400 font-semibold text-xs tracking-wide uppercase">
                <Sparkles className="w-4 h-4" />
                <span>AI Knowledge Synthesis</span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed font-normal">
                {note.summary}
              </p>
            </div>
          )}

          {/* Note Rich Content Display */}
          <div className="pt-2 border-t border-border/40">
            <div
              className="prose-note text-foreground/90 text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
