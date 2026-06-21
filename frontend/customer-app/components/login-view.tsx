'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Soup, Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import apiClient from "@/lib/api/client";

export function LoginView() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    if (!email.trim() || !password.trim()) {
      setFieldError(true)
      return
    }
    setFieldError(false)
    setSubmitting(true)

    try {
      // POST /api/v1/auth/login -> { accessToken, refreshToken, roles }
      const response = await apiClient.post('/api/v1/auth/login',{email,password})
      console.log(response.data.data)
      const {accessToken, refreshToken} = response.data.data

      login(accessToken,refreshToken)
      router.push('/')
    } catch {
      // 401 / 400 -> invalid credentials
      setToast('Invalid email or password')
      setTimeout(() => setToast(null), 3000)
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      {/* Premium escape pill — top-left back-to-home */}
      <Link
        href="/"
        className="absolute left-4 top-5 inline-flex items-center gap-1.5 rounded-full border border-[#EAE5D9] bg-card/80 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur-sm transition-colors hover:bg-muted sm:left-6 lg:left-8"
      >
        <ArrowLeft className="size-4" strokeWidth={2.2} />
        Back to Home
      </Link>

      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-3xl bg-card p-8 shadow-[0_8px_30px_rgb(230,225,210,0.4)] sm:p-10">
          {/* Logo + heading */}
          <div className="flex flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_24px_rgb(141,162,73,0.3)]">
              <Soup className="size-7" strokeWidth={2} />
            </span>
            <h1 className="mt-5 font-heading text-4xl font-bold text-foreground">
              Welcome Back
            </h1>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Log in to fuel your campus day.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <Field label="Email" icon={Mail}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@ucdconnect.ie"
                autoComplete="email"
                className="w-full rounded-xl border border-[#EAE5D9] bg-background py-3 pl-11 pr-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </Field>

            <Field label="Password" icon={Lock}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#EAE5D9] bg-background py-3 pl-11 pr-11 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-5" strokeWidth={2} />
                ) : (
                  <Eye className="size-5" strokeWidth={2} />
                )}
              </button>
            </Field>

            {fieldError && (
              <p className="-mt-2 text-sm font-medium text-destructive">
                Please enter both your email and password.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-base font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" strokeWidth={2.2} />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have a campus account?{' '}
          <Link
            href="/register"
            className="font-bold text-primary transition-colors hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>

      {/* Error toast */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-md items-center justify-center rounded-2xl bg-destructive px-5 py-4 text-center text-sm font-semibold text-destructive-foreground shadow-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
        >
          {toast}
        </div>
      )}
    </main>
  )
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: typeof Mail
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="relative block">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-primary"
          strokeWidth={2}
        />
        {children}
      </span>
    </label>
  )
}
