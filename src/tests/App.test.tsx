import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { App } from '@/app/App'

describe('NOVA App Rendering', () => {
  it('renders application login screen when not authenticated', async () => {
    localStorage.clear()
    render(<App />)
    expect(screen.getByText('NOVA')).toBeDefined()
    expect(screen.getByText('Your personal knowledge, connected.')).toBeDefined()
  })
})
