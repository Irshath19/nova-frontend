import React, { useState, useEffect, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { apiClient } from '@/lib/api-client'
import { ApiResponse, NoteBook } from '@/types'
import { getNotebookIcon } from '@/stores/notebook-store'
import { Plus } from 'lucide-react'

interface CreateNoteBookModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (notebook: NoteBook) => void
}

export function CreateNoteBookModal({ isOpen, onClose, onCreated }: CreateNoteBookModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setDescription('')
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = name.trim()
    if (!clean || isSubmitting) return

    setIsSubmitting(true)
    try {
      const icon = getNotebookIcon(clean)
      const res = await apiClient.post<ApiResponse<NoteBook>>('/notebooks', {
        name: clean,
        icon: icon,
        description: description.trim() || null,
      })
      onCreated?.(res.data.data)
      onClose()
    } catch (err) {
      console.error('Failed to create notebook in database:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewIcon = getNotebookIcon(name)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create NoteBook"
      description="Create a dedicated category in your database to organize your knowledge notes."
      maxWidth="md"
    >
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80">NoteBook Name</label>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-background/60 border border-input flex items-center justify-center text-lg shadow-xs shrink-0">
              {previewIcon}
            </div>

            <div className="flex-1">
              <Input
                ref={inputRef}
                placeholder="e.g., AI Engineering, Cloud & DevOps, Backend"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-sm font-medium bg-background/50 focus:bg-background"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80">Description (Optional)</label>
          <Input
            placeholder="Brief description of this notebook..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-9 text-xs bg-background/50 focus:bg-background"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/50">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!name.trim() || isSubmitting}
            isLoading={isSubmitting}
            className="text-xs shadow-md shadow-nova-500/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create NoteBook
          </Button>
        </div>
      </form>
    </Modal>
  )
}
