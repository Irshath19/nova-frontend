import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { KnowledgeGraphView } from '@/features/graph/KnowledgeGraphView'
import { GraphResponse } from '@/types'

// Mock ResizeObserver for React Flow in JSDOM
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('KnowledgeGraphView Component', () => {
  const mockGraph: GraphResponse = {
    nodes: [
      {
        id: 'c-1',
        name: 'LLM',
        knowledge_level: 'STRONG',
        connections_count: 2,
        notes_count: 1,
      },
      {
        id: 'c-2',
        name: 'Embeddings',
        knowledge_level: 'INTERMEDIATE',
        connections_count: 2,
        notes_count: 1,
      },
    ],
    edges: [
      {
        id: 'e-1',
        source: 'c-1',
        target: 'c-2',
        relationship_type: 'USES',
        weight: 1.0,
      },
    ],
  }

  it('renders graph search input and level filter buttons', () => {
    render(<KnowledgeGraphView graphData={mockGraph} onSelectConcept={() => {}} />)
    expect(screen.getByPlaceholderText(/Filter graph concepts/i)).toBeDefined()
    expect(screen.getByText('All Levels')).toBeDefined()
    expect(screen.getByText('Strong')).toBeDefined()
  })
})
