import React, { useState, useRef, useEffect } from 'react'
import { NoteBook } from '@/types'
import { getNotebookIcon } from '@/stores/notebook-store'
import { ChevronDown, Check, Plus } from 'lucide-react'

interface NoteBookSelectorProps {
  notebooks: NoteBook[]
  selectedNotebookId: string
  onSelectNotebookId: (id: string) => void
  onOpenCreateModal: () => void
}

export function NoteBookSelector({
  notebooks,
  selectedNotebookId,
  onSelectNotebookId,
  onOpenCreateModal,
}: NoteBookSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isAll = selectedNotebookId === 'all'
  const activeNotebook = notebooks.find((nb) => nb.id === selectedNotebookId)
  const displayIcon = isAll ? '📚' : (activeNotebook?.icon || getNotebookIcon(activeNotebook?.name))
  const displayName = isAll ? 'All NoteBooks' : (activeNotebook?.name || 'NoteBook')

  // Close on outside click or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (id: string) => {
    onSelectNotebookId(id)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-background/50 hover:bg-background/80 border border-border/80 hover:border-nova-500/40 text-foreground transition-all duration-150 shadow-xs group focus:outline-none focus:ring-1 focus:ring-nova-500/50"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0 leading-none">{displayIcon}</span>
          <span className="text-xs font-semibold truncate tracking-tight text-foreground/90 group-hover:text-foreground">
            {displayName}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-nova-400' : 'group-hover:text-foreground'
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 p-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[320px] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Scrollable list of items */}
          <div className="overflow-y-auto space-y-0.5 max-h-[250px] pr-0.5">
            {/* All NoteBooks Option */}
            <button
              type="button"
              role="option"
              aria-selected={isAll}
              onClick={() => handleSelect('all')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                isAll
                  ? 'bg-nova-500/15 text-nova-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm">📚</span>
                <span className="truncate">All NoteBooks</span>
              </div>
              {isAll && <Check className="w-3.5 h-3.5 text-nova-400 shrink-0" />}
            </button>

            {notebooks.length > 0 && <div className="h-px bg-slate-800 my-1 mx-1" />}

            {/* Dynamic NoteBooks List from notebooks Table */}
            {notebooks.map((nb) => {
              const isSelected = selectedNotebookId === nb.id
              const icon = nb.icon || getNotebookIcon(nb.name)

              return (
                <button
                  key={nb.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(nb.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-nova-500/15 text-nova-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm shrink-0">{icon}</span>
                    <span className="truncate">{nb.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-nova-400 shrink-0" />}
                </button>
              )
            })}
          </div>

          <div className="h-px bg-slate-800 my-1" />

          {/* Create NoteBook Action Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              onOpenCreateModal()
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-nova-400 hover:text-nova-300 hover:bg-nova-500/10 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create NoteBook</span>
          </button>
        </div>
      )}
    </div>
  )
}
