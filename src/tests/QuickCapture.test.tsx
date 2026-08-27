import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { QuickCaptureWidget } from '@/features/notes/QuickCaptureWidget'

describe('QuickCaptureWidget', () => {
  it('renders input placeholder and capture button', () => {
    render(<QuickCaptureWidget />)
    const textarea = screen.getByPlaceholderText(/What did you learn just now/i)
    expect(textarea).toBeDefined()
    expect(screen.getByText('Capture')).toBeDefined()
  })

  it('updates text on typing', () => {
    render(<QuickCaptureWidget />)
    const textarea = screen.getByPlaceholderText(/What did you learn just now/i) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'JWT authentication is stateless.' } })
    expect(textarea.value).toBe('JWT authentication is stateless.')
  })
})
