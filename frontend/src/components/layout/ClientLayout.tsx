'use client'

import { Navbar } from "@/components/layout/navbar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar />
      {children}
    </ProtectedRoute>
  )
}
