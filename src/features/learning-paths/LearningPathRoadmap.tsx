import React from 'react'
import { LearningPath, PathItemStatus } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Circle, Clock, ArrowRight, Trash2 } from 'lucide-react'

interface LearningPathRoadmapProps {
  path: LearningPath
  onUpdateStatus: (pathId: string, itemId: string, status: PathItemStatus) => Promise<void>
  onSelectConcept?: (conceptId: string) => void
  onDeletePath?: (pathId: string) => void
}

export function LearningPathRoadmap({
  path,
  onUpdateStatus,
  onSelectConcept,
  onDeletePath,
}: LearningPathRoadmapProps) {
  const progressPct =
    path.total_items > 0 ? Math.round((path.completed_items / path.total_items) * 100) : 0

  const getNextStatus = (current: PathItemStatus): PathItemStatus => {
    if (current === 'NOT_STARTED') return 'IN_PROGRESS'
    if (current === 'IN_PROGRESS') return 'COMPLETED'
    return 'NOT_STARTED'
  }

  const renderStatusIcon = (status: PathItemStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
      case 'NOT_STARTED':
      default:
        return <Circle className="w-5 h-5 text-muted-foreground/50" />
    }
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">{path.title}</h3>
          {path.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{path.description}</p>
          )}
        </div>

        {onDeletePath && (
          <button
            onClick={() => onDeletePath(path.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete Path"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Curriculum Progress</span>
          <span className="font-mono text-nova-400 font-semibold">
            {path.completed_items} of {path.total_items} steps ({progressPct}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-nova-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3 pt-2">
        {path.items.map((item, idx) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
              item.status === 'COMPLETED'
                ? 'bg-emerald-950/10 border-emerald-500/20'
                : item.status === 'IN_PROGRESS'
                ? 'bg-amber-950/10 border-amber-500/30'
                : 'bg-card/40 border-border/60 hover:border-border'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <button
                onClick={() => onUpdateStatus(path.id, item.id, getNextStatus(item.status))}
                className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
                title="Click to toggle status"
              >
                {renderStatusIcon(item.status)}
              </button>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">Step {idx + 1}</span>
                  <h4
                    className={`font-semibold text-sm truncate ${
                      item.status === 'COMPLETED'
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {item.concept?.name || `Step ${idx + 1}`}
                  </h4>
                </div>
                {item.concept?.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.concept.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {item.concept_id && onSelectConcept && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectConcept(item.concept_id)}
                  className="text-xs h-7 px-2"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
