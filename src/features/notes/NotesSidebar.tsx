import React, { useState, useMemo } from 'react'
import { Note, NoteBook, Tag } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Tag as TagIcon, FileText, Sparkles, X } from 'lucide-react'
import { NoteBookSelector } from '@/features/notes/NoteBookSelector'
import { CreateNoteBookModal } from '@/features/notes/CreateNoteBookModal'
import { useNotebookStore, getNotebookIcon } from '@/stores/notebook-store'

interface NotesSidebarProps {
  notes: Note[]
  notebooks?: NoteBook[]
  selectedNoteId: string | null
  onSelectNote: (note: Note) => void
  onOpenCreateDrawer: () => void
  onNotebookCreated?: (notebook: NoteBook) => void
  search: string
  setSearch: (val: string) => void
  tags: Tag[]
  selectedTag: string | null
  setSelectedTag: (tagId: string | null) => void
  isLoading?: boolean
}

export function NotesSidebar({
  notes,
  notebooks = [],
  selectedNoteId,
  onSelectNote,
  onOpenCreateDrawer,
  onNotebookCreated,
  search,
  setSearch,
  tags,
  selectedTag,
  setSelectedTag,
  isLoading = false,
}: NotesSidebarProps) {
  const [isCreateNotebookModalOpen, setIsCreateNotebookModalOpen] = useState(false)
  const selectedNotebookId = useNotebookStore((state) => state.selectedNotebookId)
  const setSelectedNotebookId = useNotebookStore((state) => state.setSelectedNotebookId)

  // Filter notes by NoteBook ID first, then by Tag
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // 1. NoteBook filter
      if (selectedNotebookId !== 'all') {
        const noteNbId = note.notebook_id || note.notebook?.id
        if (noteNbId !== selectedNotebookId) {
          return false
        }
      }

      // 2. Tag filter
      if (selectedTag) {
        const hasTag = note.tags?.some((t) => t.id === selectedTag)
        if (!hasTag) return false
      }

      return true
    })
  }, [notes, selectedNotebookId, selectedTag])

  const selectedNotebookObj = notebooks.find((nb) => nb.id === selectedNotebookId)

  // Helper to extract clean plain text preview from HTML
  const getPreviewText = (note: Note) => {
    if (note.summary) return note.summary
    const text = note.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
    return text || 'No content'
  }

  return (
    <>
      <aside className="w-full md:w-[310px] lg:w-[330px] h-full flex flex-col border-r border-border/80 bg-card/60 backdrop-blur-md shrink-0 overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-3.5 sm:p-4 border-b border-border/80 space-y-3 shrink-0 bg-card/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-foreground tracking-tight">Knowledge Notes</h2>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted/60 text-muted-foreground">
                {filteredNotes.length}
              </span>
            </div>

            <Button
              onClick={onOpenCreateDrawer}
              size="sm"
              className="h-8 px-2.5 text-xs font-semibold shadow-md shadow-nova-500/20"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Note
            </Button>
          </div>

          {/* Dynamic NoteBook Selector Dropdown */}
          <NoteBookSelector
            notebooks={notebooks}
            selectedNotebookId={selectedNotebookId}
            onSelectNotebookId={setSelectedNotebookId}
            onOpenCreateModal={() => setIsCreateNotebookModalOpen(true)}
          />

          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-3.5 h-3.5" />}
              className="h-8 text-xs bg-background/50 focus:bg-background pr-7"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tag Filters Horizontal List */}
          {tags && tags.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                  selectedTag === null
                    ? 'bg-nova-500 text-white font-semibold shadow-xs'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              {tags.slice(0, 6).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id === selectedTag ? null : tag.id)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                    selectedTag === tag.id
                      ? 'bg-nova-500 text-white font-semibold shadow-xs'
                      : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Note Items List - Independently Scrollable */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-card/40 border border-border/40 animate-pulse" />
              ))}
            </div>
          ) : filteredNotes.length > 0 ? (
            filteredNotes.map((note) => {
              const isSelected = note.id === selectedNoteId
              const notebookName = note.notebook?.name || 'Note'
              const notebookIcon = note.notebook?.icon || getNotebookIcon(note.notebook?.name)

              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className={`group p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-nova-500/10 border-nova-500/40 text-foreground shadow-sm'
                      : 'bg-card/30 hover:bg-card/80 border-border/40 hover:border-border/80 text-foreground/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1">
                    <h4
                      className={`text-xs font-bold line-clamp-1 group-hover:text-nova-400 transition-colors ${
                        isSelected ? 'text-nova-400' : 'text-foreground'
                      }`}
                    >
                      {note.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                      {formatDate(note.updated_at || note.created_at)}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2 leading-relaxed font-normal">
                    {getPreviewText(note)}
                  </p>

                  {/* NoteBook badge and Tags */}
                  <div className="flex flex-wrap items-center gap-1">
                    {note.notebook && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-800/90 text-slate-300 border border-slate-700/70">
                        <span>{notebookIcon}</span>
                        <span className="max-w-[85px] truncate">{notebookName}</span>
                      </span>
                    )}

                    {note.concepts?.slice(0, 1).map((c) => (
                      <span
                        key={c.id}
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                      >
                        {c.name}
                      </span>
                    ))}

                    {note.tags?.slice(0, 1).map((t) => (
                      <span
                        key={t.id}
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground"
                      >
                        #{t.name}
                      </span>
                    ))}

                    {note.summary && (
                      <span className="ml-auto text-[9px] text-nova-400 flex items-center gap-0.5 font-medium">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          ) : selectedNotebookId !== 'all' ? (
            /* Specific NoteBook Empty State */
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-nova-500/10 border border-nova-500/20 flex items-center justify-center text-xl mx-auto shadow-inner">
                <span>{selectedNotebookObj?.icon || '📚'}</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">No notes in this NoteBook</p>
                <p className="text-[11px] text-muted-foreground">
                  Start building your knowledge here.
                </p>
              </div>
              <Button
                onClick={onOpenCreateDrawer}
                size="sm"
                className="h-7 text-xs px-3 shadow-md shadow-nova-500/20 mt-1"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                New Note
              </Button>
            </div>
          ) : (
            /* General Empty State */
            <div className="text-center py-12 px-4 space-y-2">
              <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-semibold text-foreground/80">No notes found</p>
              <p className="text-[11px] text-muted-foreground">
                {search || selectedTag
                  ? 'Try resetting your search or tag filters.'
                  : 'Click "+ New Note" to write your first note.'}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Create NoteBook Modal */}
      <CreateNoteBookModal
        isOpen={isCreateNotebookModalOpen}
        onClose={() => setIsCreateNotebookModalOpen(false)}
        onCreated={(newNb) => {
          setSelectedNotebookId(newNb.id)
          onNotebookCreated?.(newNb)
        }}
      />
    </>
  )
}
