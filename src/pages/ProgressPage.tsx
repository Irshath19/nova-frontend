import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { ApiResponse, ProgressMetrics } from '@/types'
import { ProgressDashboardView } from '@/features/progress/ProgressDashboardView'
import { TrendingUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function ProgressPage() {
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['progress_metrics'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ProgressMetrics>>('/progress')
      return res.data.data
    },
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-nova-400" />
            <span>Knowledge Progress & Analytics</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Real metrics calculated directly from your personal knowledge database.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isLoading}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Analytics Dashboard */}
      <ProgressDashboardView metrics={metrics || null} isLoading={isLoading} />
    </div>
  )
}
