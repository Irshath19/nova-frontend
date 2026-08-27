import React from 'react'
import { AskKnowledgeResponse, SourceReference } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Sparkles, BookOpen, Network, ShieldCheck, HelpCircle } from 'lucide-react'

interface AskKnowledgeViewProps {
  response: AskKnowledgeResponse | null
  isLoading?: boolean
  query: string
  onSelectSource: (source: SourceReference) => void
}

export function AskKnowledgeView({
  response,
  isLoading,
  query,
  onSelectSource,
}: AskKnowledgeViewProps) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-border/80 bg-card/60 space-y-4 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-nova-500/30" />
          <div className="w-40 h-4 rounded bg-muted/60" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-3 rounded bg-muted/40" />
          <div className="w-5/6 h-3 rounded bg-muted/40" />
          <div className="w-4/6 h-3 rounded bg-muted/40" />
        </div>
      </div>
    )
  }

  if (!response) return null

  const isInsufficient = response.confidence === 'insufficient_knowledge'

  return (
    <div className="space-y-4">
      {/* Answer Card */}
      <div
        className={`p-6 rounded-2xl border backdrop-blur-md shadow-lg space-y-4 ${
          isInsufficient
            ? 'bg-amber-950/20 border-amber-500/30'
            : 'bg-card/80 border-border/80'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-nova-500/20 text-nova-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">NOVA AI Answer</h3>
              <p className="text-[11px] text-muted-foreground">Synthesized from your personal knowledge base</p>
            </div>
          </div>

          <Badge
            variant={
              response.confidence === 'high'
                ? 'success'
                : response.confidence === 'medium'
                ? 'info'
                : 'warning'
            }
            className="text-[11px]"
          >
            {response.confidence === 'high' ? (
              <ShieldCheck className="w-3 h-3 mr-1" />
            ) : (
              <HelpCircle className="w-3 h-3 mr-1" />
            )}
            {response.confidence === 'high'
              ? 'Grounded in Knowledge Base'
              : response.confidence === 'medium'
              ? 'Partial Knowledge Grounding'
              : 'Insufficient Stored Knowledge'}
          </Badge>
        </div>

        <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {response.answer}
        </div>

        {/* Sources Section */}
        {response.sources.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grounded Knowledge Sources ({response.sources.length})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {response.sources.map((src) => (
                <div
                  key={src.id}
                  onClick={() => onSelectSource(src)}
                  className="p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-accent/70 hover:border-nova-500/40 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      {src.type === 'note' ? (
                        <BookOpen className="w-3 h-3 text-nova-400 shrink-0" />
                      ) : (
                        <Network className="w-3 h-3 text-cyan-400 shrink-0" />
                      )}
                      <span className="font-medium text-xs text-foreground truncate">{src.title}</span>
                    </div>
                    {src.excerpt && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{src.excerpt}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                    {src.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
