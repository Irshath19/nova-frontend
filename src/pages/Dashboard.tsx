import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { ApiResponse, ProgressMetrics, Note, LearningPath } from '@/types'
import { useAuthStore } from '@/stores/auth-store'
import { QuickCaptureWidget } from '@/features/notes/QuickCaptureWidget'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import {
  Brain,
  BookOpen,
  Network,
  Compass,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Fetch Progress metrics
  const { data: metricsData, refetch: refetchMetrics } = useQuery({
    queryKey: ['progress_metrics'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ProgressMetrics>>('/progress')
      return res.data.data
    },
  })

  // Fetch Learning Paths
  const { data: pathsData } = useQuery({
    queryKey: ['learning_paths'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<LearningPath[]>>('/learning-paths')
      return res.data.data
    },
  })

  const greetingTime = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const metrics = metricsData || {
    total_concepts: 0,
    total_notes: 0,
    total_connections: 0,
    total_learning_paths: 0,
    completed_concepts: 0,
    learning_concepts: 0,
    concepts_by_level: [],
    learning_paths_progress: [],
    growth_timeline: [],
    recent_knowledge: [],
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {greetingTime()}, {user?.username || 'Explorer'} 👋
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Capture what you learn. NOVA connects the dots and accelerates your growth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/search')}
            className="text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-nova-400" />
            Ask My Knowledge
          </Button>
          <Button size="sm" onClick={() => navigate('/tutor')} className="text-xs">
            Start AI Tutor
          </Button>
        </div>
      </div>

      {/* Quick Capture Hero Section */}
      <QuickCaptureWidget
        onCaptured={() => {
          refetchMetrics()
        }}
      />

      {/* Top 3 Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          onClick={() => navigate('/concepts')}
          className="p-5 cursor-pointer hover:border-cyan-500/40 hover:bg-card/90 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Concepts Mastered</span>
            <div className="text-3xl font-extrabold text-foreground mt-1">
              {metrics.total_concepts}
            </div>
            <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1 mt-1">
              <span>View concept cards</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Brain className="w-6 h-6" />
          </div>
        </Card>

        <Card
          onClick={() => navigate('/notes')}
          className="p-5 cursor-pointer hover:border-nova-500/40 hover:bg-card/90 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Captured Notes</span>
            <div className="text-3xl font-extrabold text-foreground mt-1">
              {metrics.total_notes}
            </div>
            <span className="text-[11px] text-nova-400 font-mono flex items-center gap-1 mt-1">
              <span>Browse notes</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-nova-500/10 text-nova-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </Card>

        <Card
          onClick={() => navigate('/graph')}
          className="p-5 cursor-pointer hover:border-purple-500/40 hover:bg-card/90 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Graph Connections</span>
            <div className="text-3xl font-extrabold text-foreground mt-1">
              {metrics.total_connections}
            </div>
            <span className="text-[11px] text-purple-400 font-mono flex items-center gap-1 mt-1">
              <span>Open 3D Knowledge Graph</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
            <Network className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Continue Learning & Recent Knowledge Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning Paths */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm text-foreground">Continue Learning</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/learning-paths')}
                className="text-xs h-7 px-2"
              >
                All Paths
              </Button>
            </div>

            {pathsData && pathsData.length > 0 ? (
              <div className="space-y-3">
                {pathsData.slice(0, 2).map((path) => {
                  const pct =
                    path.total_items > 0
                      ? Math.round((path.completed_items / path.total_items) * 100)
                      : 0
                  return (
                    <div
                      key={path.id}
                      onClick={() => navigate(`/learning-paths`)}
                      className="p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-accent/60 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground truncate max-w-[220px]">
                          {path.title}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">{pct}% Complete</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                <p>No learning path in progress.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/learning-paths')}
                  className="mt-3 text-xs"
                >
                  Generate with AI
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Growth Curve Preview */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-nova-400" />
                <h3 className="font-semibold text-sm text-foreground">Knowledge Progress</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/progress')}
                className="text-xs h-7 px-2"
              >
                Analytics
              </Button>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics.growth_timeline}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="concepts_count"
                    name="Concepts"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={0.2}
                    fill="#3b82f6"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
