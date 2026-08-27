import React from 'react'
import { cn } from '@/lib/utils'
import { KnowledgeLevel, ProcessingStatus } from '@/types'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'info' | 'purple'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-nova-500/15 text-nova-400 border-nova-500/25',
    secondary: 'bg-secondary text-muted-foreground border-border/50',
    outline: 'border-border text-foreground bg-transparent',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border select-none transition-colors gap-1',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function KnowledgeLevelBadge({ level }: { level: KnowledgeLevel }) {
  switch (level) {
    case 'STRONG':
      return <Badge variant="success">Strong</Badge>
    case 'INTERMEDIATE':
      return <Badge variant="info">Intermediate</Badge>
    case 'LEARNING':
      return <Badge variant="warning">Learning</Badge>
    case 'FAMILIAR':
      return <Badge variant="purple">Familiar</Badge>
    case 'NEW':
    default:
      return <Badge variant="secondary">New</Badge>
  }
}

export function ProcessingStatusBadge({ status }: { status: ProcessingStatus }) {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="success" className="text-[11px]">✓ Processed</Badge>
    case 'PROCESSING':
      return (
        <Badge variant="warning" className="text-[11px] animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1 animate-ping" />
          Processing
        </Badge>
      )
    case 'FAILED':
      return <Badge variant="outline" className="text-red-400 border-red-500/30 text-[11px]">Failed</Badge>
    case 'PENDING':
    default:
      return <Badge variant="secondary" className="text-[11px]">⏳ Queued</Badge>
  }
}
