import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ApiResponse } from '@/types'

const BASE_URL = 'https://portfolio-backend-qdf8.onrender.com'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('nova_access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 & token refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<any>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('nova_refresh_token')
      if (!refreshToken) {
        localStorage.removeItem('nova_access_token')
        localStorage.removeItem('nova_refresh_token')
        window.dispatchEvent(new Event('nova_auth_logout'))
        return Promise.reject(error)
      }

      try {
        const res = await axios.post<ApiResponse<{ access_token: string; refresh_token: string }>>(
          `${BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        )

        const { access_token, refresh_token: newRefreshToken } = res.data.data
        localStorage.setItem('nova_access_token', access_token)
        localStorage.setItem('nova_refresh_token', newRefreshToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }
        processQueue(null, access_token)
        return apiClient(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null)
        localStorage.removeItem('nova_access_token')
        localStorage.removeItem('nova_refresh_token')
        window.dispatchEvent(new Event('nova_auth_logout'))
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
