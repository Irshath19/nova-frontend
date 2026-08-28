import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { NoteViewer } from '@/features/notes/NoteViewer'
import { NotesSidebar } from '@/features/notes/NotesSidebar'
import { NoteDrawer } from '@/features/notes/NoteDrawer'
import { Note, Tag } from '@/types'

const mockNote: Note = {
  id: 'note-1',
  user_id: 'user-1',
  title: 'Understanding RAG Architecture',
  content: '<p>Retrieval Augmented Generation combines vector search with LLMs.</p>',
  summary: 'RAG connects external vector databases to LLM prompts.',
  source: 'https://nova.ai/docs',
  processing_status: 'COMPLETED',
  created_at: '2026-08-27T10:00:00Z',
  updated_at: '2026-08-27T10:00:00Z',
  tags: [{ id: 'tag-1', user_id: 'user-1', name: 'AI', created_at: '2026-08-27T10:00:00Z' }],
  concepts: [
    {
      id: 'concept-1',
      user_id: 'user-1',
      name: 'RAG',
      knowledge_level: 'INTERMEDIATE',
      created_at: '2026-08-27T10:00:00Z',
      updated_at: '2026-08-27T10:00:00Z',
    },
  ],
}

describe('Notes Knowledge Workspace', () => {
  it('renders NoteViewer with full title, summary callout, tags, concepts and content', () => {
    const handleEdit = vi.fn()
    const handleDelete = vi.fn()

    render(<NoteViewer note={mockNote} onEdit={handleEdit} onDelete={handleDelete} />)

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
    expect(screen.getByText('Understanding RAG Architecture')).toBeDefined()
    expect(screen.getByText('AI Knowledge Synthesis')).toBeDefined()
    expect(screen.getByText('RAG connects external vector databases to LLM prompts.')).toBeDefined()
    expect(screen.getByText('RAG')).toBeDefined()
    expect(screen.getByText('AI')).toBeDefined()
    expect(screen.getByText('Source')).toBeDefined()

    const editBtn = screen.getByText('Edit Note')
    fireEvent.click(editBtn)
    expect(handleEdit).toHaveBeenCalledWith(mockNote)
  })

  it('renders NotesSidebar and triggers note selection and search', () => {
    const handleSelect = vi.fn()
    const handleOpenCreate = vi.fn()
    const handleSearch = vi.fn()
    const handleSelectTag = vi.fn()

    render(
      <NotesSidebar
        notes={[mockNote]}
        selectedNoteId="note-1"
        onSelectNote={handleSelect}
        onOpenCreateDrawer={handleOpenCreate}
        search=""
        setSearch={handleSearch}
        tags={[{ id: 'tag-1', user_id: 'user-1', name: 'AI', created_at: '' }]}
        selectedTag={null}
        setSelectedTag={handleSelectTag}
      />
    )

    expect(screen.getByText('Knowledge Notes')).toBeDefined()
    expect(screen.getByText('Understanding RAG Architecture')).toBeDefined()

    const newNoteBtn = screen.getByText('New Note')
    fireEvent.click(newNoteBtn)
    expect(handleOpenCreate).toHaveBeenCalled()
  })

  it('renders NoteDrawer right slide-in with inputs and save button', () => {
    const handleClose = vi.fn()
    const handleSave = vi.fn()
    const setTitle = vi.fn()
    const setContent = vi.fn()
    const setSource = vi.fn()
    const setTagsList = vi.fn()

    render(
      <NoteDrawer
        isOpen={true}
        onClose={handleClose}
        isEditing={false}
        title="New Note Title"
        setTitle={setTitle}
        content="<p>Test content</p>"
        setContent={setContent}
        source=""
        setSource={setSource}
        tagsList={['AI', 'Architecture']}
        setTagsList={setTagsList}
        onSave={handleSave}
      />
    )

    expect(screen.getByText('Create Knowledge Note')).toBeDefined()
    expect(screen.getByText('Save Note')).toBeDefined()
    expect(screen.getByText('#AI')).toBeDefined()
    expect(screen.getByText('#Architecture')).toBeDefined()
  })
})
