'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { LoadingSpinner } from '@/components/loading-spinner'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, _hasHydrated } = useAuthStore()

  useEffect(() => {
    // Attendre que le store soit hydraté
    if (!_hasHydrated) {
      return
    }

    // Pages publiques qui ne nécessitent pas d'authentification
    const publicPaths = ['/auth/login', '/auth/register', '/']
    const isPublicPath = publicPaths.some(path => pathname?.startsWith(path))

    // Si pas authentifié et pas sur une page publique, rediriger vers login
    if (!isAuthenticated && !isPublicPath) {
      console.log('Not authenticated, redirecting to login from:', pathname)
      router.push('/auth/login')
    }

    // Si authentifié et sur une page d'auth, rediriger vers home
    if (isAuthenticated && (pathname === '/auth/login' || pathname === '/auth/register')) {
      console.log('Already authenticated, redirecting to home')
      router.push('/home')
    }
  }, [isAuthenticated, _hasHydrated, pathname, router])

  // Afficher un loader pendant l'hydratation
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Pages publiques
  const publicPaths = ['/auth/login', '/auth/register', '/']
  const isPublicPath = publicPaths.some(path => pathname?.startsWith(path))

  // Si pas authentifié et pas sur une page publique, ne rien afficher (redirection en cours)
  if (!isAuthenticated && !isPublicPath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return <>{children}</>
}
