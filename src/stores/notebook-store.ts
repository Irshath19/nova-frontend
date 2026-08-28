import { create } from 'zustand'

export function getNotebookIcon(nameOrIcon?: string | null): string {
  if (!nameOrIcon) return '📚'
  // If it's already an emoji, return it
  if (nameOrIcon.length <= 4 && !/^[a-zA-Z0-9_\-\s]+$/.test(nameOrIcon)) {
    return nameOrIcon
  }

  const lower = nameOrIcon.toLowerCase()

  if (
    lower.includes('ai') ||
    lower.includes('rag') ||
    lower.includes('llm') ||
    lower.includes('machine learning') ||
    lower.includes('neural')
  ) {
    return '🤖'
  }
  if (
    lower.includes('database') ||
    lower.includes('sql') ||
    lower.includes('postgres') ||
    lower.includes('redis') ||
    lower.includes('vector')
  ) {
    return '🗄'
  }
  if (
    lower.includes('backend') ||
    lower.includes('api') ||
    lower.includes('fastapi') ||
    lower.includes('node') ||
    lower.includes('auth')
  ) {
    return '💻'
  }
  if (
    lower.includes('frontend') ||
    lower.includes('react') ||
    lower.includes('css') ||
    lower.includes('ui') ||
    lower.includes('web')
  ) {
    return '🎨'
  }
  if (lower.includes('java') || lower.includes('spring')) {
    return '☕'
  }
  if (lower.includes('system design') || lower.includes('distributed') || lower.includes('scale')) {
    return '🏗'
  }
  if (lower.includes('architecture') || lower.includes('microservice')) {
    return '📐'
  }
  if (lower.includes('project')) {
    return '🚀'
  }
  if (lower.includes('interview') || lower.includes('prep') || lower.includes('career')) {
    return '💼'
  }
  if (lower.includes('cloud') || lower.includes('devops') || lower.includes('aws') || lower.includes('docker')) {
    return '☁️'
  }
  if (lower.includes('tool') || lower.includes('git') || lower.includes('linux')) {
    return '🛠️'
  }

  return '📚'
}

interface NotebookStoreState {
  selectedNotebookId: string // 'all' or specific notebook ID
  setSelectedNotebookId: (id: string) => void
}

export const useNotebookStore = create<NotebookStoreState>((set) => ({
  selectedNotebookId: 'all',
  setSelectedNotebookId: (id: string) => {
    set({ selectedNotebookId: id })
  },
}))
