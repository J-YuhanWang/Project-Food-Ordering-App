'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  LogOut,
  Pencil,
  Receipt,
  ShoppingBag,
  Soup,
  User,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {getInitials} from "@/lib/user";

export function Navbar() {
  const router = useRouter()
  const { isLoggedIn, clearSession,user ,cartCount} = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Portal target is only available on the client.
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close the logout modal on Escape for accessibility.
  useEffect(() => {
    if (!logoutOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loggingOut) setLogoutOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [logoutOpen, loggingOut])

  function openLogoutModal() {
    setMenuOpen(false)
    setLogoutOpen(true)
  }

  async function handleConfirmLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      // POST /api/v1/auth/logout with Authorization: Bearer {accessToken}
      console.log('[v0] POST /api/v1/auth/logout')
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch {
      // Never block logout — fall through to clear tokens regardless.
    } finally {
      // Clear accessToken + refreshToken and flip session state, then redirect.
      clearSession()
      setLogoutOpen(false)
      setLoggingOut(false)
      router.push('/login')
    }
  }

  const menuItems = [
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Edit Profile', href: '/profile/edit', icon: Pencil },
    { label: 'My Orders', href: '/orders', icon: Receipt },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-[#EAE5D9] bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo — always clickable, routes home */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 overflow-hidden rounded-lg">

            <Image
                src="/apple-touch-icon.png"
                alt="CampusEats"
                width={36}
                height={36}
            />
          </span>
          <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
            CampusEats
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {isLoggedIn ? (
            <>
              {/* Cart with coral count badge */}
              <Link
                  href="/cart"
                  className="relative flex size-10 items-center justify-center rounded-xl border border-[#EAE5D9] bg-primary/15 text-foreground transition-colors hover:bg-primary/25"
                  aria-label="Shopping cart"
              >
                <ShoppingBag className="size-5 text-primary" strokeWidth={2} />
                {cartCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-secondary-foreground">
                      {cartCount}
                    </span>
                )}
              </Link>

              {/* Avatar + dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                  className="relative flex size-10 overflow-hidden items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {user?.profileUrl ? (<Image src={user.profileUrl} alt={user.name} fill sizes="40px" className="object-cover"/>) : (<span>{getInitials(user?.name ?? '')}</span>)}
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-12 w-52 overflow-hidden rounded-2xl border border-[#EAE5D9] bg-card p-1.5 shadow-lg shadow-black/5"
                  >
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-foreground">
                        {user?.name ?? 'My Account'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user?.email ?? ''}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-[#EAE5D9]" />
                    {menuItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <item.icon className="size-4 text-muted-foreground" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="my-1 h-px bg-[#EAE5D9]" />
                    {/* Minimalist logout item — opens the centered modal */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={openLogoutModal}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <LogOut className="size-4 text-muted-foreground" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Login — outlined sage */}
              <Link
                href="/login"
                className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                Login
              </Link>
              {/* Register — filled dominant green */}
              <Link
                href="/register"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Centered logout alert dialog — portaled to body so the blurred
          sticky <header> doesn't become its positioning context. */}
      {logoutOpen &&
        mounted &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-desc"
            onClick={() => !loggingOut && setLogoutOpen(false)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          >
            {/* Modal card — perfectly centered in the viewport */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-[0_24px_60px_rgba(30,30,20,0.25)]"
            >
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <LogOut className="size-7" strokeWidth={2.2} />
              </span>
              <h2
                id="logout-title"
                className="mt-5 font-heading text-3xl font-bold text-foreground"
              >
                Log Out?
              </h2>
              <p
                id="logout-desc"
                className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground"
              >
                Are you sure you want to log out of UCD Canteen Hub?
              </p>

              <div className="mt-7 flex gap-3">
                {/* Cancel — sage outlined */}
                <button
                  type="button"
                  onClick={() => setLogoutOpen(false)}
                  disabled={loggingOut}
                  className="flex-1 rounded-xl border border-primary px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
                >
                  Cancel
                </button>
                {/* Confirm — filled deep green */}
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  disabled={loggingOut}
                  className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loggingOut ? 'Logging out…' : 'Yes, Log Out'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </header>
  )
}
