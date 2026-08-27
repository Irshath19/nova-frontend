import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { useThemeStore } from '@/stores/theme-store'
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Network,
  Search,
  Sparkles,
  Compass,
  TrendingUp,
  LogOut,
  Moon,
  Sun,
  Laptop,
  Menu,
  X,
  Plus,
} from 'lucide-react'
import { QuickCaptureWidget } from '@/features/notes/QuickCaptureWidget'
import { Modal } from '@/components/ui/Modal'

export function AppLayout() {
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isQuickCaptureModalOpen, setIsQuickCaptureModalOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Notes', path: '/notes', icon: BookOpen },
    { label: 'Concepts', path: '/concepts', icon: Brain },
    { label: 'Graph', path: '/graph', icon: Network },
    { label: 'Search & RAG', path: '/search', icon: Search },
    { label: 'AI Tutor', path: '/tutor', icon: Sparkles },
    { label: 'Learning Paths', path: '/learning-paths', icon: Compass },
    { label: 'Progress', path: '/progress', icon: TrendingUp },
  ]

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light')
    else if (theme === 'light') setTheme('system')
    else setTheme('dark')
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar (Section 36) */}
      <aside className="hidden md:flex w-64 flex-col justify-between border-r border-border/80 bg-card/60 backdrop-blur-md p-4 shrink-0">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-nova-500 flex items-center justify-center shadow-lg shadow-nova-500/25">
              <span className="text-white font-extrabold text-sm">N</span>
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-foreground">NOVA</h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">
                Knowledge OS
              </p>
            </div>
          </div>

          {/* Quick Capture Trigger */}
          <button
            onClick={() => setIsQuickCaptureModalOpen(true)}
            className="w-full mb-4 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-nova-500 hover:bg-nova-600 text-white font-medium text-xs shadow-sm shadow-nova-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Capture</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-nova-500/15 text-nova-400 font-semibold border border-nova-500/20'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="pt-4 border-t border-border/60 space-y-2">
          <div className="flex items-center justify-between px-2">
            <div className="min-w-0 pr-2">
              <span className="font-semibold text-xs text-foreground block truncate">
                {user?.username || 'Explorer'}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {user?.email}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title={`Theme: ${theme}`}
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4" />
              ) : theme === 'light' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Laptop className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header (Section 37) */}
        <header className="md:hidden flex items-center justify-between border-b border-border/80 bg-card/80 backdrop-blur-md px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-nova-500 flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-xs">N</span>
            </div>
            <h1 className="font-extrabold text-sm tracking-tight text-foreground">NOVA</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQuickCaptureModalOpen(true)}
              className="p-1.5 rounded-lg bg-nova-500 text-white"
              title="Quick Capture"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (Section 37) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border/80 bg-card/95 backdrop-blur-lg px-2 py-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-medium ${
                isActive ? 'text-nova-400 font-semibold' : 'text-muted-foreground'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/notes"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-medium ${
                isActive ? 'text-nova-400 font-semibold' : 'text-muted-foreground'
              }`
            }
          >
            <BookOpen className="w-4 h-4" />
            <span>Notes</span>
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-medium ${
                isActive ? 'text-nova-400 font-semibold' : 'text-muted-foreground'
              }`
            }
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </NavLink>
          <NavLink
            to="/tutor"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-medium ${
                isActive ? 'text-nova-400 font-semibold' : 'text-muted-foreground'
              }`
            }
          >
            <Sparkles className="w-4 h-4" />
            <span>Tutor</span>
          </NavLink>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-64 bg-card border-l border-border p-5 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <span className="font-bold text-sm">Menu</span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                          isActive
                            ? 'bg-nova-500/15 text-nova-400 font-semibold'
                            : 'text-muted-foreground'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Capture Modal */}
      <Modal
        isOpen={isQuickCaptureModalOpen}
        onClose={() => setIsQuickCaptureModalOpen(false)}
        title="Quick Capture"
        description="Instantly record what you learned. NOVA handles structuring and connections in the background."
        maxWidth="lg"
      >
        <QuickCaptureWidget
          onCaptured={() => {
            setIsQuickCaptureModalOpen(false)
            navigate('/notes')
          }}
        />
      </Modal>
    </div>
  )
}
