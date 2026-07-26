'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import apiClient from '@/lib/api/client'

export function LoginView() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email and password.')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      // POST /api/v1/auth/login -> { accessToken, refreshToken, roles }
      const response = await apiClient.post('/api/v1/auth/login', { email, password })
      const { accessToken, refreshToken } = response.data.data

      await login(accessToken, refreshToken)

      // Non-staff accounts (e.g. a student that ends up here) will be
      // bounced back to /login by useRequireStaff inside the merchant
      // layout -- no role check needed here.
      router.push('/admin')
    } catch {
      setError('Invalid email or password.')
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ucd-oatmeal px-4">
      <div className="w-full max-w-sm">
        <Card className="border-[#EAE5D9]">
          <CardHeader className="flex flex-col items-center text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-ucd-sage text-white">
              <ShieldCheck className="size-6" strokeWidth={2} />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-foreground">
              CampusEats Console
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Staff sign-in for canteen management
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@campuseats.ie"
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="mt-2 bg-ucd-sage hover:bg-ucd-sage/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
