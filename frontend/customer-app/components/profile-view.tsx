'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  ChevronRight,
} from 'lucide-react'
import {
  getInitials,
  ROLE_LABEL,
  type UserDTO,
} from '@/lib/user'
import apiClient from "@/lib/api/client";

export function ProfileView() {
  const [user, setUser] = useState<UserDTO | null>(null)
  const [loading, setLoading] = useState(true)

  // Simulates GET /api/v1/users/me on mount.
  useEffect(()=>{
    apiClient.get('api/v1/users/me')
        .then((res)=>setUser(res.data.data))
        .finally(()=>setLoading(false))
  })

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      {loading || !user ? (
        <ProfileSkeleton />
      ) : (
        <div className="overflow-hidden rounded-3xl bg-card shadow-[0_8px_30px_rgb(230,225,210,0.4)]">
          {/* Sage banner — kept short so the avatar can straddle the seam */}
          <div className="h-32 bg-primary sm:h-36" />

          {/* Overlapping avatar: pulled up to sit halfway over banner + card */}
          <div className="flex flex-col items-center px-6 pb-8 sm:px-8">
            <div className="-mt-16 relative flex size-32 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-card shadow-[0_10px_30px_rgb(141,162,73,0.25)]">
              {user.profileUrl ? (
                <Image
                  src={user.profileUrl || '/placeholder.svg'}
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
            </div>

            {/* Name + role badge relocated under the avatar in the white card */}
            <h1 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              {user.name}
            </h1>
            <span className="mt-2.5 inline-flex items-center rounded-full bg-primary/12 px-4 py-1.5 text-sm font-bold text-primary">
              {ROLE_LABEL[user.roles[0]]}
            </span>

            {/* Info rows with colored icon badges */}
            <dl className="mt-8 flex w-full flex-col">
              <InfoRow
                icon={Mail}
                label="Email"
                value={user.email}
                badgeClass="bg-secondary text-secondary-foreground"
              />
              <Divider />
              <InfoRow
                icon={Phone}
                label="Phone"
                value={user.phoneNumber}
                badgeClass="bg-primary text-primary-foreground"
              />
              <Divider />
              <InfoRow
                icon={MapPin}
                label="Address"
                value={user.address}
                badgeClass="bg-[#E8B84B] text-[#5C4813]"
              />
              <Divider />
              <div className="flex items-center justify-between gap-4 py-4">
                <dt className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Shield className="size-[18px]" strokeWidth={2.2} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Status
                  </span>
                </dt>
                <dd>
                  {user.active ? (
                    <span className="inline-flex items-center rounded-full bg-primary/12 px-3 py-1 text-sm font-semibold text-primary">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-destructive/12 px-3 py-1 text-sm font-semibold text-destructive">
                      Inactive
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            {/* Primary full-width coral CTA */}
            <Link
              href="/profile/edit"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-4 text-base font-bold text-secondary-foreground shadow-sm transition-all hover:brightness-105"
            >
              <User className="size-5" strokeWidth={2.2} />
              Edit Profile
            </Link>

            {/* Subtle secondary text link */}
            <Link
              href="/orders"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              View My Orders
              <ChevronRight className="size-4" strokeWidth={2.2} />
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  badgeClass,
}: {
  icon: typeof Mail
  label: string
  value: string
  badgeClass: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <dt className="flex min-w-0 items-center gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${badgeClass}`}
        >
          <Icon className="size-[18px]" strokeWidth={2.2} />
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </dt>
      <dd className="min-w-0 truncate text-right text-sm font-medium text-foreground">
        {value}
      </dd>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-[#EAE5D9]" />
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl bg-card shadow-[0_8px_30px_rgb(230,225,210,0.4)]">
      {/* Short banner */}
      <div className="h-32 bg-muted sm:h-36" />
      <div className="flex flex-col items-center px-6 pb-8 sm:px-8">
        {/* Overlapping avatar */}
        <div className="-mt-16 size-32 rounded-full border-4 border-card bg-muted" />
        <div className="mt-4 h-9 w-44 rounded-lg bg-muted" />
        <div className="mt-2.5 h-7 w-24 rounded-full bg-muted" />
        {/* Info rows */}
        <div className="mt-8 flex w-full flex-col gap-7">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
              </div>
              <div className="h-4 w-32 rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-8 h-14 w-full rounded-xl bg-muted" />
        <div className="mt-4 h-4 w-32 rounded bg-muted" />
      </div>
    </div>
  )
}
