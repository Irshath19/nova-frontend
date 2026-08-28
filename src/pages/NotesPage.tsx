import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { ApiResponse, Note, NoteBook, PaginatedResponse, SummarizeResponse, Tag } from '@/types'
import { NotesSidebar } from '@/features/notes/NotesSidebar'
import { NoteViewer } from '@/features/notes/NoteViewer'
import { NoteDrawer } from '@/features/notes/NoteDrawer'
import { AISummaryModal } from '@/features/notes/AISummaryModal'
import { useNotebookStore } from '@/stores/notebook-store'

export function NotesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('detail')

  // Notebook Store
  const selectedNotebookId = useNotebookStore((state) => state.selectedNotebookId)

  // Drawer / Editor state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [source, setSource] = useState('')
  const [tagsList, setTagsList] = useState<string[]>([])
  const [notebookId, setNotebookId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // AI Summarizer State
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryData, setSummaryData] = useState<SummarizeResponse | null>(null)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)

  // Fetch Notebooks from PostgreSQL notebooks table
  const { data: notebooksData } = useQuery({
    queryKey: ['notebooks'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<NoteBook[]>>('/notebooks')
      return res.data.data
    },
  })

  const notebooksList = notebooksData || []

  // Fetch Notes
  const { data: notesData, isLoading: isNotesLoading } = useQuery({
    queryKey: ['notes', search, selectedTag],
    queryFn: async () => {
      const params: any = { limit: 100 }
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

  const notesList = notesData?.items || []

  // Auto-select first note on initial load or if selected note is missing
  useEffect(() => {
    if (notesList.length > 0) {
      if (!selectedNoteId || !notesList.some((n) => n.id === selectedNoteId)) {
        setSelectedNoteId(notesList[0].id)
      }
    } else {
      setSelectedNoteId(null)
    }
  }, [notesList, selectedNoteId])

  const selectedNote = notesList.find((n) => n.id === selectedNoteId) || null

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id)
    setMobileView('detail')
  }

  const openCreateDrawer = () => {
    setEditingNote(null)
    setTitle('')
    setContent('<p></p>')
    setSource('')
    setTagsList([])
    const defaultNbId =
      selectedNotebookId !== 'all' ? selectedNotebookId : (notebooksList[0]?.id || null)
    setNotebookId(defaultNbId)
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (note: Note) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setSource(note.source || '')
    setTagsList(note.tags ? note.tags.map((t) => t.name) : [])
    setNotebookId(note.notebook_id || note.notebook?.id || null)
    setIsDrawerOpen(true)
  }

  const handleSaveNote = async () => {
    if (!content.trim() || !title.trim() || isSaving) return
    setIsSaving(true)

    try {
      if (editingNote) {
        const res = await apiClient.put<ApiResponse<Note>>(`/notes/${editingNote.id}`, {
          title,
          content,
          source: source || null,
          notebook_id: notebookId || null,
          tag_names: tagsList,
        })
        setSelectedNoteId(res.data.data.id)
      } else {
        const res = await apiClient.post<ApiResponse<Note>>('/notes', {
          title,
          content,
          source: source || null,
          notebook_id: notebookId || null,
          tag_names: tagsList,
        })
        setSelectedNoteId(res.data.data.id)
      }

      await queryClient.invalidateQueries({ queryKey: ['notes'] })
      await queryClient.invalidateQueries({ queryKey: ['notebooks'] })
      await queryClient.invalidateQueries({ queryKey: ['tags'] })
      await queryClient.invalidateQueries({ queryKey: ['progress_metrics'] })
      setIsDrawerOpen(false)
      setMobileView('detail')
    } catch (err) {
      console.error('Failed to save note:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this knowledge note?')) {
      try {
        await apiClient.delete(`/notes/${noteId}`)
        await queryClient.invalidateQueries({ queryKey: ['notes'] })
        await queryClient.invalidateQueries({ queryKey: ['notebooks'] })
        await queryClient.invalidateQueries({ queryKey: ['tags'] })
        await queryClient.invalidateQueries({ queryKey: ['progress_metrics'] })
        setIsDrawerOpen(false)
        if (selectedNoteId === noteId) {
          const remaining = notesList.filter((n) => n.id !== noteId)
          setSelectedNoteId(remaining.length > 0 ? remaining[0].id : null)
        }
      } catch (err) {
        console.error('Failed to delete note:', err)
      }
    }
  }

  const handleTriggerAISummarizer = async () => {
    if (!content || isSummarizing) return
    setIsSummarizing(true)
    try {
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
    <div className="w-full h-[calc(100vh-6.5rem)] md:h-[calc(100vh-5.5rem)] max-w-7xl mx-auto flex flex-col">
      {/* 2-Column Knowledge Management Workspace */}
      <div className="flex-1 flex rounded-3xl border border-border/80 bg-card/30 backdrop-blur-md overflow-hidden shadow-2xl">
        {/* Left Notes Sidebar */}
        <div
          className={`h-full ${
            mobileView === 'list' ? 'flex w-full' : 'hidden md:flex'
          }`}
        >
          <NotesSidebar
            notes={notesList}
            notebooks={notebooksList}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            onOpenCreateDrawer={openCreateDrawer}
            onNotebookCreated={async () => {
              await queryClient.invalidateQueries({ queryKey: ['notebooks'] })
            }}
            search={search}
            setSearch={setSearch}
            tags={tagsData || []}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            isLoading={isNotesLoading}
          />
        </div>

        {/* Right Large Note Viewing Workspace */}
        <div
          className={`flex-1 h-full ${
            mobileView === 'detail' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <NoteViewer
            note={selectedNote}
            onEdit={openEditDrawer}
            onDelete={handleDeleteNote}
            onTagClick={(tagId) => setSelectedTag(tagId)}
            onBackToList={() => setMobileView('list')}
            onCreateNew={openCreateDrawer}
            isLoading={isNotesLoading}
          />
        </div>
      </div>

      {/* Centered Split-Pane Modal for Creating / Editing Notes */}
      <NoteDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isEditing={!!editingNote}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        source={source}
        setSource={setSource}
        tagsList={tagsList}
        setTagsList={setTagsList}
        notebookId={notebookId}
        setNotebookId={setNotebookId}
        notebooks={notebooksList}
        onSave={handleSaveNote}
        onDelete={editingNote ? () => handleDeleteNote(editingNote.id) : undefined}
        isSaving={isSaving}
        isSummarizing={isSummarizing}
        onTriggerAISummarizer={handleTriggerAISummarizer}
      />

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
export default NotesPage
