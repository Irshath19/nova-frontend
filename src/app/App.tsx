import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useThemeStore, applyTheme } from '@/stores/theme-store'
import { AuthGuard, GuestGuard } from '@/features/auth/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'

// Pages
import { Dashboard } from '@/pages/Dashboard'
import { NotesPage } from '@/pages/NotesPage'
import { ConceptsPage } from '@/pages/ConceptsPage'
import { GraphPage } from '@/pages/GraphPage'
import { SearchPage } from '@/pages/SearchPage'
import { TutorPage } from '@/pages/TutorPage'
import { LearningPathsPage } from '@/pages/LearningPathsPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
})

export function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public / Guest Routes */}
          <Route element={<GuestGuard />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<AuthGuard />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/concepts" element={<ConceptsPage />} />
              <Route path="/graph" element={<GraphPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/tutor" element={<TutorPage />} />
              <Route path="/learning-paths" element={<LearningPathsPage />} />
              <Route path="/progress" element={<ProgressPage />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
export default App
