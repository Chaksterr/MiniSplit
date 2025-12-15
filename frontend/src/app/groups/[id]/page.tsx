'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { groupsApi, expensesApi, balancesApi, activitiesApi, Group, Expense, Balance, Activity } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/layout/container'
import { LoadingSpinner } from '@/components/loading-spinner'
import { formatCurrency, formatDate, formatDateTime, calculateTotal } from '@/lib/utils'

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const groupId = parseInt(params.id as string)
  
  const [group, setGroup] = useState<Group | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [settlementPlan, setSettlementPlan] = useState<any[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showOptimizedPlan, setShowOptimizedPlan] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Premier chargement avec spinner
    loadGroupData(loading)
    
    // Nettoyer le paramètre refresh de l'URL
    if (typeof window !== 'undefined' && window.location.search.includes('refresh')) {
      window.history.replaceState({}, '', `/groups/${groupId}`)
    }
  }, [groupId, isAuthenticated, router])
  
  // Recharger quand la page redevient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        loadGroupData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [groupId, isAuthenticated])

  const loadGroupData = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true)
      }
      console.log('Chargement des données du groupe:', groupId)
      
      const [groupData, expensesData, balancesData, activitiesData] = await Promise.all([
        groupsApi.getById(groupId).catch(err => {
          console.error('Erreur groupe:', err)
          throw err
        }),
        expensesApi.getByGroup(groupId).catch(err => {
          console.error('Erreur dépenses:', err)
          return []
        }),
        balancesApi.getGroupBalances(groupId).catch(err => {
          console.error('Erreur balances:', err)
          return []
        }),
        activitiesApi.getByGroup(groupId).catch(err => {
          console.error('Erreur activités:', err)
          return []
        }),
      ])

      console.log('Données chargées:', { groupData, expensesData, balancesData, activitiesData })

      setGroup(groupData)
      setExpenses(expensesData || [])
      // balancesData contient maintenant { balances: [...], settlementPlan: [...] }
      setBalances(balancesData?.balances || [])
      setSettlementPlan(balancesData?.settlementPlan || [])
      setActivities(activitiesData || [])
      setError('')
    } catch (err: any) {
      console.error('Erreur complète:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données')
    } finally {
      if (showLoader) {
        setLoading(false)
      }
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <Container className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </Container>
    )
  }

  if (error || !group) {
    return (
      <Container className="flex justify-center items-center min-h-[60vh]">
        <Card className="max-w-md border-2">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4 font-medium">{error || 'Groupe introuvable'}</p>
            <Button asChild>
              <Link href="/groups">Retour aux groupes</Link>
            </Button>
          </CardContent>
        </Card>
      </Container>
    )
  }

  const totalExpenses = calculateTotal(expenses)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50">
      <Container>
        <div className="mb-6 pt-8">
        <Link href="/groups" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux groupes
        </Link>
      </div>

      {/* En-tête du groupe - Design moderne */}
      <div className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-gray-200 rounded-2xl p-8 mb-8 overflow-hidden">
        {/* Motif décoratif subtil */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-100 rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-gray-900 tracking-tight">{group.name}</h1>
            {group.description && (
              <p className="text-gray-600 text-lg mb-4">{group.description}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Code du groupe avec copie */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-full border border-teal-200">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-teal-700 font-mono">{group.code}</span>
                <button
                  onClick={() => {
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
                  className="p-1.5 hover:bg-teal-200 rounded-lg transition-colors group/copy"
                  title="Copier le code"
                >
                  <svg className="w-4 h-4 text-teal-600 group-hover/copy:text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              
              <Link href={`/groups/${groupId}/members`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer group">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{group.memberships?.length || 0} membre{(group.memberships?.length || 0) > 1 ? 's' : ''}</span>
                </div>
              </Link>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">{expenses.length} dépense{expenses.length > 1 ? 's' : ''}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-500/30">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-white/80">Total dépensé</span>
                  <span className="text-sm font-bold text-white">{formatCurrency(totalExpenses)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => loadGroupData(true)}
              disabled={loading}
              size="lg" 
              variant="outline" 
              className="border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
            >
              <svg 
                className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
              <Link href={`/groups/${groupId}/members`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Membres
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
              <Link href={`/groups/${groupId}/settings`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Paramètres
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all">
              <Link href={`/groups/${groupId}/expenses/create`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle dépense
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-100 p-1 mb-6">
          <TabsTrigger 
            value="expenses" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Dépenses
          </TabsTrigger>
          <TabsTrigger 
            value="balances"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Soldes
          </TabsTrigger>
          <TabsTrigger 
            value="activity"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Activité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Dépenses du groupe</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Total dépensé: <span className="font-bold text-emerald-600 text-lg">{formatCurrency(totalExpenses)}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4 font-medium">Aucune dépense enregistrée</p>
                  <Button asChild>
                    <Link href={`/groups/${groupId}/expenses/create`}>
                      Ajouter la première dépense
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div 
                      key={expense.id} 
                      className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      {/* Indicateur de couleur selon la catégorie */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl" />
                      
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Icône de catégorie */}
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {expense.category?.icon || '💰'}
                          </div>
                          
                          {/* Informations de la dépense */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">{expense.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(expense.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                @{expense.paidBy?.username || expense.paidBy?.name}
                              </span>
                              {expense.category?.name && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                  {expense.category.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Montant et actions */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-600">
                              {formatCurrency(expense.amount)}
                            </div>
                          </div>
                          <Link href={`/groups/${groupId}/expenses/${expense.id}/edit`}>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-emerald-50 rounded-lg">
                              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances">
          <Card className="border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    {showOptimizedPlan ? 'Plan de Remboursement Optimisé' : 'Soldes du Groupe'}
                  </CardTitle>
                  <CardDescription className="text-emerald-100 mt-2">
                    {showOptimizedPlan ? 'Transactions minimales pour équilibrer les comptes' : 'Vue d\'ensemble des équilibres financiers'}
                  </CardDescription>
                </div>
                
                {/* Bouton pour basculer */}
                {balances.length > 0 && balances.some(b => Math.abs(b.balance) > 0.001) && (
                  <button
                    onClick={() => setShowOptimizedPlan(!showOptimizedPlan)}
                    className="flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all shadow-lg hover:shadow-xl border border-white/30"
                  >
                    {showOptimizedPlan ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-semibold">Voir Soldes</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-semibold">Plan Optimisé</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-white">
              {balances.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-semibold text-lg mb-2">Tous les comptes sont équilibrés !</p>
                  <p className="text-gray-500">Aucun solde à afficher</p>
                </div>
              ) : showOptimizedPlan ? (
                // Plan de remboursement optimisé
                (() => {
                  if (settlementPlan.length === 0) {
                    return (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-emerald-700 font-semibold text-lg">Tous les comptes sont équilibrés !</p>
                        <p className="text-emerald-600 text-sm mt-1">Aucun remboursement nécessaire</p>
                      </div>
                    );
                  }
                  
                  const isAdmin = group?.memberships?.some(m => m.userId === useAuthStore.getState().user?.id && m.role === 'admin');
                  const creditors = balances.filter(b => b.balance > 0.001);
                  const debtors = balances.filter(b => b.balance < -0.001);
                  const maxPossible = creditors.length * debtors.length;
                  
                  return (
                    <div className="space-y-5">
                      {/* Statistiques */}
                      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-5 border-2 border-emerald-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-emerald-900 font-bold text-lg">Optimisation Réussie</p>
                              <p className="text-emerald-700 text-sm">
                                <span className="font-bold text-2xl">{settlementPlan.length}</span> transaction{settlementPlan.length > 1 ? 's' : ''} au lieu de <span className="font-bold">{maxPossible}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-black text-emerald-600">
                              {Math.round((1 - settlementPlan.length / maxPossible) * 100)}%
                            </div>
                            <p className="text-xs text-emerald-700 font-semibold">Réduction</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Transactions */}
                      {settlementPlan.filter(t => t.from && t.to && t.amount).map((transaction, index) => {
                        const fromAvatarUrl = transaction.fromPhoto ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/avatars/${transaction.fromPhoto}` : null
                        const toAvatarUrl = transaction.toPhoto ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/avatars/${transaction.toPhoto}` : null
                        
                        return (
                        <div key={index} className="group bg-white rounded-xl p-5 border-2 border-emerald-200 hover:border-emerald-400 transition-all shadow-md hover:shadow-lg">
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-6 flex-1">
                              {/* De */}
                              <div className="flex items-center gap-3">
                                {fromAvatarUrl ? (
                                  <img 
                                    src={fromAvatarUrl} 
                                    alt={transaction.from}
                                    className="w-12 h-12 rounded-full object-cover shadow-md ring-2 ring-red-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                    {transaction.from?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-gray-900 block">{transaction.from || 'Inconnu'}</span>
                                  <span className="text-xs text-red-600 font-medium">Doit payer</span>
                                </div>
                              </div>
                              
                              {/* Flèche */}
                              <div className="flex items-center px-3">
                                <svg className="w-6 h-6 text-emerald-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </div>
                              
                              {/* Vers */}
                              <div className="flex items-center gap-3">
                                {toAvatarUrl ? (
                                  <img 
                                    src={toAvatarUrl} 
                                    alt={transaction.to}
                                    className="w-12 h-12 rounded-full object-cover shadow-md ring-2 ring-green-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                    {transaction.to?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-gray-900 block">{transaction.to || 'Inconnu'}</span>
                                  <span className="text-xs text-green-600 font-medium">Va recevoir</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Montant et Actions */}
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-3xl font-black text-emerald-600 mb-1">
                                  {formatCurrency(transaction.amount)}
                                </div>
                                <div className="text-xs text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full inline-block">
                                  Transaction #{index + 1}
                                </div>
                              </div>
                              
                              {/* Bouton Admin */}
                              {isAdmin && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Marquer ce paiement de ${formatCurrency(transaction.amount)} comme effectué ?\n\n${transaction.from} → ${transaction.to}`)) {
                                      alert('Fonctionnalité de validation en cours de développement');
                                    }
                                  }}
                                  className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group/btn"
                                  title="Marquer comme payé (Admin uniquement)"
                                >
                                  <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="hidden lg:inline">Valider</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )})}
                      
                      {/* Info */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border-2 border-emerald-200">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-emerald-900 text-lg mb-2">💡 Plan Optimisé Automatiquement</p>
                            <p className="text-emerald-800 text-sm leading-relaxed mb-3">
                              Ce plan minimise le nombre de transactions nécessaires pour équilibrer tous les comptes du groupe. 
                              Au lieu de multiples paiements croisés, nous avons simplifié en <span className="font-bold">{settlementPlan.length} transaction{settlementPlan.length > 1 ? 's' : ''}</span>.
                            </p>
                            {isAdmin && (
                              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-100 px-3 py-2 rounded-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="font-semibold">Vous êtes admin : vous pouvez valider les paiements</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                // Vue normale des soldes
                <div className="grid gap-4">
                  {balances.map((balance) => {
                    const username = balance.user?.username || 'inconnu'
                    const displayName = balance.user?.name || 'Utilisateur inconnu'
                    const userAvatar = balance.user?.profilePhoto || balance.user?.avatar
                    const avatarUrl = userAvatar ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/avatars/${userAvatar}` : null
                    
                    return (
                      <div
                        key={balance.userId}
                        className={`group relative overflow-hidden rounded-xl border-2 p-5 transition-all hover:shadow-lg ${
                          balance.balance >= 0
                            ? 'bg-white border-green-200 hover:border-green-400'
                            : 'bg-white border-red-200 hover:border-red-400'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            {/* Avatar avec photo ou initiale */}
                            {avatarUrl ? (
                              <img 
                                src={avatarUrl} 
                                alt={username}
                                className={`w-14 h-14 rounded-full object-cover shadow-md ring-2 ${
                                  balance.balance >= 0 ? 'ring-green-200' : 'ring-red-200'
                                }`}
                              />
                            ) : (
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-md ${
                                balance.balance >= 0 
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                  : 'bg-gradient-to-br from-red-500 to-orange-600'
                              }`}>
                                {username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            
                            <div>
                              <span className="font-bold text-gray-900 text-lg block">{username}</span>
                              <span className={`text-sm font-medium ${
                                balance.balance >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {balance.balance >= 0 ? '↑ À recevoir' : '↓ À payer'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${
                              balance.balance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(Math.abs(balance.balance))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-900">Activité récente</CardTitle>
              <CardDescription className="text-base">Historique des actions du groupe</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Aucune activité récente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => {
                    // Déterminer l'icône et la couleur selon le type d'action
                    const getActivityStyle = (action: string) => {
                      const actionLower = action.toLowerCase()
                      
                      // Grouper par type d'action
                      if (actionLower.includes('created') || actionLower.includes('added') || actionLower.includes('joined')) {
                        return {
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          ),
                          bgColor: 'bg-green-100',
                          textColor: 'text-green-600',
                          badgeVariant: 'success' as const
                        }
                      } else if (actionLower.includes('updated')) {
                        return {
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          ),
                          bgColor: 'bg-blue-100',
                          textColor: 'text-blue-600',
                          badgeVariant: 'default' as const
                        }
                      } else if (actionLower.includes('deleted') || actionLower.includes('left')) {
                        return {
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          ),
                          bgColor: 'bg-red-100',
                          textColor: 'text-red-600',
                          badgeVariant: 'error' as const
                        }
                      } else {
                        return {
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ),
                          bgColor: 'bg-gray-100',
                          textColor: 'text-gray-600',
                          badgeVariant: 'secondary' as const
                        }
                      }
                    }

                    const style = getActivityStyle(activity.action || activity.actionType || 'unknown')

                    return (
                      <div key={activity.id} className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                        {/* Ligne de temps */}
                        <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-200 group-last:hidden" />
                        
                        <div className="flex items-start gap-4">
                          <div className={`relative z-10 w-12 h-12 ${style.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 ${style.textColor} shadow-sm`}>
                            {style.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <p className="font-semibold text-gray-900">@{activity.user?.username || activity.user?.name || 'Utilisateur'}</p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                style.badgeVariant === 'success' ? 'bg-green-100 text-green-700' :
                                style.badgeVariant === 'error' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {(activity.action || activity.actionType || 'action').replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {activity.entityType || 'Action dans le groupe'}
                              {activity.details && typeof activity.details === 'string' && (
                                <span className="text-gray-500"> • {activity.details}</span>
                              )}
                              {activity.details && typeof activity.details === 'object' && activity.details.message && (
                                <span className="text-gray-500"> • {activity.details.message}</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDateTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </Container>
    </div>
  )
}
