'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  LogOut,
  Pencil,
  Receipt,
  ShoppingBag,
  Soup,
  User,
} from 'lucide-react'
export function Navbar() {
  // Toggle to preview logged-in vs logged-out states.
  const [isLoggedIn] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems = [
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Edit Profile', href: '/profile/edit', icon: Pencil },
    { label: 'My Orders', href: '/orders', icon: Receipt },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-[#EAE5D9] bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Soup className="size-5" strokeWidth={2} />
          </span>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            UCD Canteen Hub
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {isLoggedIn ? (
            <>
              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex size-10 items-center justify-center rounded-xl border border-[#EAE5D9] bg-card text-foreground transition-colors hover:bg-muted"
                aria-label="Shopping cart, 4 items"
              >
                <ShoppingBag className="size-5" strokeWidth={2} />
                <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-secondary-foreground">
                  4
                </span>
              </Link>

              {/* Avatar */}
              <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account menu"
                className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                JD
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 w-52 overflow-hidden rounded-2xl border border-[#EAE5D9] bg-card p-1.5 shadow-lg shadow-black/5"
                >
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-foreground">
                      Jane Doe
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      jane.doe@ucdconnect.ie
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
                  <Link
                    href="/login"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </Link>
                </div>
              )}
            </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Login
              </Link>
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
    </header>
  )
}
