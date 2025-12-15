'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { LoadingSpinner } from '@/components/loading-spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Attendre que le store soit hydraté
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Vérifier l'authentification seulement après l'hydratation
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isHydrated, isAuthenticated, router])

  // Afficher un loader pendant l'hydratation
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Afficher un loader si pas authentifié (pendant la redirection)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return <>{children}</>
}
