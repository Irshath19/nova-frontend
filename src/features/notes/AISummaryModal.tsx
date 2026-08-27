import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SummarizeResponse } from '@/types'
import { Sparkles, Check, ArrowRight, Lightbulb } from 'lucide-react'

interface AISummaryModalProps {
  isOpen: boolean
  onClose: () => void
  summaryData: SummarizeResponse | null
  onApplySummary: (summary: string) => void
  isLoading?: boolean
}

export function AISummaryModal({
  isOpen,
  onClose,
  summaryData,
  onApplySummary,
  isLoading = false,
}: AISummaryModalProps) {
  if (!summaryData) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Knowledge Synthesis & Summary"
      description="Review the generated structure before applying changes to your note."
      maxWidth="2xl"
    >
      <div className="space-y-5 text-sm">
        {/* Title & Summary */}
        <div className="p-4 rounded-xl bg-nova-500/10 border border-nova-500/20 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-nova-400" />
            <h4 className="font-semibold text-foreground text-base">{summaryData.title}</h4>
          </div>
          <p className="text-muted-foreground leading-relaxed">{summaryData.summary}</p>
        </div>

        {/* Key Concepts */}
        {summaryData.key_concepts.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Key Concepts Extracted
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {summaryData.key_concepts.map((c, i) => (
                <Badge key={i} variant="info">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Important Points */}
        {summaryData.important_points.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Core Takeaways
            </h5>
            <ul className="space-y-1.5 list-disc pl-4 text-muted-foreground">
              {summaryData.important_points.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Practical Example */}
        {summaryData.practical_example && (
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Practical Example / Application</span>
            </div>
            <p className="text-xs text-muted-foreground">{summaryData.practical_example}</p>
          </div>
        )}

        {/* Next Topics */}
        {summaryData.things_to_learn_next.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Recommended Next Topics
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {summaryData.things_to_learn_next.map((topic, i) => (
                <Badge key={i} variant="secondary">
                  <ArrowRight className="w-3 h-3 mr-1 opacity-60" />
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onApplySummary(summaryData.summary)
              onClose()
            }}
            isLoading={isLoading}
          >
            <Check className="w-4 h-4 mr-1.5" />
            Apply Summary
          </Button>
        </div>
      </div>
    </Modal>
  )
}
