import React, { useState, useRef, useEffect } from 'react'
import { TutorMessage, SourceReference } from '@/types'
import { apiClient } from '@/lib/api-client'
import { ApiResponse, TutorChatResponse } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  Sparkles,
  Send,
  BookOpen,
  HelpCircle,
  Lightbulb,
  GitCompare,
  ListPlus,
  Compass,
  ArrowUpRight,
} from 'lucide-react'

interface TutorChatViewProps {
  initialConceptId?: string | null
  initialConceptName?: string | null
  onSelectSource?: (source: SourceReference) => void
}

export function TutorChatView({
  initialConceptId,
  initialConceptName,
  onSelectSource,
}: TutorChatViewProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      role: 'assistant',
      content: initialConceptName
        ? `Hello! I'm NOVA AI Tutor. Let's explore and master **${initialConceptName}** based on your knowledge base. What would you like to know or practice?`
        : `Hello! I'm your AI Personal Knowledge Tutor. I help you connect concepts, explain ideas adaptively, and test your understanding based on what you have captured.`,
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeSources, setActiveSources] = useState<SourceReference[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (text?: string, action?: string) => {
    const queryText = (text || inputMessage).trim()
    if (!queryText || isLoading) return

    const newHistory: TutorMessage[] = [...messages, { role: 'user', content: queryText }]
    setMessages(newHistory)
    setInputMessage('')
    setIsLoading(true)

    try {
      const res = await apiClient.post<ApiResponse<TutorChatResponse>>('/tutor/chat', {
        message: queryText,
        concept_id: initialConceptId || undefined,
        action: action || undefined,
        history: newHistory.map((m) => ({ role: m.role, content: m.content })),
      })

      const data = res.data.data
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
      if (data.sources && data.sources.length > 0) {
        setActiveSources(data.sources)
      }
    } catch (err) {
      console.error('Tutor chat failed', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the AI Tutor service. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const promptChips = [
    { label: 'Teach me this concept', action: 'teach', icon: Lightbulb },
    { label: 'Explain simply', action: 'explain_simply', icon: HelpCircle },
    { label: 'Give code example', action: 'give_example', icon: Sparkles },
    { label: 'What am I missing?', action: 'missing', icon: Compass },
    { label: 'Create learning path', action: 'create_path', icon: ListPlus },
  ]

  return (
    <div className="flex flex-col h-[700px] rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border/60 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-nova-500/20 text-nova-400 border border-nova-500/30 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              NOVA AI Tutor
              {initialConceptName && (
                <Badge variant="info" className="text-[10px]">
                  Focus: {initialConceptName}
                </Badge>
              )}
            </h3>
            <p className="text-[11px] text-muted-foreground">Adaptive learning grounded in your personal notes</p>
          </div>
        </div>

        {activeSources.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
            <BookOpen className="w-3.5 h-3.5 text-nova-400" />
            <span>{activeSources.length} Sources Grounded</span>
          </div>
        )}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-nova-500 text-white rounded-br-none shadow-md shadow-nova-500/20'
                  : 'bg-muted/40 border border-border/60 text-foreground rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/60 mt-1 px-1">
              {msg.role === 'user' ? 'You' : 'NOVA Tutor'}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-2xl bg-muted/20 border border-border/40 w-fit animate-pulse">
            <Sparkles className="w-4 h-4 text-nova-400 animate-spin" />
            <span>NOVA is thinking and referencing your knowledge...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sources Dock (if any) */}
      {activeSources.length > 0 && (
        <div className="px-4 py-2 border-t border-border/40 bg-muted/10 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Sources:
          </span>
          {activeSources.map((src) => (
            <button
              key={src.id}
              onClick={() => onSelectSource?.(src)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-card border border-border/60 hover:border-nova-500/40 text-foreground flex items-center gap-1 shrink-0 transition-colors"
            >
              <span className="truncate max-w-[140px]">{src.title}</span>
              <ArrowUpRight className="w-2.5 h-2.5 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {/* Quick Action Chips */}
      <div className="px-4 py-2 bg-muted/20 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto">
        {promptChips.map((chip, idx) => {
          const Icon = chip.icon
          return (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() =>
                handleSendMessage(
                  initialConceptName ? `${chip.label} for ${initialConceptName}` : chip.label,
                  chip.action
                )
              }
              className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-card/80 border border-border/60 hover:bg-accent text-muted-foreground hover:text-foreground shrink-0 transition-all flex items-center gap-1"
            >
              <Icon className="w-3 h-3 text-nova-400" />
              <span>{chip.label}</span>
            </button>
          )
        })}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-card/90 border-t border-border/60 flex items-center gap-2">
        <Input
          placeholder={
            initialConceptName
              ? `Ask a question about ${initialConceptName}...`
              : 'Ask a question or request a concept explanation...'
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage()
          }}
          className="h-10 text-sm"
        />

        <Button
          size="md"
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isLoading}
          isLoading={isLoading}
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
