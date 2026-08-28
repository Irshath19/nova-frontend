import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { NoteViewer } from '@/features/notes/NoteViewer'
import { NotesSidebar } from '@/features/notes/NotesSidebar'
import { NoteDrawer } from '@/features/notes/NoteDrawer'
import { Note, NoteBook, Tag } from '@/types'


const mockNotebooks: NoteBook[] = [
  { id: 'nb-1', name: 'AI Engineering', icon: '🤖' },
  { id: 'nb-2', name: 'Backend', icon: '💻' },
]

const mockNote: Note = {
  id: 'note-1',
  user_id: 'user-1',
  title: 'Understanding RAG Architecture',
  content: '<p>Retrieval Augmented Generation combines vector search with LLMs.</p>',
  summary: 'RAG connects external vector databases to LLM prompts.',
  source: 'https://nova.ai/docs',
  notebook_id: 'nb-1',
  notebook: mockNotebooks[0],
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

const mockBackendNote: Note = {
  id: 'note-2',
  user_id: 'user-1',
  title: 'Node.js Microservices Architecture',
  content: '<p>Building event-driven microservices.</p>',
  summary: 'Event-driven architecture with Kafka.',
  source: '',
  notebook_id: 'nb-2',
  notebook: mockNotebooks[1],
  processing_status: 'COMPLETED',
  created_at: '2026-08-27T11:00:00Z',
  updated_at: '2026-08-27T11:00:00Z',
  tags: [],
  concepts: [],
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

  it('renders NoteDrawer as centered split-pane modal with editor and live preview', () => {
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
        source="https://example.com"
        setSource={setSource}
        tagsList={['AI', 'Architecture']}
        setTagsList={setTagsList}
        onSave={handleSave}
      />
    )

    expect(screen.getByRole('dialog')).toBeDefined()
    expect(screen.getByText('Create Knowledge Note')).toBeDefined()
    expect(screen.getByText('Live Preview')).toBeDefined()
    expect(screen.getByText('Live Sync')).toBeDefined()
    expect(screen.getByText('Save Note')).toBeDefined()
    expect(screen.getAllByText('#AI').length).toBeGreaterThanOrEqual(1)

    // Check Escape key triggers close
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalled()
  })

  it('allows toggling between write and preview tabs on mobile views', () => {
    const handleClose = vi.fn()
    const handleSave = vi.fn()

    render(
      <NoteDrawer
        isOpen={true}
        onClose={handleClose}
        isEditing={true}
        title="Existing Note"
        setTitle={vi.fn()}
        content="<p>Some markdown note content</p>"
        setContent={vi.fn()}
        source=""
        setSource={vi.fn()}
        tagsList={['React']}
        setTagsList={vi.fn()}
        onSave={handleSave}
      />
    )


    expect(screen.getByText('Edit Knowledge Note')).toBeDefined()
    const previewTabBtn = screen.getByLabelText('Switch to Preview')
    expect(previewTabBtn).toBeDefined()
    fireEvent.click(previewTabBtn)

    const writeTabBtn = screen.getByLabelText('Switch to Editor')
    expect(writeTabBtn).toBeDefined()
    fireEvent.click(writeTabBtn)
  })

  it('renders NoteBook selector in NotesSidebar, toggles dropdown and selects notebook', () => {
    const handleSelect = vi.fn()
    const handleOpenCreate = vi.fn()

    render(
      <NotesSidebar
        notes={[mockNote, mockBackendNote]}
        notebooks={mockNotebooks}
        selectedNoteId="note-1"
        onSelectNote={handleSelect}
        onOpenCreateDrawer={handleOpenCreate}
        search=""
        setSearch={vi.fn()}
        tags={[]}
        selectedTag={null}
        setSelectedTag={vi.fn()}
      />
    )

    // Open NoteBook selector dropdown
    const selectorBtn = screen.getByRole('button', { name: /all notebooks|ai engineering/i })
    expect(selectorBtn).toBeDefined()
    fireEvent.click(selectorBtn)

    // Check dropdown options derived from notebooks table
    expect(screen.getAllByText('AI Engineering').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Backend').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Create NoteBook')).toBeDefined()

    // Select Backend notebook
    const backendOptions = screen.getAllByText('Backend')
    fireEvent.click(backendOptions[0])

    // Verify Backend note is shown
    expect(screen.getByText('Node.js Microservices Architecture')).toBeDefined()
  })

  it('renders NoteDrawer with NoteBook selector dropdown and updates preview', () => {
    const handleClose = vi.fn()
    const handleSave = vi.fn()
    const setNotebookId = vi.fn()

    render(
      <NoteDrawer
        isOpen={true}
        onClose={handleClose}
        isEditing={false}
        title="Spring Boot Microservices"
        setTitle={vi.fn()}
        content="<p>Building microservices with Spring Cloud.</p>"
        setContent={vi.fn()}
        source=""
        setSource={vi.fn()}
        tagsList={['Java', 'Microservices']}
        setTagsList={vi.fn()}
        notebookId="nb-2"
        setNotebookId={setNotebookId}
        notebooks={mockNotebooks}
        onSave={handleSave}
      />
    )

    expect(screen.getByLabelText('NoteBook')).toBeDefined()
    const select = screen.getByLabelText('NoteBook') as HTMLSelectElement
    expect(select.value).toBe('nb-2')

    fireEvent.change(select, { target: { value: 'nb-1' } })
    expect(setNotebookId).toHaveBeenCalledWith('nb-1')
  })
})





