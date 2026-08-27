import React, { useState, useMemo, useCallback } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CustomConceptNode } from './CustomConceptNode'
import { GraphResponse, KnowledgeLevel } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Search, Filter, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

const nodeTypes = {
  conceptNode: CustomConceptNode,
}

interface KnowledgeGraphViewProps {
  graphData: GraphResponse
  onSelectConcept: (conceptId: string) => void
  selectedConceptId?: string | null
  isLoading?: boolean
  onRefresh?: () => void
}

export function KnowledgeGraphView({
  graphData,
  onSelectConcept,
  selectedConceptId,
  isLoading = false,
  onRefresh,
}: KnowledgeGraphViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')

  // Generate node positions in radial / circle layout
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodesCount = graphData.nodes.length
    const radius = Math.max(260, nodesCount * 32)
    const centerX = 400
    const centerY = 300

    const nodes: Node[] = graphData.nodes.map((n, idx) => {
      const angle = (idx / (nodesCount || 1)) * 2 * Math.PI
      const x = centerX + radius * Math.cos(angle) + (idx % 2 === 0 ? 30 : -30)
      const y = centerY + radius * Math.sin(angle) + (idx % 3 === 0 ? 20 : -20)

      const isMatchingSearch =
        !searchQuery || n.name.toLowerCase().includes(searchQuery.toLowerCase())
      const isMatchingLevel = selectedLevel === 'ALL' || n.knowledge_level === selectedLevel

      return {
        id: n.id,
        type: 'conceptNode',
        position: { x, y },
        data: {
          name: n.name,
          knowledge_level: n.knowledge_level,
          connections_count: n.connections_count,
          notes_count: n.notes_count,
          isSelected: n.id === selectedConceptId,
        },
        hidden: !isMatchingSearch || !isMatchingLevel,
      }
    })

    const edges: Edge[] = graphData.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.relationship_type.replace('_', ' ').toLowerCase(),
      type: 'smoothstep',
      animated: e.relationship_type === 'USES' || e.relationship_type === 'LEADS_TO',
      style: { stroke: '#3b82f6', strokeWidth: 1.5, opacity: 0.6 },
      labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#090d16', fillOpacity: 0.8 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 14,
        height: 14,
      },
    }))

    return { initialNodes: nodes, initialEdges: edges }
  }, [graphData, searchQuery, selectedLevel, selectedConceptId])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Sync state when props change
  React.useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectConcept(node.id)
    },
    [onSelectConcept]
  )

  const levels: Array<{ label: string; value: string }> = [
    { label: 'All Levels', value: 'ALL' },
    { label: 'Strong', value: 'STRONG' },
    { label: 'Intermediate', value: 'INTERMEDIATE' },
    { label: 'Learning', value: 'LEARNING' },
    { label: 'Familiar', value: 'FAMILIAR' },
    { label: 'New', value: 'NEW' },
  ]

  return (
    <div className="relative w-full h-[650px] rounded-3xl border border-border/80 bg-background/80 overflow-hidden shadow-2xl backdrop-blur-md flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-card/90 border border-border/80 p-1.5 rounded-2xl shadow-lg backdrop-blur-md">
          <Input
            placeholder="Filter graph concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-3.5 h-3.5" />}
            className="w-48 sm:w-64 h-8 text-xs border-none bg-transparent"
          />

          <div className="h-4 w-px bg-border/80 mx-1 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1">
            {levels.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setSelectedLevel(lvl.value)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                  selectedLevel === lvl.value
                    ? 'bg-nova-500 text-white font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {onRefresh && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              isLoading={isLoading}
              className="bg-card/90 backdrop-blur-md shadow-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.2}
          maxZoom={2.5}
        >
          <Background color="#1e293b" gap={24} size={1} variant={BackgroundVariant.Dots} />
          <Controls className="!bg-card/90 !border-border/80 !rounded-2xl !shadow-lg !overflow-hidden" />
          <MiniMap
            nodeColor={(n) => {
              const lvl = n.data?.knowledge_level as KnowledgeLevel
              if (lvl === 'STRONG') return '#10b981'
              if (lvl === 'INTERMEDIATE') return '#06b6d4'
              if (lvl === 'LEARNING') return '#f59e0b'
              if (lvl === 'FAMILIAR') return '#a855f7'
              return '#64748b'
            }}
            className="!bg-card/90 !border-border/80 !rounded-2xl !shadow-lg"
            maskColor="rgba(9, 13, 22, 0.7)"
          />
        </ReactFlow>
      </div>
    </div>
  )
}
