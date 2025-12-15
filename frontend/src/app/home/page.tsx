'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { groupsApi, categoriesApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { ReportModal } from '@/components/reports/ReportModal'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalExpenses: 0,
    totalSpent: 0,
    recentExpenses: [] as any[],
    topCategories: [] as any[],
    activeGroups: [] as any[],
  })

  // Vérifier l'authentification au montage
  useEffect(() => {
    const checkAuthWhenHydrated = async () => {
      const state = useAuthStore.getState()
      
      if (!state._hasHydrated) {
        return
      }
      
      console.log('Store hydrated, checking auth')
      setIsHydrated(true)
      
      console.log('Auth state:', { isAuthenticated: state.isAuthenticated, user: state.user })
      
      if (!state.isAuthenticated || !state.user) {
        console.log('Not authenticated, redirecting to login')
        router.push('/auth/login')
        return
      }
      
      // Si le username manque, recharger le profil utilisateur
      if (!state.user.username) {
        console.log('Username missing, reloading user profile')
        try {
          const { usersApi } = await import('@/lib/api')
          const updatedUser = await usersApi.getById(state.user.id)
          state.updateUser(updatedUser)
        } catch (error) {
          console.error('Failed to reload user profile:', error)
        }
      }
    }
    
    const unsubscribe = useAuthStore.subscribe(checkAuthWhenHydrated)
    checkAuthWhenHydrated()
    
    return () => unsubscribe()
  }, [])

  // Charger les stats quand authentifié et hydraté
  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      console.log('Loading stats...')
      loadStats(true)
    }
  }, [isHydrated, isAuthenticated, user])
  
  // Recharger quand la page redevient visible
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !user) return

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadStats()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isHydrated, isAuthenticated, user])
  
  // Recharger quand on revient sur la page (navigation)
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !user) return

    const handleFocus = () => {
      loadStats()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [isHydrated, isAuthenticated, user])
  
  // Rechargement automatique toutes les 30 secondes si la page est visible
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !user) return
    
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadStats()
      }
    }, 30000) // 30 secondes
    
    return () => clearInterval(interval)
  }, [isHydrated, isAuthenticated, user])

  const loadStats = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true)
      }
      
      // Charger les catégories avec leurs budgets personnels
      const allCategories = await categoriesApi.getAllWithBudgets()
      const categoriesWithLimits = new Map(allCategories.map(cat => [cat.id, cat]))
      
      const groups = await groupsApi.getAll()
      
      // Filtrer les groupes où l'utilisateur est membre
      const userGroups = groups.filter(group => 
        group.memberships?.some(membership => membership.userId === user?.id)
      )
      
      let totalExpenses = 0
      let totalSpent = 0
      let allExpenses: any[] = []
      const categoryMap = new Map()

      for (const group of userGroups) {
        if (group.expenses) {
          // Filtrer les dépenses où l'utilisateur est participant
          const userExpenses = group.expenses.filter(expense =>
            expense.participants?.some(p => p.id === user?.id)
          )
          
          allExpenses = [...allExpenses, ...userExpenses]
          
          userExpenses.forEach((expense: any) => {
            const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
            totalExpenses++
            
            // Ajouter au total seulement si l'utilisateur a payé
            if (expense.paidBy?.id === user?.id) {
              totalSpent += amount
            }

            if (expense.category) {
              // Récupérer la catégorie complète avec budgetLimit
              const fullCategory = categoriesWithLimits.get(expense.category.id) || expense.category
              const current = categoryMap.get(fullCategory.name) || { 
                ...fullCategory, 
                total: 0, 
                count: 0 
              }
              current.total += amount
              current.count++
              categoryMap.set(fullCategory.name, current)
            }
          })
        }
      }

      const topCategories = Array.from(categoryMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)

      // Garder toutes les dépenses triées pour le calendrier
      const recentExpenses = allExpenses
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      const activeGroups = userGroups
        .filter(g => g.expenses && g.expenses.length > 0)
        .sort((a, b) => (b.expenses?.length || 0) - (a.expenses?.length || 0))
        .slice(0, 3)

      setStats({
        totalGroups: userGroups.length,
        totalExpenses,
        totalSpent,
        recentExpenses, // Toutes les dépenses pour le calendrier
        topCategories,
        activeGroups,
      })
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      if (showLoader) {
        setLoading(false)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount)
    return `${formatted} DT`
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  // Afficher le loader pendant l'hydratation
  if (!isHydrated || loading) {
    return (
      <Container className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </Container>
    )
  }

  return (
    <div className="min-h-screen">
      <Container>
        {/* En-tête simple */}
        <div className="mb-8 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {getGreeting()}, <span className="text-emerald-600">{user?.username || user?.name.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-lg text-gray-600">
                Voici ton activité en un coup d'œil
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium">Exporter</span>
              </button>
              <button
                onClick={() => loadStats(true)}
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
            </div>
          </div>
        </div>

      {/* Statistiques principales avec animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="group border border-gray-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '0ms' }}>
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Mes Groupes</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">{stats.totalGroups}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border border-gray-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Dépenses</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">{stats.totalExpenses}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border border-gray-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Payé</p>
                <p className="text-2xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border border-gray-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Moyenne</p>
                <p className="text-2xl font-bold text-orange-600 group-hover:scale-110 transition-transform duration-300">
                  {formatCurrency(stats.totalExpenses > 0 ? stats.totalSpent / stats.totalExpenses : 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top catégories avec barre de progression */}
        <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">Top Catégories</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {stats.topCategories.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucune catégorie pour le moment</p>
            ) : (
              <div className="space-y-6">
                {stats.topCategories.map((category, index) => {
                  const percentage = stats.totalSpent > 0 ? (category.total / stats.totalSpent) * 100 : 0
                  // Utiliser userBudgetLimit (budget personnel) au lieu de budgetLimit
                  const budgetLimit = category.userBudgetLimit || 0
                  const budgetPercentage = budgetLimit > 0 ? (category.total / budgetLimit) * 100 : null
                  const isOverBudget = budgetLimit > 0 && category.total > budgetLimit
                  const isNearLimit = budgetLimit > 0 && budgetPercentage && budgetPercentage >= 80 && !isOverBudget
                  
                  return (
                    <div key={index} className="group">
                      {/* Header avec icon, nom et montant */}
                      <div className="flex items-center gap-4 mb-3">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {category.icon}
                        </div>
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <div>
                            <h4 className="text-base font-bold text-gray-900 truncate">
                              {category.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {category.count} dépense{category.count > 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-orange-600' : ''}`} style={!isOverBudget && !isNearLimit ? { color: category.color } : {}}>
                              {formatCurrency(category.total)}
                            </p>
                            {budgetLimit > 0 && budgetPercentage !== null ? (
                              <p className={`text-xs font-semibold mt-0.5 ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-500'}`}>
                                {budgetPercentage.toFixed(0)}% de {formatCurrency(budgetLimit)}
                              </p>
                            ) : percentage > 0 ? (
                              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                                {percentage.toFixed(0)}% du total
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400 mt-0.5">
                                Pas de limite
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Barre de progression avec limite budgétaire */}
                      {budgetLimit > 0 && budgetPercentage !== null ? (
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner relative">
                            <div 
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{ 
                                width: `${Math.min(budgetPercentage, 100)}%`,
                                backgroundColor: isOverBudget ? '#dc2626' : isNearLimit ? '#ea580c' : category.color
                              }}
                            />
                          </div>
                          {isOverBudget && (
                            <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Limite dépassée de {formatCurrency(category.total - budgetLimit)}
                            </div>
                          )}
                          {isNearLimit && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Proche de la limite ({formatCurrency(budgetLimit - category.total)} restant)
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: category.color
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendrier des dépenses */}
        <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Calendrier des Dépenses</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() + currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).slice(1)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                    setSelectedDate(null)
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Mois précédent"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setCurrentMonth(new Date())
                    setSelectedDate(null)
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => {
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                    setSelectedDate(null)
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Mois suivant"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="p-2 rounded-lg hover:bg-emerald-100 transition-colors bg-emerald-50"
                    title="Chercher une date"
                  >
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  {showDatePicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowDatePicker(false)}
                      />
                      <div className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900">Chercher une date</h3>
                          <button
                            onClick={() => setShowDatePicker(false)}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Mois</label>
                            <select
                              value={currentMonth.getMonth()}
                              onChange={(e) => {
                                setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))
                                setSelectedDate(null)
                              }}
                              className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
                            >
                              {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((m, i) => (
                                <option key={i} value={i}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Année</label>
                            <select
                              value={currentMonth.getFullYear()}
                              onChange={(e) => {
                                setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))
                                setSelectedDate(null)
                              }}
                              className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
                            >
                              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => {
                              setShowDatePicker(false)
                            }}
                            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Appliquer
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {(() => {
              const now = new Date()
              const year = currentMonth.getFullYear()
              const month = currentMonth.getMonth()
              
              // Premier jour du mois et dernier jour
              const firstDay = new Date(year, month, 1)
              const lastDay = new Date(year, month + 1, 0).getDate()
              const startDayOfWeek = firstDay.getDay() // 0 = dimanche
              
              // Calculer les dépenses par jour (toutes les dépenses où l'utilisateur participe)
              const dailyExpenses: { [key: number]: number } = {}
              
              console.log('📅 Calcul du calendrier:', {
                totalExpenses: stats.recentExpenses.length,
                month,
                year,
                userId: user?.id
              })
              
              stats.recentExpenses.forEach((expense: any) => {
                // Vérifier si l'utilisateur est participant
                const isParticipant = expense.participants?.some((p: any) => p.id === user?.id)
                if (isParticipant) {
                  const expenseDate = new Date(expense.date || expense.createdAt)
                  const expenseMonth = expenseDate.getMonth()
                  const expenseYear = expenseDate.getFullYear()
                  const day = expenseDate.getDate()
                  
                  if (expenseMonth === month && expenseYear === year) {
                    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
                    dailyExpenses[day] = (dailyExpenses[day] || 0) + amount
                    
                    console.log(`  ✓ Jour ${day}: +${amount} DT (total: ${dailyExpenses[day]} DT)`)
                  }
                }
              })
              
              console.log('📊 Dépenses par jour:', dailyExpenses)
              
              // Jours de la semaine
              const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
              
              // Créer le calendrier
              const calendarDays = []
              
              // Ajouter les jours vides au début
              for (let i = 0; i < startDayOfWeek; i++) {
                calendarDays.push(null)
              }
              
              // Ajouter tous les jours du mois
              for (let day = 1; day <= lastDay; day++) {
                calendarDays.push(day)
              }
              
              // Fonction simple : vert si dépense, gris sinon
              const getDayColor = (amount: number) => {
                if (amount > 0) {
                  // Il y a une dépense → Vert
                  return { bg: 'bg-emerald-500', text: 'text-white', hover: 'hover:bg-emerald-600' }
                } else {
                  // Pas de dépense → Gris
                  return { bg: 'bg-gray-50', text: 'text-gray-400', hover: 'hover:bg-gray-100' }
                }
              }
              
              return (
                <div>
                  {/* En-têtes des jours */}
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Grille du calendrier */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                      if (day === null) {
                        return <div key={`empty-${index}`} className="aspect-square" />
                      }
                      
                      const hasExpense = dailyExpenses[day] > 0
                      const isToday = day === now.getDate() && 
                        month === now.getMonth() && 
                        year === now.getFullYear()
                      const amount = dailyExpenses[day] || 0
                      
                      const isSelected = selectedDate && 
                        selectedDate.getDate() === day && 
                        selectedDate.getMonth() === month && 
                        selectedDate.getFullYear() === year
                      
                      const colors = getDayColor(amount)
                      
                      return (
                        <div
                          key={day}
                          onClick={() => {
                            const clickedDate = new Date(year, month, day)
                            setSelectedDate(isSelected ? null : clickedDate)
                          }}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all duration-300 cursor-pointer relative ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300 scale-105'
                              : isToday
                              ? `${colors.bg} ${colors.text} shadow-lg ring-2 ring-emerald-400 animate-pulse ${colors.hover}`
                              : `${colors.bg} ${colors.text} ${colors.hover} hover:shadow-md hover:scale-105`
                          }`}
                          title={hasExpense ? formatCurrency(amount) : 'Aucune dépense'}
                        >
                          <span className={`${isToday || isSelected ? 'text-base font-bold' : ''} relative z-10`}>{day}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Légende simple */}
                  <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-gray-50 border-2 border-gray-200" />
                      <span className="text-sm text-gray-600 font-medium">Aucune dépense</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-500" />
                      <span className="text-sm text-gray-600 font-medium">Avec dépense</span>
                    </div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Dépenses récentes */}
      <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Activité Récente</CardTitle>
              {selectedDate ? (
                <p className="text-sm text-blue-600 mt-1">
                  {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  Aujourd'hui
                </p>
              )}
            </div>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Aujourd'hui
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {(() => {
            const today = new Date()
            // Filtrer les dépenses par date sélectionnée ou aujourd'hui
            const filteredExpenses = selectedDate
              ? stats.recentExpenses.filter((expense) => {
                  const expenseDate = new Date(expense.date)
                  return (
                    expenseDate.getDate() === selectedDate.getDate() &&
                    expenseDate.getMonth() === selectedDate.getMonth() &&
                    expenseDate.getFullYear() === selectedDate.getFullYear()
                  )
                })
              : stats.recentExpenses.filter((expense) => {
                  const expenseDate = new Date(expense.date)
                  return (
                    expenseDate.getDate() === today.getDate() &&
                    expenseDate.getMonth() === today.getMonth() &&
                    expenseDate.getFullYear() === today.getFullYear()
                  )
                })

            return filteredExpenses.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {selectedDate ? 'Aucune dépense ce jour-là' : 'Aucune dépense récente'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => {
                  const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
                  const isPaidByUser = expense.paidBy?.id === user?.id

                  return (
                    <div key={expense.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: expense.category?.color + '20' || '#f3f4f6' }}>
                        {expense.category?.icon || '💰'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{expense.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {expense.group?.name} • {new Date(expense.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isPaidByUser ? 'text-emerald-600' : 'text-gray-900'}`}>
                          {isPaidByUser && '+'}{formatCurrency(amount)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {isPaidByUser ? 'Toi' : `@${expense.paidBy?.username || expense.paidBy?.name.split(' ')[0]}`}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </CardContent>
      </Card>
      </Container>

      {/* Modal de rapport */}
      {user && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          userData={{
            name: user.name,
            username: user.username || '',
            email: user.email,
          }}
          stats={stats}
        />
      )}
    </div>
  )
}
