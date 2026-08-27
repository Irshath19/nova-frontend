import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge, KnowledgeLevelBadge } from '@/components/ui/Badge'
import { ConceptDetail, KnowledgeLevel } from '@/types'
import { formatDate } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  BookOpen,
  Network,
  ArrowRight,
  ExternalLink,
  Edit2,
  Check,
  Tag as TagIcon,
} from 'lucide-react'

interface ConceptDetailModalProps {
  isOpen: boolean
  onClose: () => void
  conceptDetail: ConceptDetail | null
  onUpdateLevel?: (conceptId: string, level: KnowledgeLevel) => Promise<void>
  onSelectRelatedConcept?: (conceptId: string) => void
  onSelectRelatedNote?: (noteId: string) => void
}

export function ConceptDetailModal({
  isOpen,
  onClose,
  conceptDetail,
  onUpdateLevel,
  onSelectRelatedConcept,
  onSelectRelatedNote,
}: ConceptDetailModalProps) {
  const navigate = useNavigate()
  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false)

  if (!conceptDetail) return null

  const levels: KnowledgeLevel[] = ['NEW', 'FAMILIAR', 'LEARNING', 'INTERMEDIATE', 'STRONG']

  const handleLevelChange = async (newLevel: KnowledgeLevel) => {
    if (onUpdateLevel && newLevel !== conceptDetail.knowledge_level) {
      setIsUpdatingLevel(true)
      try {
        await onUpdateLevel(conceptDetail.id, newLevel)
      } finally {
        setIsUpdatingLevel(false)
      }
    }
  }

  const handleAskTutor = () => {
    onClose()
    navigate(`/tutor?concept=${conceptDetail.id}&name=${encodeURIComponent(conceptDetail.name)}`)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={conceptDetail.name}
      description={`Created ${formatDate(conceptDetail.created_at)}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Knowledge Level Selector */}
        <div className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Knowledge Mastery Level
            </span>
            <KnowledgeLevelBadge level={conceptDetail.knowledge_level} />
          </div>

          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {levels.map((lvl) => (
              <button
                key={lvl}
                disabled={isUpdatingLevel}
                onClick={() => handleLevelChange(lvl)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center ${
                  conceptDetail.knowledge_level === lvl
                    ? 'bg-nova-500 text-white border-nova-400 font-semibold shadow-sm'
                    : 'bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            What is it?
          </h4>
          <div className="p-4 rounded-xl bg-muted/20 border border-border/40 text-sm text-foreground/90 leading-relaxed">
            {conceptDetail.description || 'No description added yet.'}
          </div>
        </div>

        {/* Related Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Related Notes ({conceptDetail.related_notes.length})</span>
            </h4>
          </div>

          {conceptDetail.related_notes.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {conceptDetail.related_notes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    onClose()
                    onSelectRelatedNote?.(n.id)
                  }}
                  className="p-3 rounded-xl border border-border/60 bg-card/40 hover:bg-accent/60 hover:border-nova-500/30 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-medium text-xs text-foreground line-clamp-1">{n.title}</h5>
                    {n.summary && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{n.summary}</p>
                    )}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/70 italic">No notes linked to this concept yet.</p>
          )}
        </div>

        {/* Related Concepts */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
            <Network className="w-3.5 h-3.5" />
            <span>Connected Concepts ({conceptDetail.related_concepts.length})</span>
          </h4>

          {conceptDetail.related_concepts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {conceptDetail.related_concepts.map((rc) => (
                <div
                  key={rc.id}
                  onClick={() => onSelectRelatedConcept?.(rc.id)}
                  className="p-3 rounded-xl border border-border/60 bg-card/40 hover:bg-accent/60 hover:border-nova-500/30 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-medium text-xs text-foreground block truncate">{rc.name}</span>
                    <span className="text-[10px] font-mono text-nova-400 uppercase">{rc.relationship_type}</span>
                  </div>
                  <KnowledgeLevelBadge level={rc.knowledge_level} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/70 italic">No graph relationships connected yet.</p>
          )}
        </div>

        {/* Tags */}
        {conceptDetail.tags.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <TagIcon className="w-3 h-3" />
              <span>Associated Tags</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {conceptDetail.tags.map((t, idx) => (
                <Badge key={idx} variant="secondary">
                  #{t}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Button variant="secondary" size="sm" onClick={handleAskTutor}>
            <Sparkles className="w-4 h-4 mr-1.5 text-nova-400" />
            Teach me in AI Tutor
          </Button>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
