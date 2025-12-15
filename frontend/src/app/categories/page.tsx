'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { categoriesApi, Category } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function CategoriesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [budgetLimit, setBudgetLimit] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categoryStats, setCategoryStats] = useState<{[key: number]: {
    total: number
    byGroup: {[groupId: number]: {name: string, amount: number}}
    thisMonth: number
    lastMonth: number
  }}>({})

  useEffect(() => {
    // Attendre l'hydratation du store avant toute vérification
    const checkAuthWhenHydrated = () => {
      const state = useAuthStore.getState()
      
      if (!state._hasHydrated) {
        return
      }
      
      setIsHydrated(true)
      
      if (!state.isAuthenticated || !state.user) {
        router.push('/auth/login')
      } else {
        loadCategories()
      }
    }
    
    const unsubscribe = useAuthStore.subscribe(checkAuthWhenHydrated)
    checkAuthWhenHydrated()
    
    return () => unsubscribe()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const [categoriesData, expensesData] = await Promise.all([
        categoriesApi.getAllWithBudgets(),  // Utiliser getAllWithBudgets pour récupérer les budgets personnels
        (async () => {
          const { expensesApi } = await import('@/lib/api')
          return expensesApi.getAll()
        })()
      ])
      
      setCategories(categoriesData)
      
      // Calculer les statistiques par catégorie
      const stats: any = {}
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      
      expensesData.forEach(expense => {
        // Filtrer seulement les dépenses de l'utilisateur connecté
        if (!expense.participants.some(p => p.id === user?.id)) return
        
        const catId = expense.category?.id
        if (!catId) return
        
        if (!stats[catId]) {
          stats[catId] = {
            total: 0,
            byGroup: {},
            thisMonth: 0,
            lastMonth: 0
          }
        }
        
        const expenseDate = new Date(expense.date)
        const userShare = expense.amount / expense.participants.length
        
        stats[catId].total += userShare
        
        // Par groupe
        const groupId = expense.group.id
        const groupName = expense.group.name
        if (!stats[catId].byGroup[groupId]) {
          stats[catId].byGroup[groupId] = { name: groupName, amount: 0 }
        }
        stats[catId].byGroup[groupId].amount += userShare
        
        // Ce mois
        if (expenseDate >= thisMonthStart) {
          stats[catId].thisMonth += userShare
        }
        
        // Mois dernier
        if (expenseDate >= lastMonthStart && expenseDate <= lastMonthEnd) {
          stats[catId].lastMonth += userShare
        }
      })
      
      setCategoryStats(stats)
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBudget = async (categoryId: number) => {
    try {
      setError('')
      setSuccess('')
      const limit = budgetLimit ? parseFloat(budgetLimit) : null
      
      if (limit === null || limit === 0) {
        // Supprimer le budget personnel
        await categoriesApi.deleteUserBudget(categoryId)
        setSuccess('Budget personnel réinitialisé avec succès !')
      } else {
        // Définir/mettre à jour le budget personnel
        await categoriesApi.setUserBudget(categoryId, limit)
        setSuccess('Limite budgétaire personnelle mise à jour avec succès !')
      }
      
      setEditingId(null)
      setBudgetLimit('')
      loadCategories()
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error)
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour')
    }
  }

  const handleResetBudget = async (categoryId: number) => {
    try {
      setError('')
      setSuccess('')
      await categoriesApi.deleteUserBudget(categoryId)
      setSuccess('Budget réinitialisé aux limites par défaut (sans limites) !')
      loadCategories()
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation:', error)
      setError(error.response?.data?.message || 'Erreur lors de la réinitialisation')
    }
  }

  const startEditing = (category: Category) => {
    setEditingId(category.id)
    // Utiliser userBudgetLimit (budget personnel) au lieu de budgetLimit
    setBudgetLimit(category.userBudgetLimit?.toString() || '')
  }

  if (!isHydrated || loading) {
    return (
      <Container className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </Container>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50">
      <Container>
        <div className="mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Catégories de Dépenses
          </h1>
          <p className="text-lg text-gray-600">
            Définissez des limites budgétaires pour chaque catégorie
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900">Catégories communes</p>
              <p className="text-sm text-blue-700 mt-1">
                Ces catégories sont partagées par tous les utilisateurs pour faciliter l'organisation et le suivi des dépenses.
              </p>
            </div>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-900">Mes Catégories</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {categories.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucune catégorie disponible</p>
            ) : (
              <div className="space-y-6">
                {categories.map((category) => {
                  const stats = categoryStats[category.id] || { total: 0, byGroup: {}, thisMonth: 0, lastMonth: 0 }
                  // Utiliser userBudgetLimit (budget personnel) au lieu de budgetLimit
                  const limit = category.userBudgetLimit ? Number(category.userBudgetLimit) : null
                  const percentage = limit && limit > 0 ? (stats.total / limit) * 100 : null
                  const trend = stats.lastMonth > 0 ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100 : 0
                  const groups = Object.values(stats.byGroup)
                  
                  return (
                    <div
                      key={category.id}
                      className="p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all"
                    >
                      {/* En-tête */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md"
                            style={{ backgroundColor: `${category.color}30` }}
                          >
                            {category.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-2xl font-bold text-emerald-600">
                                {stats.total.toFixed(3)} DT
                              </p>
                              {trend !== 0 && (
                                <span className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {trend > 0 ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                    </svg>
                                  )}
                                  {Math.abs(trend).toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {editingId === category.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={budgetLimit}
                              onChange={(e) => setBudgetLimit(e.target.value)}
                              placeholder="Limite (DT)"
                              className="w-32 px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            <button
                              onClick={() => handleUpdateBudget(category.id)}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                              title="Enregistrer"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setBudgetLimit('')
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                              title="Annuler"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditing(category)}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                            >
                              {limit ? '✏️ Modifier limite' : '+ Définir limite'}
                            </button>
                            {limit && (
                              <button
                                onClick={() => {
                                  if (confirm('Voulez-vous vraiment réinitialiser le budget de cette catégorie ?')) {
                                    handleResetBudget(category.id)
                                  }
                                }}
                                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors font-medium text-sm"
                                title="Réinitialiser aux limites par défaut (sans limites)"
                              >
                                🔄 Reset
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Barre de progression avec segments par groupe */}
                      {limit && limit > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Budget utilisé</span>
                            <span className={`text-sm font-bold ${percentage && percentage >= 100 ? 'text-red-600' : percentage && percentage >= 80 ? 'text-orange-600' : 'text-emerald-600'}`}>
                              {percentage ? percentage.toFixed(0) : 0}%
                            </span>
                          </div>
                          <div className="h-8 bg-gray-200 rounded-full overflow-hidden flex">
                            {groups.length > 0 ? (
                              groups.map((group, idx) => {
                                const groupPercentage = (group.amount / limit) * 100
                                const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                                return (
                                  <div
                                    key={idx}
                                    className="h-full flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80"
                                    style={{
                                      width: `${groupPercentage}%`,
                                      backgroundColor: colors[idx % colors.length]
                                    }}
                                    title={`${group.name}: ${group.amount.toFixed(3)} DT`}
                                  >
                                    {groupPercentage > 10 && group.amount.toFixed(3)}
                                  </div>
                                )
                              })
                            ) : (
                              <div className="h-full w-0 bg-emerald-500"></div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-600">
                              {stats.total.toFixed(3)} / {limit.toFixed(3)} DT
                            </span>
                            {limit - stats.total > 0 ? (
                              <span className="text-xs text-emerald-600 font-medium">
                                Restant: {(limit - stats.total).toFixed(3)} DT
                              </span>
                            ) : (
                              <span className="text-xs text-red-600 font-bold">
                                Dépassement: {(stats.total - limit).toFixed(3)} DT
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Message pour indiquer qu'aucune limite n'est définie */}
                      {!limit && stats.total > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <p className="text-sm text-blue-700">
                            💡 Aucune limite budgétaire définie. Définissez une limite pour suivre vos dépenses.
                          </p>
                        </div>
                      )}

                      {/* Légende des groupes */}
                      {groups.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {groups.map((group, idx) => {
                            const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                            return (
                              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: colors[idx % colors.length] }}
                                />
                                <span className="text-xs font-medium text-gray-700">
                                  {group.name}: {group.amount.toFixed(3)} DT
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Statistiques mensuelles */}
                      {(stats.thisMonth > 0 || stats.lastMonth > 0) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4">
                          <div className="flex-1 bg-blue-50 rounded-xl p-3">
                            <p className="text-xs text-blue-600 font-medium mb-1">Ce mois</p>
                            <p className="text-lg font-bold text-blue-900">{stats.thisMonth.toFixed(3)} DT</p>
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 font-medium mb-1">Mois dernier</p>
                            <p className="text-lg font-bold text-gray-900">{stats.lastMonth.toFixed(3)} DT</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}
