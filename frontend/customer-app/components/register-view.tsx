'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import apiClient from "@/lib/api/client";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Loader2,
  ArrowLeft,
} from 'lucide-react'

function getStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (password.length === 0) return { score: 0, label: '', color: '' }
  if (score <= 2)
    return { score: 1, label: 'Weak', color: 'bg-destructive' }
  if (score === 3)
    return { score: 2, label: 'Fair', color: 'bg-[#E8B84B]' }
  if (score === 4) return { score: 3, label: 'Good', color: 'bg-primary' }
  return { score: 4, label: 'Strong', color: 'bg-primary' }
}

export function RegisterView() {
  const router = useRouter()

  // Step 1 — email verification
  const [email, setEmail] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')

  // Step 2 — account details
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{
    msg: string
    kind: 'success' | 'error'
  } | null>(null)

  const strength = useMemo(() => getStrength(password), [password])

  const allFilled =
    name.trim() &&
    email.trim() &&
    password.length >= 6 &&
    phoneNumber.trim() &&
    address.trim() &&
    verificationCode.trim().length === 6

  function showToast(msg: string, kind: 'success' | 'error') {
    setToast({ msg, kind })
    if (kind === 'error') setTimeout(() => setToast(null), 3500)
  }

  async function handleSendCode() {
    if (sendingCode || !email.trim()) {
      if (!email.trim()) setSendError('Please enter your email first.')
      return
    }
    setSendingCode(true)
    setSendError(null)
    try {
      await apiClient.post('api/v1/auth/send-code',null,{params:{ email }})
      setCodeSent(true)
    } catch {
      setSendError('Could not send code. Please try again.')
    } finally {
      setSendingCode(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting || !allFilled) return
    setSubmitting(true)
    try {
      console.log('submitting:', { name, email, password, phoneNumber, address, verificationCode })
      await apiClient.post('api/v1/auth/register',{
        name,
        email,
        password,
        phoneNumber,
        address,
        verificationCode,
      })

      showToast('Account created! Please log in to continue.', 'success')
      setTimeout(() => router.push('/login'), 1500)
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Registration failed. Please try again.'
      showToast(message, 'error')
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
          {/* Heading */}
          <div className="flex flex-col items-center text-center">
            <h1 className="font-heading text-4xl font-bold text-foreground">
              Join the Hub
            </h1>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Create your UCD dining account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            {/* STEP 1 — Email + Send Code */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Email
              </span>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <span className="relative block flex-1">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-primary"
                    strokeWidth={2}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@ucdconnect.ie"
                    autoComplete="email"
                    className="w-full rounded-xl border border-[#EAE5D9] bg-background py-3 pl-11 pr-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </span>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
                >
                  {sendingCode ? (
                    <Loader2 className="size-4 animate-spin" strokeWidth={2.2} />
                  ) : codeSent ? (
                    'Resend Code'
                  ) : (
                    'Send Code'
                  )}
                </button>
              </div>
              {codeSent && (
                <p className="text-sm font-medium text-primary">
                  Verification code sent! Check your email.
                </p>
              )}
              {sendError && (
                <p className="text-sm font-medium text-destructive">
                  {sendError}
                </p>
              )}
            </div>

            {/* Verification code — only after code sent */}
            {codeSent && (
              <Field label="Verification Code" icon={ShieldCheck}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, '').slice(0, 6),
                    )
                  }
                  placeholder="Enter 6-digit code"
                  className="w-full rounded-xl border border-[#EAE5D9] bg-background py-3 pl-11 pr-4 text-sm font-medium tracking-[0.3em] text-foreground outline-none transition-colors placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary"
                />
              </Field>
            )}

            {/* STEP 2 — Account details */}
            <Field label="Full Name" icon={User}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
                className="w-full rounded-xl border border-[#EAE5D9] bg-background py-3 pl-11 pr-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </Field>

            <div className="flex flex-col gap-2">
              <Field label="Password" icon={Lock}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
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
              {/* Real-time strength indicator */}
              {password.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex h-1.5 flex-1 gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <span
                        key={n}
                        className={`h-full flex-1 rounded-full transition-colors ${
                          n <= strength.score ? strength.color : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <Field label="Phone Number" icon={Phone}>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+353 87 000 0000"
                autoComplete="tel"
                className="w-full rounded-xl border border-[#EAE5D9] bg-background py-3 pl-11 pr-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </Field>

            <Field label="Address" icon={MapPin}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dublin, Ireland"
                autoComplete="street-address"
                className="w-full rounded-xl border border-[#EAE5D9] bg-background py-3 pl-11 pr-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </Field>

            <button
              type="submit"
              disabled={!allFilled || submitting}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-base font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" strokeWidth={2.2} />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold text-primary transition-colors hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role={toast.kind === 'error' ? 'alert' : 'status'}
          aria-live={toast.kind === 'error' ? 'assertive' : 'polite'}
          className={`fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-md items-center justify-center rounded-2xl px-5 py-4 text-center text-sm font-semibold shadow-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 ${
            toast.kind === 'success'
              ? 'bg-primary text-primary-foreground'
              : 'bg-destructive text-destructive-foreground'
          }`}
        >
          {toast.msg}
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
