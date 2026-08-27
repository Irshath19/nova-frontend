import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { NoteCard } from '@/features/notes/NoteCard'
import { Note } from '@/types'

describe('NoteCard Component', () => {
  const mockNote: Note = {
    id: 'note-1',
    user_id: 'user-1',
    title: 'Understanding RAG Architecture',
    content: '<p>Retrieval Augmented Generation combines vector search with LLMs.</p>',
    summary: 'RAG connects external vector databases to LLM prompts.',
    source: 'https://nova.ai',
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

  it('renders note title, summary, concepts, and tags', () => {
    render(<NoteCard note={mockNote} />)
    expect(screen.getByText('Understanding RAG Architecture')).toBeDefined()
    expect(screen.getByText('RAG connects external vector databases to LLM prompts.')).toBeDefined()
    expect(screen.getByText('RAG')).toBeDefined()
    expect(screen.getByText('AI')).toBeDefined()
    expect(screen.getByText('✓ Processed')).toBeDefined()
  })
})
