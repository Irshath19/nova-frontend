import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { ApiResponse, ConceptDetail, GraphResponse, KnowledgeLevel } from '@/types'
import { KnowledgeGraphView } from '@/features/graph/KnowledgeGraphView'
import { ConceptDetailModal } from '@/features/concepts/ConceptDetailModal'
import { Network, Sparkles, Filter } from 'lucide-react'

export function GraphPage() {
  const queryClient = useQueryClient()
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Fetch Graph Data
  const { data: graphData, isLoading, refetch } = useQuery({
    queryKey: ['knowledge_graph'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<GraphResponse>>('/graph')
      return res.data.data
    },
  })

  // Fetch Selected Concept Detail
  const { data: selectedConceptDetail } = useQuery({
    queryKey: ['concept_detail', selectedConceptId],
    queryFn: async () => {
      if (!selectedConceptId) return null
      const res = await apiClient.get<ApiResponse<ConceptDetail>>(`/concepts/${selectedConceptId}`)
      return res.data.data
    },
    enabled: !!selectedConceptId,
  })

  const handleSelectConcept = (conceptId: string) => {
    setSelectedConceptId(conceptId)
    setIsDetailModalOpen(true)
  }

  const handleUpdateLevel = async (conceptId: string, level: KnowledgeLevel) => {
    await apiClient.put(`/concepts/${conceptId}`, { knowledge_level: level })
    queryClient.invalidateQueries({ queryKey: ['knowledge_graph'] })
    queryClient.invalidateQueries({ queryKey: ['concept_detail', conceptId] })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Network className="w-6 h-6 text-nova-400" />
            <span>Knowledge Graph</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Visual topology of your personal knowledge OS. Concepts are connected automatically as you learn.
          </p>
        </div>
      </div>

      {/* Graph Visualizer Canvas */}
      <KnowledgeGraphView
        graphData={graphData || { nodes: [], edges: [] }}
        onSelectConcept={handleSelectConcept}
        selectedConceptId={selectedConceptId}
        isLoading={isLoading}
        onRefresh={() => refetch()}
      />

      {/* Concept Detail Modal */}
      <ConceptDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        conceptDetail={selectedConceptDetail || null}
        onUpdateLevel={handleUpdateLevel}
        onSelectRelatedConcept={(conceptId) => setSelectedConceptId(conceptId)}
      />
    </div>
  )
}
