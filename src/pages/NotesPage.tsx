import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { ApiResponse, Note, PaginatedResponse, SummarizeResponse, Tag } from '@/types'
import { NoteCard } from '@/features/notes/NoteCard'
import { TipTapEditor } from '@/features/notes/TipTapEditor'
import { AISummaryModal } from '@/features/notes/AISummaryModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, Sparkles, Filter, Trash2, Edit3, Check } from 'lucide-react'

export function NotesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [source, setSource] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tagsList, setTagsList] = useState<string[]>([])

  // AI Summarizer State
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryData, setSummaryData] = useState<SummarizeResponse | null>(null)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)

  // Fetch Notes
  const { data, isLoading } = useQuery({
    queryKey: ['notes', page, search, selectedTag],
    queryFn: async () => {
      const params: any = { page, limit: 18 }
      if (search) params.search = search
      if (selectedTag) params.tag_id = selectedTag
      const res = await apiClient.get<ApiResponse<PaginatedResponse<Note>>>('/notes', { params })
      return res.data.data
    },
  })

  // Fetch Tags
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Tag[]>>('/tags')
      return res.data.data
    },
  })

  const openCreateModal = () => {
    setEditingNote(null)
    setTitle('')
    setContent('<p></p>')
    setSource('')
    setTagsList([])
    setIsEditorOpen(true)
  }

  const openEditModal = (note: Note) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setSource(note.source || '')
    setTagsList(note.tags.map((t) => t.name))
    setIsEditorOpen(true)
  }

  const handleSaveNote = async () => {
    if (!content.trim() || !title.trim()) return

    if (editingNote) {
      await apiClient.put(`/notes/${editingNote.id}`, {
        title,
        content,
        source: source || null,
        tag_names: tagsList,
      })
    } else {
      await apiClient.post('/notes', {
        title,
        content,
        source: source || null,
        tag_names: tagsList,
      })
    }

    queryClient.invalidateQueries({ queryKey: ['notes'] })
    queryClient.invalidateQueries({ queryKey: ['tags'] })
    queryClient.invalidateQueries({ queryKey: ['progress_metrics'] })
    setIsEditorOpen(false)
  }

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await apiClient.delete(`/notes/${noteId}`)
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['progress_metrics'] })
      setIsEditorOpen(false)
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tagsList.includes(tagInput.trim())) {
        setTagsList([...tagsList, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagName: string) => {
    setTagsList(tagsList.filter((t) => t !== tagName))
  }

  const handleTriggerAISummarizer = async () => {
    if (!content || isSummarizing) return
    setIsSummarizing(true)
    try {
      // Strip HTML tags for clean summarization
      const textOnly = content.replace(/<[^>]*>?/gm, ' ')
      const res = await apiClient.post<ApiResponse<SummarizeResponse>>('/ai/summarize', {
        content: textOnly,
      })
      setSummaryData(res.data.data)
      setIsSummaryModalOpen(true)
    } catch (err) {
      console.error('Failed to summarize note', err)
    } finally {
      setIsSummarizing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Captured Notes</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Capture, synthesize and organize atomic knowledge notes.
          </p>
        </div>

        <Button onClick={openCreateModal} size="md" className="shrink-0 shadow-lg shadow-nova-500/20">
          <Plus className="w-4 h-4 mr-1.5" />
          Create Note
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-md">
        <div className="flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search notes by title or content..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            icon={<Search className="w-4 h-4" />}
            className="h-9 text-xs"
          />
        </div>

        {/* Tags Filter Chips */}
        {tagsData && tagsData.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                selectedTag === null
                  ? 'bg-nova-500 text-white font-semibold shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              All Tags
            </button>
            {tagsData.slice(0, 8).map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id === selectedTag ? null : tag.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                  selectedTag === tag.id
                    ? 'bg-nova-500 text-white font-semibold shadow-sm'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-card/40 border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => openEditModal(note)}
              onTagClick={(tagId) => setSelectedTag(tagId)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl border border-dashed border-border/80 bg-card/20 space-y-3">
          <Sparkles className="w-8 h-8 text-muted-foreground/50 mx-auto" />
          <h3 className="font-semibold text-sm text-foreground">No notes found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search || selectedTag
              ? 'Try clearing your filters to see all notes.'
              : 'Create your first note or use Quick Capture on the dashboard.'}
          </p>
          <Button onClick={openCreateModal} size="sm" variant="outline" className="mt-2 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create Note
          </Button>
        </div>
      )}

      {/* Note Editor & Detail Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingNote ? 'Edit Knowledge Note' : 'Create Knowledge Note'}
        description="TipTap Markdown-compatible rich editor with automated AI structuring."
        maxWidth="4xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-semibold text-sm"
            />
            <Input
              placeholder="Source URL or Documentation link (optional)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Tags Input */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {tagsList.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Type tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="h-8 text-xs"
            />
          </div>

          {/* TipTap Rich Editor */}
          <TipTapEditor
            content={content}
            onChange={(newContent) => setContent(newContent)}
            className="min-h-[260px]"
          />

          {/* Actions & AI Summarizer Button */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleTriggerAISummarizer}
                isLoading={isSummarizing}
                disabled={!content.trim()}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-nova-400" />
                AI Synthesize & Summarize
              </Button>

              {editingNote && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNote(editingNote.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveNote} disabled={!title.trim() || !content.trim()}>
                <Check className="w-3.5 h-3.5 mr-1" />
                Save Note
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* AI Summary Preview Modal */}
      <AISummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summaryData={summaryData}
        onApplySummary={(summaryText) => {
          setContent((prev) => `${prev}<blockquote><strong>AI Summary:</strong> ${summaryText}</blockquote>`)
        }}
      />
    </div>
  )
}
