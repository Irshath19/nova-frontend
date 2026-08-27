import React from 'react'
import { Card } from '@/components/ui/Card'
import { KnowledgeLevelBadge } from '@/components/ui/Badge'
import { Concept, KnowledgeLevel } from '@/types'
import { BookOpen, Network, ChevronRight } from 'lucide-react'

interface ConceptCardProps {
  concept: Concept
  onClick?: () => void
  onLevelChange?: (newLevel: KnowledgeLevel) => void
}

export function ConceptCard({ concept, onClick }: ConceptCardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer group hover:border-nova-500/40 hover:bg-card/90 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground text-base group-hover:text-nova-400 transition-colors">
            {concept.name}
          </h3>
          <KnowledgeLevelBadge level={concept.knowledge_level} />
        </div>

        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
          {concept.description || 'No description recorded yet. Click to view or edit.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-xs text-muted-foreground">
        <span className="font-mono text-[11px] text-muted-foreground/60">ID: {concept.name.toLowerCase().replace(/\s+/g, '-')}</span>
        <div className="flex items-center gap-1 text-nova-400 text-xs font-medium group-hover:translate-x-0.5 transition-transform">
          <span>Explore</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Card>
  )
}
