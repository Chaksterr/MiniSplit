'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { groupsApi, groupMembersApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function CreateGroupPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Créer le groupe (le backend ajoute automatiquement le créateur comme membre admin)
      const group = await groupsApi.create({ name, description })
      
      // Marquer qu'il faut recharger la page Home
      if (typeof window !== 'undefined') {
        localStorage.setItem('homeNeedsRefresh', 'true')
      }
      
      router.push(`/groups/${group.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du groupe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
        <Link href="/groups" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux groupes
        </Link>
      </div>

      {/* En-tête moderne */}
      <div className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-gray-200 rounded-2xl p-8 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Créer un nouveau groupe</h1>
            <p className="text-gray-600 text-lg mt-1">Partagez vos dépenses avec vos amis ou votre famille</p>
          </div>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pb-6">
          <CardTitle className="text-xl font-bold text-gray-900">Informations du groupe</CardTitle>
          <CardDescription className="text-base mt-2">
            Remplissez les informations pour créer votre groupe
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6 pb-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            <div className="space-y-3">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                Nom du groupe <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                placeholder="Ex: Colocation, Voyage en Italie, Weekend ski..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 text-base border-2 focus:border-emerald-500 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Choisissez un nom descriptif pour votre groupe
              </p>
            </div>

            <div className="space-y-3">
              <label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                Description <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <Textarea
                id="description"
                placeholder="Ajoutez une description pour mieux identifier ce groupe..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="text-base border-2 resize-none focus:border-emerald-500 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Décrivez l'objectif ou le contexte du groupe
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 bg-gray-50 border-t border-gray-200 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              asChild 
              className="w-full sm:w-auto order-2 sm:order-1 border-gray-300 hover:bg-gray-100"
            >
              <Link href="/groups">Annuler</Link>
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full sm:w-auto order-1 sm:order-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer le groupe
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  )
}
