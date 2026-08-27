import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/lib/api-client'
import { ApiResponse, GeneratedLearningPathResponse, GeneratedPathStep } from '@/types'
import { Sparkles, Check, Trash2, Plus, ArrowRight } from 'lucide-react'

interface AIPathGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onSavePath: (path: { title: string; description: string; steps: GeneratedPathStep[] }) => Promise<void>
}

export function AIPathGeneratorModal({
  isOpen,
  onClose,
  onSavePath,
}: AIPathGeneratorModalProps) {
  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedData, setGeneratedData] = useState<GeneratedLearningPathResponse | null>(null)

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!topic.trim() || isGenerating) return

    setIsGenerating(true)
    try {
      const res = await apiClient.post<ApiResponse<GeneratedLearningPathResponse>>(
        '/learning-paths/generate',
        { topic: topic.trim() }
      )
      setGeneratedData(res.data.data)
    } catch (err) {
      console.error('Failed to generate learning path', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpdateStep = (index: number, field: keyof GeneratedPathStep, value: string) => {
    if (!generatedData) return
    const updated = [...generatedData.steps]
    updated[index] = { ...updated[index], [field]: value }
    setGeneratedData({ ...generatedData, steps: updated })
  }

  const handleDeleteStep = (index: number) => {
    if (!generatedData) return
    const updated = generatedData.steps.filter((_, i) => i !== index)
    setGeneratedData({ ...generatedData, steps: updated })
  }

  const handleAddStep = () => {
    if (!generatedData) return
    const newStep: GeneratedPathStep = {
      title: 'New Step',
      description: 'Step description',
      concept_name: 'Concept Name',
    }
    setGeneratedData({ ...generatedData, steps: [...generatedData.steps, newStep] })
  }

  const handleConfirmSave = async () => {
    if (!generatedData || isSaving) return
    setIsSaving(true)
    try {
      await onSavePath({
        title: generatedData.title,
        description: generatedData.description,
        steps: generatedData.steps,
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Learning Path with AI"
      description="Enter any technical topic to automatically synthesize a step-by-step curriculum."
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Topic Input */}
        <form onSubmit={handleGenerate} className="flex items-center gap-2">
          <Input
            placeholder="e.g. Agentic AI, RAG Systems, Distributed Databases, Rust..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isGenerating}
            className="flex-1"
          />
          <Button type="submit" isLoading={isGenerating} disabled={!topic.trim()}>
            <Sparkles className="w-4 h-4 mr-1.5" />
            Generate
          </Button>
        </form>

        {/* Generated Curriculum Preview & Editing */}
        {generatedData && (
          <div className="space-y-4 pt-3 border-t border-border/60 animate-in fade-in">
            <div className="space-y-2">
              <Input
                value={generatedData.title}
                onChange={(e) => setGeneratedData({ ...generatedData, title: e.target.value })}
                className="font-bold text-base"
              />
              <Input
                value={generatedData.description}
                onChange={(e) => setGeneratedData({ ...generatedData, description: e.target.value })}
                className="text-xs text-muted-foreground"
              />
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {generatedData.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-nova-400 font-semibold">
                      Step {idx + 1}
                    </span>
                    <button
                      onClick={() => handleDeleteStep(idx)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Input
                    value={step.title}
                    onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
                    className="h-8 text-xs font-semibold"
                    placeholder="Step Title"
                  />
                  <Input
                    value={step.description}
                    onChange={(e) => handleUpdateStep(idx, 'description', e.target.value)}
                    className="h-8 text-xs text-muted-foreground"
                    placeholder="Step Description"
                  />
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={handleAddStep} className="w-full text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Custom Step
            </Button>

            {/* Confirm Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleConfirmSave} isLoading={isSaving}>
                <Check className="w-4 h-4 mr-1.5" />
                Confirm & Save Path
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
