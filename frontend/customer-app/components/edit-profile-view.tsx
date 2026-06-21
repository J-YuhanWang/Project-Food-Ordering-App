'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  User,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  Camera,
  Info,
  Loader2,
} from 'lucide-react'
import {
  getMyInfo,
  getInitials,
  ROLE_LABEL,
  type UserDTO,
} from '@/lib/user'

export function EditProfileView() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<UserDTO | null>(null)
  const [loading, setLoading] = useState(true)

  // Editable field state
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')

  // Avatar: preview URL for display + the actual File to upload (only if changed)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)

  // Simulates GET /api/v1/users/me on mount and hydrates the form.
  useEffect(() => {
    const timer = setTimeout(() => {
      const data = getMyInfo()
      setUser(data)
      setName(data.name)
      setPhoneNumber(data.phoneNumber)
      setAddress(data.address)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  // Revoke object URLs to avoid memory leaks when preview changes/unmounts.
  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  // Dirty check: enable Save only when a field changed or a new photo is chosen.
  const isDirty =
    !!user &&
    (name.trim() !== user.name ||
      phoneNumber.trim() !== user.phoneNumber ||
      address.trim() !== user.address ||
      avatarFile !== null)

  async function handleSave() {
    if (!isDirty || saving) return
    setSaving(true)
    setToast(null)
    try {
      // Step 1 — always: PUT /api/v1/users/me
      console.log('[v0] PUT /api/v1/users/me', { name, phoneNumber, address })
      await new Promise((resolve) => setTimeout(resolve, 700))

      // Step 2 — only when a new photo was selected: POST /api/v1/users/me/avatar
      if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)
        console.log('[v0] POST /api/v1/users/me/avatar', avatarFile.name)
        await new Promise((resolve) => setTimeout(resolve, 600))
      }

      setToast({ kind: 'success', message: 'Profile updated successfully! ✓' })
      setTimeout(() => router.push('/profile'), 1000)
    } catch {
      setSaving(false)
      setToast({
        kind: 'error',
        message: 'Failed to update. Please try again.',
      })
    }
  }

  const previewSrc = avatarPreview ?? user?.profileUrl ?? null

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Back button */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 rounded-full border border-primary px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
      >
        <ChevronLeft className="size-4" strokeWidth={2.2} />
        Back to Profile
      </Link>

      {loading || !user ? (
        <EditSkeleton />
      ) : (
        <>
          <div className="mt-8 overflow-hidden rounded-3xl bg-card shadow-[0_8px_30px_rgb(230,225,210,0.4)]">
            {/* Sage banner — kept short so the avatar can straddle the seam */}
            <div className="h-32 bg-primary sm:h-36" />

            <div className="flex flex-col items-center px-6 pb-8 sm:px-8">
              {/* Overlapping, interactive avatar (half banner / half card) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload new profile photo"
                className="group relative -mt-16 flex size-32 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-card shadow-[0_10px_30px_rgb(141,162,73,0.25)] transition-transform hover:scale-[1.02]"
              >
                {previewSrc ? (
                  <Image
                    src={previewSrc || '/placeholder.svg'}
                    alt={user.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-primary/12">
                    <span className="font-heading text-4xl font-bold text-primary">
                      {getInitials(user.name)}
                    </span>
                  </div>
                )}
                {/* Hover overlay (desktop): 40% black mask + camera + micro-text */}
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-foreground/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <Camera className="size-6 text-card" strokeWidth={2.2} />
                  <span className="text-xs font-bold text-card">Upload New</span>
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Name + role badge centered under the avatar.
                  Heading is bound to the live `name` state for real-time sync. */}
              <h1 className="mt-5 font-heading text-3xl font-bold text-foreground sm:text-4xl">
                {name.trim() || 'Your Name'}
              </h1>
              <span className="mt-2.5 inline-flex items-center rounded-full bg-primary/12 px-4 py-1.5 text-sm font-bold text-primary">
                {ROLE_LABEL[user.roles[0]]}
              </span>

              {/* Editable fields */}
              <div className="mt-8 flex w-full flex-col gap-5">
                {/* Username — bound to the same `name` state as the heading above */}
                <Field label="Username" icon={User}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. jane_doe or your preferred nickname"
                    className="w-full rounded-xl border border-[#EAE5D9] bg-background py-3 pl-11 pr-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </Field>

                {/* Email — read only */}
                <div>
                  <Field label="Email Address (Read-only)" icon={Mail}>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      aria-readonly="true"
                      className="w-full cursor-not-allowed rounded-xl border border-[#EAE5D9] bg-muted py-3 pl-11 pr-4 text-sm font-medium text-muted-foreground outline-none"
                    />
                  </Field>
                  <p className="mt-1.5 pl-1 text-xs italic text-muted-foreground">
                    Email cannot be changed as it is linked to your UCD ID.
                  </p>
                </div>

                {/* Phone */}
                <Field label="Phone Number" icon={Phone}>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+353 87 000 0000"
                    className="w-full rounded-xl border border-[#EAE5D9] bg-background py-3 pl-11 pr-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </Field>

                {/* Address */}
                <Field label="Address" icon={MapPin}>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Dublin, Ireland"
                    className="w-full rounded-xl border border-[#EAE5D9] bg-background py-3 pl-11 pr-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </Field>
              </div>

              {/* Primary full-width coral CTA */}
              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty || saving}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-4 text-base font-bold text-secondary-foreground shadow-sm transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-5 animate-spin" strokeWidth={2.2} />
                    Saving…
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>

              {/* Secondary cancel — outlined border button below the CTA */}
              <Link
                href="/profile"
                className="mt-3 flex w-full items-center justify-center rounded-xl border border-[#EAE5D9] px-5 py-3.5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Privacy notice */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#E8F0DC] px-5 py-4">
            <Info
              className="mt-0.5 size-5 shrink-0 text-primary"
              strokeWidth={2.2}
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your contact details are only used for order notifications and
              campus dining updates. We value your privacy and security.
            </p>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-md items-center justify-center rounded-2xl px-5 py-4 text-center text-sm font-semibold shadow-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 ${
            toast.kind === 'success'
              ? 'bg-primary text-primary-foreground'
              : 'bg-destructive text-card'
          }`}
        >
          {toast.message}
        </div>
      )}
    </section>
  )
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: typeof User
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground">
        {label}
      </span>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
          strokeWidth={2.2}
        />
        {children}
      </div>
    </label>
  )
}

function EditSkeleton() {
  return (
    <div className="mt-8 animate-pulse overflow-hidden rounded-3xl bg-card shadow-[0_8px_30px_rgb(230,225,210,0.4)]">
      {/* Short banner */}
      <div className="h-32 bg-muted sm:h-36" />
      <div className="flex flex-col items-center px-6 pb-8 sm:px-8">
        {/* Overlapping avatar */}
        <div className="-mt-16 size-32 rounded-full border-4 border-card bg-muted" />
        <div className="mt-5 h-9 w-44 rounded-lg bg-muted" />
        <div className="mt-2.5 h-7 w-24 rounded-full bg-muted" />
        {/* Fields */}
        <div className="mt-8 flex w-full flex-col gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div className="mb-2 h-4 w-24 rounded bg-muted" />
              <div className="h-11 w-full rounded-xl bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-8 h-14 w-full rounded-xl bg-muted" />
        <div className="mt-3 h-12 w-full rounded-xl bg-muted" />
      </div>
    </div>
  )
}
