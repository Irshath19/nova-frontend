import React from 'react'
import { ProgressMetrics } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge, KnowledgeLevelBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import {
  BookOpen,
  Brain,
  Tag,
  Network,
  Compass,
  CheckCircle2,
  TrendingUp,
  Activity,
  Sparkles,
} from 'lucide-react'

interface ProgressDashboardViewProps {
  metrics: ProgressMetrics | null
  isLoading?: boolean
}

export function ProgressDashboardView({ metrics, isLoading }: ProgressDashboardViewProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-card/60 border border-border/40" />
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Concepts',
      value: metrics.total_concepts,
      icon: Brain,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      title: 'Captured Notes',
      value: metrics.total_notes,
      icon: BookOpen,
      color: 'text-nova-400',
      bg: 'bg-nova-500/10',
    },
    {
      title: 'Graph Connections',
      value: metrics.total_connections,
      icon: Network,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Learning Paths',
      value: metrics.total_learning_paths,
      icon: Compass,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ]

  const LEVEL_COLORS: Record<string, string> = {
    STRONG: '#10b981',
    INTERMEDIATE: '#06b6d4',
    LEARNING: '#f59e0b',
    FAMILIAR: '#a855f7',
    NEW: '#64748b',
  }

  return (
    <div className="space-y-6">
      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{stat.title}</span>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {stat.value}
                </span>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Growth Over Time */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-nova-400" />
              <h3 className="font-semibold text-sm text-foreground">Cumulative Knowledge Growth</h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">Growth Timeline</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.growth_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="concepts_count"
                  name="Concepts"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#growthGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="notes_count"
                  name="Notes"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Concepts by Mastery Level */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold text-sm text-foreground">Concepts by Mastery Level</h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">Mastery Distribution</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.concepts_by_level} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="level"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => val.charAt(0) + val.slice(1).toLowerCase()}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Concepts" radius={[8, 8, 0, 0]}>
                  {metrics.concepts_by_level.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={LEVEL_COLORS[entry.level] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Learning Path Progress & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Paths Completion */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm text-foreground">Learning Path Progress</h3>
            </div>
          </div>

          {metrics.learning_paths_progress.length > 0 ? (
            <div className="space-y-4">
              {metrics.learning_paths_progress.map((p) => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground truncate max-w-[200px]">{p.title}</span>
                    <span className="font-mono text-nova-400 font-medium">
                      {p.completed_items}/{p.total_items} ({p.progress_percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${p.progress_percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No learning paths created yet.</p>
          )}
        </Card>

        {/* Recently Added Knowledge */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-sm text-foreground">Recent Knowledge Additions</h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {metrics.recent_knowledge.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border border-border/50 bg-card/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  {item.type === 'note' ? (
                    <BookOpen className="w-3.5 h-3.5 text-nova-400 shrink-0" />
                  ) : (
                    <Brain className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                  <span className="text-xs font-medium text-foreground truncate">{item.title}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                  {formatDate(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
