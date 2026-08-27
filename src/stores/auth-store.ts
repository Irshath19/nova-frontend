import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'
import { ApiResponse, AuthResponse, User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: { email_or_username: string; password: string }) => Promise<void>
  register: (payload: { email: string; username: string; password: string }) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('nova_access_token'),
  isLoading: true,
  isAuthenticated: !!localStorage.getItem('nova_access_token'),

  login: async (credentials) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    const { access_token, refresh_token, user } = res.data.data
    localStorage.setItem('nova_access_token', access_token)
    localStorage.setItem('nova_refresh_token', refresh_token)
    set({ user, token: access_token, isAuthenticated: true, isLoading: false })
  },

  register: async (payload) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload)
    const { access_token, refresh_token, user } = res.data.data
    localStorage.setItem('nova_access_token', access_token)
    localStorage.setItem('nova_refresh_token', refresh_token)
    set({ user, token: access_token, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    localStorage.removeItem('nova_access_token')
    localStorage.removeItem('nova_refresh_token')
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('nova_access_token')
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      return
    }

    try {
      const res = await apiClient.get<ApiResponse<User>>('/auth/me')
      set({ user: res.data.data, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('nova_access_token')
      localStorage.removeItem('nova_refresh_token')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },
}))

// Global logout event listener
if (typeof window !== 'undefined') {
  window.addEventListener('nova_auth_logout', () => {
    useAuthStore.getState().logout()
  })
}
