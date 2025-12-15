'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/layout/container'
import { LoadingSpinner } from '@/components/loading-spinner'
import { groupsApi, Group } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function GroupsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [groups, setGroups] = useState<Group[]>([])
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Vérifier l'authentification au montage
  useEffect(() => {
    const checkAuthWhenHydrated = () => {
      const state = useAuthStore.getState()
      
      if (!state._hasHydrated) {
        return
      }
      
      setIsHydrated(true)
      
      if (!state.isAuthenticated) {
        router.push('/auth/login')
      }
    }
    
    const unsubscribe = useAuthStore.subscribe(checkAuthWhenHydrated)
    checkAuthWhenHydrated()
    
    return () => unsubscribe()
  }, [])

  // Charger les groupes quand authentifié et hydraté
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      loadGroups()
    }
  }, [isHydrated, isAuthenticated])

  // Recharger quand la page redevient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isHydrated && isAuthenticated) {
        loadGroups()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isHydrated, isAuthenticated])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const data = await groupsApi.getAll()
      
      // Filtrer pour ne montrer que les groupes dont l'utilisateur est membre
      const { user } = useAuthStore.getState()
      const userGroups = data.filter(group => 
        group.memberships?.some(membership => membership.userId === user?.id)
      )
      
      setAllGroups(userGroups)
      setGroups(userGroups)
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les groupes par recherche
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setGroups(allGroups)
    } else {
      const filtered = allGroups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setGroups(filtered)
    }
  }, [searchQuery, allGroups])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50">
      <Container>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pt-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Groupes</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos groupes et partagez vos dépenses
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setLoading(true)
              loadGroups()
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-emerald-300 transition-all disabled:opacity-50"
          >
            <svg 
              className={`w-5 h-5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Actualiser</span>
          </button>
          <Link href="/groups/join">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl shadow-sm hover:shadow-md transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-sm font-medium">Rejoindre</span>
            </button>
          </Link>
          <Link href="/groups/create">
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">Créer un groupe</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-8">
        <div className="relative max-w-3xl mx-auto">
          {/* Icône de recherche avec animation */}
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg 
              className={`w-5 h-5 transition-all duration-300 ${
                searchQuery ? 'text-emerald-500 scale-110' : 'text-gray-400'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Input avec animations */}
          <input
            type="text"
            placeholder="Rechercher un groupe par nom ou description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-14 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg text-base"
          />
          
          {/* Bouton clear avec animation */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-red-500 transition-all duration-200 group animate-in fade-in slide-in-from-right-2"
            >
              <div className="p-1.5 rounded-full hover:bg-red-50 transition-colors">
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>
          )}
          
          {/* Barre de progression sous l'input */}
          <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 ${
            searchQuery ? 'w-full opacity-100' : 'w-0 opacity-0'
          }`} />
        </div>
        
        {/* Résultats avec animation */}
        {searchQuery && (
          <div className="mt-3 text-center animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm font-medium text-gray-700 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-gray-200 shadow-sm">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-emerald-600">{groups.length}</span>
              <span>résultat{groups.length > 1 ? 's' : ''} trouvé{groups.length > 1 ? 's' : ''}</span>
            </p>
          </div>
        )}
      </div>

      {!isHydrated || loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : groups.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-16">
            {searchQuery ? (
              <>
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? `Aucun groupe ne correspond à "${searchQuery}"`
                    : `Aucun groupe dans la catégorie sélectionnée`
                  }
                </p>
                <Button 
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  size="lg"
                >
                  Réinitialiser les filtres
                </Button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun groupe pour le moment</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Créez votre premier groupe pour commencer à partager vos dépenses avec vos amis
                </p>
                <Button asChild size="lg" className="shadow-md bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/groups/create">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer mon premier groupe
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, index) => {
            const totalExpenses = group.expenses ? group.expenses.reduce((sum, exp) => {
              const amount = typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount
              return sum + (isNaN(amount) || !isFinite(amount) ? 0 : amount)
            }, 0) : 0
            const membersCount = group.memberships?.length || 0
            const expensesCount = group.expenses?.length || 0
            
            return (
              <Link 
                href={`/groups/${group.id}`} 
                key={group.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card className="group relative overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full border-2 hover:border-emerald-400">
                  {/* Gradient background decoratif */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                  
                  <CardHeader className="relative pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {group.code && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border-2 border-teal-200">
                              <span>#{group.code}</span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  navigator.clipboard.writeText(group.code)
                                  // Toast notification
                                  const toast = document.createElement('div')
                                  toast.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2'
                                  toast.textContent = '✓ Code copié !'
                                  document.body.appendChild(toast)
                                  setTimeout(() => {
                                    toast.classList.add('animate-out', 'fade-out', 'slide-out-to-top-2')
                                    setTimeout(() => toast.remove(), 300)
                                  }, 2000)
                                }}
                                className="p-0.5 hover:bg-teal-200 rounded transition-colors"
                                title="Copier le code"
                              >
                                <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {group.name}
                        </CardTitle>
                      </div>
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <CardDescription className="text-base text-gray-600 line-clamp-2 min-h-[3rem]">
                      {group.description || 'Aucune description'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative space-y-3">
                    {/* Statistiques principales */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span className="text-xs font-medium text-emerald-700">Membres</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-900">{membersCount}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-3 border border-teal-200">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-xs font-medium text-teal-700">Dépenses</span>
                        </div>
                        <p className="text-2xl font-bold text-teal-900">{expensesCount}</p>
                      </div>
                    </div>
                    
                    {/* Total des dépenses */}
                    {totalExpenses > 0 && (
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-emerald-700">Total</span>
                          </div>
                          <p className="text-xl font-bold text-emerald-900">
                            {new Intl.NumberFormat('fr-FR', {
                              minimumFractionDigits: 3,
                              maximumFractionDigits: 3,
                            }).format(totalExpenses)} DT
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Badge si pas de dépenses */}
                    {expensesCount === 0 && (
                      <div className="text-center py-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-sm text-gray-500 font-medium">Aucune dépense pour le moment</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
      </Container>
    </div>
  )
}
