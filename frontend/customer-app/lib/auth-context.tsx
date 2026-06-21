'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextValue {
  /** Whether the visitor is authenticated. */
  isLoggedIn: boolean
  /** True until the initial auth check resolves (avoids UI flash). */
  ready: boolean
  /** Mark the session as authenticated (call after a successful login). */
  login: () => void
  /** Clear the session locally (used by the logout flow). */
  clearSession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Wraps the app and exposes a single source of truth for auth state.
 *
 * For now this is a client-only mock backed by localStorage so the navbar,
 * route guards, and the add-to-cart prompt all stay in sync. When the real
 * API is wired in, swap the localStorage reads for a token/session check.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to logged-in so the authenticated experience previews by default.
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Hydrate from storage on mount. A missing flag defaults to logged-in.
    try {
      const stored = localStorage.getItem('ucd.isLoggedIn')
      if (stored !== null) setIsLoggedIn(stored === 'true')
    } catch {
      // Ignore storage access errors (e.g. SSR / privacy mode).
    }
    setReady(true)
  }, [])

  const login = useCallback(() => {
    setIsLoggedIn(true)
    try {
      localStorage.setItem('ucd.isLoggedIn', 'true')
    } catch {
      // Ignore storage write errors.
    }
  }, [])

  const clearSession = useCallback(() => {
    setIsLoggedIn(false)
    try {
      localStorage.setItem('ucd.isLoggedIn', 'false')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } catch {
      // Ignore storage write errors.
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isLoggedIn, ready, login, clearSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

/**
 * Guards a protected page: redirects unauthenticated visitors to /login.
 * Returns the auth state so the page can render a loader while resolving.
 */
export function useRequireAuth() {
  const { isLoggedIn, ready } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (ready && !isLoggedIn) {
      router.replace('/login')
    }
  }, [ready, isLoggedIn, router])

  return { isLoggedIn, ready }
}
