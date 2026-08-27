import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge, ProcessingStatusBadge } from '@/components/ui/Badge'
import { Note } from '@/types'
import { formatDate } from '@/lib/utils'
import { FileText, Tag as TagIcon, Sparkles, ExternalLink } from 'lucide-react'

interface NoteCardProps {
  note: Note
  onClick?: () => void
  onTagClick?: (tagId: string) => void
  onConceptClick?: (conceptId: string) => void
}

export function NoteCard({ note, onClick, onTagClick, onConceptClick }: NoteCardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer group hover:border-nova-500/40 hover:bg-card/90 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground text-base group-hover:text-nova-400 transition-colors line-clamp-1">
            {note.title}
          </h3>
          <ProcessingStatusBadge status={note.processing_status} />
        </div>

        {note.summary ? (
          <div className="mb-3 p-2.5 rounded-xl bg-nova-500/5 border border-nova-500/10 text-xs text-muted-foreground leading-relaxed">
            <div className="flex items-center gap-1 font-medium text-nova-400 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Summary</span>
            </div>
            <p className="line-clamp-2">{note.summary}</p>
          </div>
        ) : (
          <div
            className="text-xs text-muted-foreground line-clamp-3 mb-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        )}
      </div>

      <div>
        {/* Concepts and Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {note.concepts.slice(0, 3).map((c) => (
            <span
              key={c.id}
              onClick={(e) => {
                e.stopPropagation()
                onConceptClick?.(c.id)
              }}
            >
              <Badge variant="info" className="text-[10px] hover:bg-cyan-500/25 cursor-pointer">
                {c.name}
              </Badge>
            </span>
          ))}

          {note.tags.slice(0, 3).map((t) => (
            <span
              key={t.id}
              onClick={(e) => {
                e.stopPropagation()
                onTagClick?.(t.id)
              }}
            >
              <Badge variant="secondary" className="text-[10px] hover:bg-accent cursor-pointer">
                <TagIcon className="w-2.5 h-2.5 mr-0.5 opacity-60" />
                {t.name}
              </Badge>
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 pt-2 border-t border-border/40">
          <span>{formatDate(note.created_at)}</span>

          {note.source && (
            <a
              href={note.source}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-foreground transition-colors max-w-[120px] truncate"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="truncate">{note.source}</span>
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}
