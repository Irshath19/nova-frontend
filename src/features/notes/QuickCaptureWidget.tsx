import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/lib/api-client'
import { ApiResponse, Note } from '@/types'
import { Sparkles, Zap, Check } from 'lucide-react'

interface QuickCaptureWidgetProps {
  onCaptured?: (note: Note) => void
  placeholder?: string
  className?: string
}

export function QuickCaptureWidget({
  onCaptured,
  placeholder = 'What did you learn just now? (e.g. JWT is a stateless authentication token...)',
  className,
}: QuickCaptureWidgetProps) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [justCaptured, setJustCaptured] = useState(false)

  const handleCapture = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    try {
      const res = await apiClient.post<ApiResponse<Note>>('/notes/quick-capture', {
        content: content.trim(),
        title: title.trim() || undefined,
        source: source.trim() || undefined,
      })

      const newNote = res.data.data
      setContent('')
      setTitle('')
      setSource('')
      setIsExpanded(false)
      setJustCaptured(true)
      setTimeout(() => setJustCaptured(false), 2500)

      if (onCaptured) {
        onCaptured(newNote)
      }
    } catch (err) {
      console.error('Failed to capture note', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleCapture()
    }
  }

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-card/80 p-4 backdrop-blur-md shadow-lg transition-all focus-within:border-nova-500/50 ${className || ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-nova-500/20 text-nova-400 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Capture
          </span>
        </div>

        {justCaptured && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Captured & Processing in background!</span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mb-3 space-y-2 animate-in fade-in duration-150">
          <Input
            placeholder="Title (optional, AI auto-generates if blank)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Source URL or Reference (optional)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      )}

      <Textarea
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setIsExpanded(true)}
        onKeyDown={handleKeyDown}
        className="min-h-[72px] text-sm resize-none"
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-[11px] text-muted-foreground/70 hidden sm:inline-block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-mono">⌘ + Enter</kbd> to capture instantly
        </span>

        <div className="flex items-center gap-2 ml-auto">
          {isExpanded && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              Compact
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => handleCapture()}
            isLoading={isLoading}
            disabled={!content.trim()}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Capture
          </Button>
        </div>
      </div>
    </div>
  )
}
