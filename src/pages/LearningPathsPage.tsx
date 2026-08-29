import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  ApiResponse,
  ConceptDetail,
  GeneratedPathStep,
  LearningPath,
  LearningPathStepInput,
  PathItemStatus,
} from '@/types'
import { LearningPathRoadmap } from '@/features/learning-paths/LearningPathRoadmap'
import { AIPathGeneratorModal } from '@/features/learning-paths/AIPathGeneratorModal'
import { ConceptDetailModal } from '@/features/concepts/ConceptDetailModal'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Plus, Sparkles, Compass, Trash2, Layers } from 'lucide-react'

export function LearningPathsPage() {
  const queryClient = useQueryClient()
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [steps, setSteps] = useState<LearningPathStepInput[]>([
    { title: '', description: '' },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Concept Detail Modal state
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
    const formattedSteps: LearningPathStepInput[] = pathData.steps.map((s) => ({
      title: s.title || s.concept_name,
      description: s.description,
    }))

    await apiClient.post('/learning-paths', {
      title: pathData.title,
      description: pathData.description,
      steps: formattedSteps,
    })

    queryClient.invalidateQueries({ queryKey: ['learning_paths'] })
    queryClient.invalidateQueries({ queryKey: ['progress_metrics'] })
  }

  const openCreateModal = () => {
    setEditingPath(null)
    setNewTitle('')
    setNewDesc('')
    setSteps([{ title: '', description: '' }])
    setIsCreateModalOpen(true)
  }

  const handleOpenEditModal = (path: LearningPath) => {
    setEditingPath(path)
    setNewTitle(path.title)
    setNewDesc(path.description || '')
    const existingSteps: LearningPathStepInput[] =
      path.items.length > 0
        ? path.items.map((i) => ({
            title: i.title || i.concept?.name || '',
            description: i.description || i.concept?.description || '',
            status: i.status,
            concept_id: i.concept_id || undefined,
          }))
        : [{ title: '', description: '' }]
    setSteps(existingSteps)
    setIsCreateModalOpen(true)
  }

  const handleAddStep = () => {
    setSteps((prev) => [...prev, { title: '', description: '' }])
  }

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStepChange = (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    setSteps((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSubmitPathForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || isSubmitting) return

    // Filter out steps with empty titles
    const validSteps = steps
      .map((s) => ({
        title: s.title.trim(),
        description: s.description?.trim() || undefined,
        status: s.status,
        concept_id: s.concept_id,
      }))
      .filter((s) => s.title.length > 0)

    if (validSteps.length === 0) {
      alert('Please provide at least one step for your learning path.')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingPath) {
        await apiClient.put(`/learning-paths/${editingPath.id}`, {
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          steps: validSteps,
        })
      } else {
        await apiClient.post('/learning-paths', {
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          steps: validSteps,
        })
      }

      setIsCreateModalOpen(false)
      setEditingPath(null)
      queryClient.invalidateQueries({ queryKey: ['learning_paths'] })
      queryClient.invalidateQueries({ queryKey: ['progress_metrics'] })
    } catch (err) {
      console.error('Failed to save learning path:', err)
    } finally {
      setIsSubmitting(false)
    }
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
          <Button variant="secondary" size="md" onClick={openCreateModal}>
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
              onEditPath={handleOpenEditModal}
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

      {/* Custom Multi-Step Path Creator/Editor Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingPath(null)
        }}
        title={editingPath ? 'Edit Learning Path' : 'Create Custom Learning Path'}
        description={
          editingPath
            ? 'Update your goal, milestone steps, or reorganize your curriculum.'
            : 'Set your goal and add step-by-step milestones to achieve it.'
        }
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitPathForm} className="space-y-5 max-h-[75vh] flex flex-col">
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Goal Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Goal / Title</span>
                <span className="text-[10px] text-muted-foreground font-normal">Required</span>
              </label>
              <Input
                placeholder="e.g. AI Engineering, Full Stack System Design"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="font-semibold text-sm h-10"
                required
              />
            </div>

            {/* Goal Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                Goal Description <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Textarea
                placeholder="Brief summary of objectives and competencies to achieve..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="text-xs resize-none"
              />
            </div>

            <div className="pt-2 border-t border-border/60">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-nova-400" />
                  <h4 className="text-xs font-bold text-foreground">Roadmap Steps</h4>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-muted text-muted-foreground">
                    {steps.length}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">Add steps in sequential order</span>
              </div>

              {/* Dynamic Steps List */}
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border/80 bg-card/60 space-y-2 relative group transition-colors hover:border-border"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-nova-500/15 text-nova-400 border border-nova-500/20">
                          Step {idx + 1}
                        </span>
                      </div>

                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="p-1 rounded-md text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove Step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Input
                        placeholder={`Step ${idx + 1} Title (e.g. ${
                          idx === 0 ? 'Python' : idx === 1 ? 'NumPy & Pandas' : 'Deep Learning'
                        })`}
                        value={step.title}
                        onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                        className="h-8 text-xs font-medium bg-background/60"
                        required
                      />
                      <Input
                        placeholder="Description (e.g. Learn core Python, OOP, and data structures)"
                        value={step.description || ''}
                        onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                        className="h-7 text-[11px] bg-background/40 text-muted-foreground focus:text-foreground"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Step Button */}
              <button
                type="button"
                onClick={handleAddStep}
                className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-nova-500/30 hover:border-nova-500/60 bg-nova-500/5 hover:bg-nova-500/10 text-nova-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Next Step</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60 shrink-0">
            <span className="text-[11px] text-muted-foreground">
              {steps.filter((s) => s.title.trim()).length} steps configured
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setEditingPath(null)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!newTitle.trim() || steps.every((s) => !s.title.trim()) || isSubmitting}
                isLoading={isSubmitting}
                className="shadow-md shadow-nova-500/20"
              >
                {editingPath ? 'Save Changes' : 'Create Learning Path'}
              </Button>
            </div>
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
export default LearningPathsPage
