import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import {
  ApiResponse,
  AskKnowledgeResponse,
  SearchResultItem,
  SourceReference,
  Note,
  ConceptDetail,
} from '@/types'
import { SemanticSearchView } from '@/features/search/SemanticSearchView'
import { AskKnowledgeView } from '@/features/search/AskKnowledgeView'
import { ConceptDetailModal } from '@/features/concepts/ConceptDetailModal'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, Sparkles, BookOpen, Layers } from 'lucide-react'

export function SearchPage() {
  const [searchMode, setSearchMode] = useState<'semantic' | 'ask'>('ask')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const [semanticResults, setSemanticResults] = useState<SearchResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const [askResponse, setAskResponse] = useState<AskKnowledgeResponse | null>(null)
  const [isAsking, setIsAsking] = useState(false)

  // Modals for source inspection
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [selectedConceptDetail, setSelectedConceptDetail] = useState<ConceptDetail | null>(null)

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 400)
    return () => clearTimeout(handler)
  }, [query])

  // Perform Semantic Search on debounced query
  useEffect(() => {
    if (searchMode === 'semantic' && debouncedQuery.trim()) {
      setIsSearching(true)
      apiClient
        .get<ApiResponse<SearchResultItem[]>>('/search', {
          params: { q: debouncedQuery.trim() },
        })
        .then((res) => {
          setSemanticResults(res.data.data)
        })
        .catch((err) => console.error(err))
        .finally(() => setIsSearching(false))
    }
  }, [debouncedQuery, searchMode])

  // Ask My Knowledge
  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim() || isAsking) return

    setIsAsking(true)
    try {
      const res = await apiClient.post<ApiResponse<AskKnowledgeResponse>>('/search/ask', {
        query: query.trim(),
      })
      setAskResponse(res.data.data)
    } catch (err) {
      console.error('Ask My Knowledge failed', err)
    } finally {
      setIsAsking(false)
    }
  }

  const handleSelectSource = async (source: SourceReference) => {
    try {
      if (source.type === 'note') {
        const res = await apiClient.get<ApiResponse<Note>>(`/notes/${source.id}`)
        setSelectedNote(res.data.data)
      } else {
        const res = await apiClient.get<ApiResponse<ConceptDetail>>(`/concepts/${source.id}`)
        setSelectedConceptDetail(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load source details', err)
    }
  }

  const handleSelectNoteById = async (noteId: string) => {
    try {
      const res = await apiClient.get<ApiResponse<Note>>(`/notes/${noteId}`)
      setSelectedNote(res.data.data)
    } catch (err) {
      console.error('Failed to load note', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          Search & Ask Knowledge
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Perform high-dimensional vector search or query your stored knowledge using local RAG.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card/60 border border-border/80 w-fit backdrop-blur-md">
        <button
          onClick={() => setSearchMode('ask')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            searchMode === 'ask'
              ? 'bg-nova-500 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask My Knowledge (RAG)</span>
        </button>

        <button
          onClick={() => setSearchMode('semantic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            searchMode === 'semantic'
              ? 'bg-nova-500 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Semantic Vector Search</span>
        </button>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleAsk} className="flex items-center gap-2">
        <Input
          placeholder={
            searchMode === 'ask'
              ? 'Ask anything from your notes (e.g. "What do I know about RAG?")'
              : 'Type semantic keywords or technical concepts...'
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="h-12 text-sm shadow-sm"
        />

        {searchMode === 'ask' && (
          <Button type="submit" size="lg" isLoading={isAsking} disabled={!query.trim()}>
            <Sparkles className="w-4 h-4 mr-1.5" />
            Ask
          </Button>
        )}
      </form>

      {/* Results View */}
      {searchMode === 'ask' ? (
        <AskKnowledgeView
          response={askResponse}
          isLoading={isAsking}
          query={query}
          onSelectSource={handleSelectSource}
        />
      ) : (
        <SemanticSearchView
          results={semanticResults}
          isLoading={isSearching}
          query={debouncedQuery}
          onSelectNote={handleSelectNoteById}
        />
      )}

      {/* Note Detail Modal */}
      <Modal
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        title={selectedNote?.title || 'Note Details'}
        maxWidth="4xl"
      >
        {selectedNote && (
          <div className="space-y-4">
            {selectedNote.summary && (
              <div className="p-3 rounded-xl bg-nova-500/10 border border-nova-500/20 text-xs text-muted-foreground">
                <span className="font-semibold text-nova-400 block mb-1">AI Summary</span>
                {selectedNote.summary}
              </div>
            )}
            <div
              className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: selectedNote.content }}
            />
          </div>
        )}
      </Modal>

      {/* Concept Detail Modal */}
      <ConceptDetailModal
        isOpen={!!selectedConceptDetail}
        onClose={() => setSelectedConceptDetail(null)}
        conceptDetail={selectedConceptDetail}
      />
    </div>
  )
}
