import React from 'react'
import { SearchResultItem } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Sparkles, FileText, ArrowRight, Tag as TagIcon } from 'lucide-react'

interface SemanticSearchViewProps {
  results: SearchResultItem[]
  isLoading?: boolean
  query: string
  onSelectNote: (noteId: string) => void
}

export function SemanticSearchView({
  results,
  isLoading,
  query,
  onSelectNote,
}: SemanticSearchViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-card/40 border border-border/40 animate-pulse" />
        ))}
      </div>
    )
  }

  if (query && results.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/30">
        <Sparkles className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
        <h4 className="font-semibold text-sm text-foreground">No matching notes found</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Try adjusting your search query or capture new notes to expand your knowledge base.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {results.map((item) => (
        <Card
          key={item.id}
          onClick={() => onSelectNote(item.id)}
          className="cursor-pointer group hover:border-nova-500/40 hover:bg-card/90 transition-all p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-nova-400 shrink-0" />
              <h4 className="font-semibold text-sm text-foreground group-hover:text-nova-400 transition-colors line-clamp-1">
                {item.title}
              </h4>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-mono text-muted-foreground">
                {Math.round(item.similarity * 100)}% match
              </span>
              <Badge variant="default" className="text-[10px] bg-nova-500/10 text-nova-400">
                Vector Similarity
              </Badge>
            </div>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {item.excerpt}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5 overflow-hidden">
              {item.concepts.slice(0, 2).map((c) => (
                <Badge key={c.id} variant="info" className="text-[10px]">
                  {c.name}
                </Badge>
              ))}
              {item.tags.slice(0, 2).map((t) => (
                <Badge key={t.id} variant="secondary" className="text-[10px]">
                  <TagIcon className="w-2.5 h-2.5 mr-0.5 opacity-60" />
                  {t.name}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-1 text-nova-400 font-medium group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
              <span>View note</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
