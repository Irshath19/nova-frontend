import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  ApiResponse,
  ConceptDetail,
  GeneratedPathStep,
  LearningPath,
  PathItemStatus,
} from '@/types'
import { LearningPathRoadmap } from '@/features/learning-paths/LearningPathRoadmap'
import { AIPathGeneratorModal } from '@/features/learning-paths/AIPathGeneratorModal'
import { ConceptDetailModal } from '@/features/concepts/ConceptDetailModal'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Plus, Sparkles, Compass } from 'lucide-react'

export function LearningPathsPage() {
  const queryClient = useQueryClient()
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  // Concept Detail Modal state
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null)
  const [selectedConceptDetail, setSelectedConceptDetail] = useState<ConceptDetail | null>(null)

  // Fetch Paths
  const { data: paths, isLoading } = useQuery({
    queryKey: ['learning_paths'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<LearningPath[]>>('/learning-paths')
      return res.data.data
    },
  })

  const handleUpdateItemStatus = async (
    pathId: string,
    itemId: string,
    status: PathItemStatus
  ) => {
    await apiClient.put(`/learning-paths/${pathId}/items/${itemId}`, { status })
    queryClient.invalidateQueries({ queryKey: ['learning_paths'] })
    queryClient.invalidateQueries({ queryKey: ['progress_metrics'] })
  }

  const handleDeletePath = async (pathId: string) => {
    if (confirm('Delete this learning path?')) {
      await apiClient.delete(`/learning-paths/${pathId}`)
      queryClient.invalidateQueries({ queryKey: ['learning_paths'] })
      queryClient.invalidateQueries({ queryKey: ['progress_metrics'] })
    }
  }

  const handleSaveAIGeneratedPath = async (pathData: {
    title: string
    description: string
    steps: GeneratedPathStep[]
  }) => {
    // 1. Ensure concepts exist or create them
    const conceptIds: string[] = []
    for (const s of pathData.steps) {
      const cRes = await apiClient.post<ApiResponse<{ id: string }>>('/concepts', {
        name: s.concept_name || s.title,
        description: s.description,
        knowledge_level: 'NEW',
      })
      conceptIds.push(cRes.data.data.id)
    }

    // 2. Create the learning path with those concept IDs
    await apiClient.post('/learning-paths', {
      title: pathData.title,
      description: pathData.description,
      concept_ids: conceptIds,
    })

    queryClient.invalidateQueries({ queryKey: ['learning_paths'] })
    queryClient.invalidateQueries({ queryKey: ['concepts'] })
    queryClient.invalidateQueries({ queryKey: ['progress_metrics'] })
  }

  const handleCreateCustomPath = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    await apiClient.post('/learning-paths', {
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      concept_ids: [],
    })

    setNewTitle('')
    setNewDesc('')
    setIsCreateModalOpen(false)
    queryClient.invalidateQueries({ queryKey: ['learning_paths'] })
    queryClient.invalidateQueries({ queryKey: ['progress_metrics'] })
  }

  const handleSelectConcept = async (conceptId: string) => {
    try {
      const res = await apiClient.get<ApiResponse<ConceptDetail>>(`/concepts/${conceptId}`)
      setSelectedConceptDetail(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Learning Paths</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Structured roadmaps designed to guide and track progressive concept mastery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Custom Path
          </Button>
          <Button size="md" onClick={() => setIsAIModalOpen(true)}>
            <Sparkles className="w-4 h-4 mr-1.5" />
            Generate with AI
          </Button>
        </div>
      </div>

      {/* Learning Paths List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-card/40 border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : paths && paths.length > 0 ? (
        <div className="space-y-6">
          {paths.map((path) => (
            <LearningPathRoadmap
              key={path.id}
              path={path}
              onUpdateStatus={handleUpdateItemStatus}
              onDeletePath={handleDeletePath}
              onSelectConcept={handleSelectConcept}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl border border-dashed border-border/80 bg-card/20 space-y-3">
          <Compass className="w-8 h-8 text-muted-foreground/50 mx-auto" />
          <h3 className="font-semibold text-sm text-foreground">No learning paths found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Create a custom roadmap or generate a curriculum automatically with AI.
          </p>
          <Button onClick={() => setIsAIModalOpen(true)} size="sm" className="mt-2 text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Generate with AI
          </Button>
        </div>
      )}

      {/* AI Path Generator Modal */}
      <AIPathGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSavePath={handleSaveAIGeneratedPath}
      />

      {/* Custom Path Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Learning Path"
        description="Define a new goal-oriented learning path."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCustomPath} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Path Title</label>
            <Input
              placeholder="e.g. Master Distributed Systems Architecture"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Goal Description</label>
            <Textarea
              placeholder="Summary of objectives and competencies to achieve..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!newTitle.trim()}>
              Create Path
            </Button>
          </div>
        </form>
      </Modal>

      {/* Concept Detail Modal */}
      <ConceptDetailModal
        isOpen={!!selectedConceptDetail}
        onClose={() => setSelectedConceptDetail(null)}
        conceptDetail={selectedConceptDetail}
      />
    </div>
  )
}
