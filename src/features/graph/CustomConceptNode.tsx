import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { KnowledgeLevel } from '@/types'

interface CustomConceptNodeData {
  name: string
  knowledge_level: KnowledgeLevel
  connections_count: number
  notes_count: number
  isSelected?: boolean
}

export const CustomConceptNode = memo(({ data }: { data: CustomConceptNodeData }) => {
  const getLevelBorder = (level: KnowledgeLevel) => {
    switch (level) {
      case 'STRONG':
        return 'border-emerald-500/70 bg-emerald-950/40 text-emerald-300 shadow-emerald-500/10'
      case 'INTERMEDIATE':
        return 'border-cyan-500/70 bg-cyan-950/40 text-cyan-300 shadow-cyan-500/10'
      case 'LEARNING':
        return 'border-amber-500/70 bg-amber-950/40 text-amber-300 shadow-amber-500/10'
      case 'FAMILIAR':
        return 'border-purple-500/70 bg-purple-950/40 text-purple-300 shadow-purple-500/10'
      case 'NEW':
      default:
        return 'border-slate-600/70 bg-slate-900/60 text-slate-300 shadow-slate-500/10'
    }
  }

  return (
    <div
      className={`px-4 py-2.5 rounded-2xl border-2 backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer min-w-[130px] max-w-[220px] ${getLevelBorder(
        data.knowledge_level
      )} ${data.isSelected ? 'ring-4 ring-nova-500 scale-105 shadow-nova-500/30' : 'hover:scale-105'}`}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-nova-400 !border-none" />

      <div className="flex flex-col">
        <span className="font-semibold text-xs truncate leading-tight">{data.name}</span>
        <div className="flex items-center justify-between mt-1 text-[10px] opacity-75 font-mono">
          <span className="capitalize">{data.knowledge_level.toLowerCase()}</span>
          <span>{data.connections_count} links</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-nova-400 !border-none" />
    </div>
  )
})

CustomConceptNode.displayName = 'CustomConceptNode'
