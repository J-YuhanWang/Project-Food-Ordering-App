'use client'

import { Loader2 } from 'lucide-react'
import { useRequireAuth } from '@/lib/auth-context'

/**
 * Client wrapper for protected routes. While auth resolves it shows a centered
 * loader; unauthenticated visitors are redirected to /login by useRequireAuth.
 * Authenticated visitors see the page content.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, ready } = useRequireAuth()

  if (!ready || !isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          className="size-8 animate-spin text-primary"
          strokeWidth={2.2}
          aria-label="Loading"
        />
      </div>
    )
  }

  return <>{children}</>
}
