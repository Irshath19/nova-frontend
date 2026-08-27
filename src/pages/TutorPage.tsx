import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TutorChatView } from '@/features/tutor/TutorChatView'
import { ConceptDetailModal } from '@/features/concepts/ConceptDetailModal'
import { Modal } from '@/components/ui/Modal'
import { apiClient } from '@/lib/api-client'
import { ApiResponse, ConceptDetail, Note, SourceReference } from '@/types'

export function TutorPage() {
  const [searchParams] = useSearchParams()
  const conceptId = searchParams.get('concept')
  const conceptName = searchParams.get('name')

  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [selectedConceptDetail, setSelectedConceptDetail] = useState<ConceptDetail | null>(null)

  const handleSelectSource = async (source: SourceReference) => {
    try {
      if (source.type === 'note') {
        const res = await apiClient.get<ApiResponse<Note>>(`/notes/${source.id}`)
        setSelectedNote(res.data.data)
      } else {
        const res = await apiClient.get<ApiResponse<ConceptDetail>>(`/concepts/${source.id}`)
        setSelectedConceptDetail(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load source', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">AI Knowledge Tutor</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Engage in adaptive, multi-turn dialogues grounded strictly in your personal notes and knowledge graph.
        </p>
      </div>

      {/* Tutor Interactive View */}
      <TutorChatView
        initialConceptId={conceptId}
        initialConceptName={conceptName}
        onSelectSource={handleSelectSource}
      />

      {/* Source Note Modal */}
      <Modal
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        title={selectedNote?.title || 'Note'}
        maxWidth="2xl"
      >
        {selectedNote && (
          <div className="space-y-3">
            {selectedNote.summary && (
              <div className="p-3 rounded-xl bg-nova-500/10 text-xs text-muted-foreground">
                <span className="font-semibold text-nova-400 block mb-1">AI Summary</span>
                {selectedNote.summary}
              </div>
            )}
            <div
              className="text-sm text-foreground/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selectedNote.content }}
            />
          </div>
        )}
      </Modal>

      {/* Source Concept Modal */}
      <ConceptDetailModal
        isOpen={!!selectedConceptDetail}
        onClose={() => setSelectedConceptDetail(null)}
        conceptDetail={selectedConceptDetail}
      />
    </div>
  )
}
