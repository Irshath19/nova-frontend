import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { ApiResponse, Concept, ConceptDetail, KnowledgeLevel } from '@/types'
import { ConceptCard } from '@/features/concepts/ConceptCard'
import { ConceptDetailModal } from '@/features/concepts/ConceptDetailModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { Plus, Search, Brain, Filter } from 'lucide-react'

export function ConceptsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')

  // Modals state
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newConceptName, setNewConceptName] = useState('')
  const [newConceptDesc, setNewConceptDesc] = useState('')
  const [newConceptLevel, setNewConceptLevel] = useState<KnowledgeLevel>('NEW')

  // Fetch Concepts List
  const { data: concepts, isLoading } = useQuery({
    queryKey: ['concepts', selectedLevel, search],
    queryFn: async () => {
      const params: any = {}
      if (selectedLevel !== 'ALL') params.knowledge_level = selectedLevel
      if (search) params.search = search
      const res = await apiClient.get<ApiResponse<Concept[]>>('/concepts', { params })
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

  const handleOpenConcept = (conceptId: string) => {
    setSelectedConceptId(conceptId)
    setIsDetailModalOpen(true)
  }

  const handleUpdateLevel = async (conceptId: string, level: KnowledgeLevel) => {
    await apiClient.put(`/concepts/${conceptId}`, { knowledge_level: level })
    queryClient.invalidateQueries({ queryKey: ['concepts'] })
    queryClient.invalidateQueries({ queryKey: ['concept_detail', conceptId] })
    queryClient.invalidateQueries({ queryKey: ['progress_metrics'] })
  }

  const handleCreateConcept = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newConceptName.trim()) return

    await apiClient.post('/concepts', {
      name: newConceptName.trim(),
      description: newConceptDesc.trim() || undefined,
      knowledge_level: newConceptLevel,
    })

    setNewConceptName('')
    setNewConceptDesc('')
    setNewConceptLevel('NEW')
    setIsCreateModalOpen(false)
    queryClient.invalidateQueries({ queryKey: ['concepts'] })
    queryClient.invalidateQueries({ queryKey: ['progress_metrics'] })
  }

  const levels = [
    { label: 'All Levels', value: 'ALL' },
    { label: 'Strong', value: 'STRONG' },
    { label: 'Intermediate', value: 'INTERMEDIATE' },
    { label: 'Learning', value: 'LEARNING' },
    { label: 'Familiar', value: 'FAMILIAR' },
    { label: 'New', value: 'NEW' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Concept Cards</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Browse, track mastery levels, and inspect connections between technical concepts.
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} size="md" className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Concept
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-md">
        <div className="flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search concepts by name or definition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {levels.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => setSelectedLevel(lvl.value)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                selectedLevel === lvl.value
                  ? 'bg-nova-500 text-white font-semibold shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Concept Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-card/40 border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : concepts && concepts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {concepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              onClick={() => handleOpenConcept(concept.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl border border-dashed border-border/80 bg-card/20 space-y-3">
          <Brain className="w-8 h-8 text-muted-foreground/50 mx-auto" />
          <h3 className="font-semibold text-sm text-foreground">No concepts found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search || selectedLevel !== 'ALL'
              ? 'Try clearing your search query or level filters.'
              : 'Add your first concept or capture notes to extract them automatically.'}
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            variant="outline"
            className="mt-2 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Concept
          </Button>
        </div>
      )}

      {/* Concept Detail Modal */}
      <ConceptDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        conceptDetail={selectedConceptDetail || null}
        onUpdateLevel={handleUpdateLevel}
        onSelectRelatedConcept={(conceptId) => setSelectedConceptId(conceptId)}
      />

      {/* Create Concept Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Knowledge Concept"
        description="Define an atomic concept to track in your personal knowledge graph."
        maxWidth="md"
      >
        <form onSubmit={handleCreateConcept} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Concept Name</label>
            <Input
              placeholder="e.g. Prompt Caching, Vector Indexing, HNSW..."
              value={newConceptName}
              onChange={(e) => setNewConceptName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Description / Technical Definition</label>
            <Textarea
              placeholder="Explain the core technical idea..."
              value={newConceptDesc}
              onChange={(e) => setNewConceptDesc(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Initial Knowledge Level</label>
            <div className="grid grid-cols-5 gap-1">
              {(['NEW', 'FAMILIAR', 'LEARNING', 'INTERMEDIATE', 'STRONG'] as KnowledgeLevel[]).map(
                (lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setNewConceptLevel(lvl)}
                    className={`py-1 rounded-lg text-xs font-medium border transition-all ${
                      newConceptLevel === lvl
                        ? 'bg-nova-500 text-white border-nova-400 font-semibold'
                        : 'bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!newConceptName.trim()}>
              Create Concept
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
