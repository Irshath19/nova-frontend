import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, Lock, Sparkles, KeyRound } from 'lucide-react'

export function LoginPage() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login({
        email_or_username: emailOrUsername.trim(),
        password: password,
      })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Invalid email/username or password')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setEmailOrUsername('demo@nova.ai')
    setPassword('nova123456')
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-nova-950/40">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-nova-500 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-xl shadow-nova-500/25 border border-nova-400/30">
            N
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">NOVA</h1>
          <p className="text-sm text-foreground/80 font-medium">Your personal knowledge, connected.</p>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            Capture. Connect. Learn.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-xs text-destructive-foreground font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email or Username</label>
              <Input
                type="text"
                placeholder="you@nova.ai"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full text-sm font-semibold mt-2" isLoading={isLoading}>
              Sign In to NOVA
            </Button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="pt-2 border-t border-border/60 text-center">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-xs font-mono text-nova-400 hover:text-nova-300 transition-colors inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-nova-500/10 border border-nova-500/20"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Use Demo Account (demo@nova.ai)</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-nova-400 font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}
