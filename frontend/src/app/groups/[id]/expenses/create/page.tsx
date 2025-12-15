'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { expensesApi, categoriesApi, groupMembersApi, Category, GroupMember } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function CreateExpensePage() {
  const params = useParams()
  const router = useRouter()
  const groupId = Number(params.id)
  const user = useAuthStore((state) => state.user)
  
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [paidById, setPaidById] = useState<number>(user?.id || 0)
  const [participantIds, setParticipantIds] = useState<number[]>([])
  const [splitType, setSplitType] = useState('equal')
  const [attachments, setAttachments] = useState<File[]>([])
  
  const [categories, setCategories] = useState<Category[]>([])
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categoryExpenses, setCategoryExpenses] = useState<{ [key: number]: number }>({})

  useEffect(() => {
    loadData()
  }, [groupId])

  const loadData = async () => {
    try {
      const [categoriesData, membersData] = await Promise.all([
        categoriesApi.getAll(),
        groupMembersApi.getMembers(groupId),
      ])
      setCategories(categoriesData)
      setMembers(membersData)
      
      // Calculer les dépenses par catégorie pour l'utilisateur
      const expensesMap: { [key: number]: number } = {}
      // On va récupérer les dépenses via l'API des groupes
      const { groupsApi } = await import('@/lib/api')
      const groups = await groupsApi.getAll()
      const userGroups = groups.filter(group => 
        group.memberships?.some(membership => membership.userId === user?.id)
      )
      
      userGroups.forEach(group => {
        if (group.expenses) {
          group.expenses.forEach((expense: any) => {
            if (expense.paidBy?.id === user?.id && expense.category?.id) {
              const catId = expense.category.id
              const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
              expensesMap[catId] = (expensesMap[catId] || 0) + amount
            }
          })
        }
      })
      
      setCategoryExpenses(expensesMap)
      setCategories(categoriesData)
      setMembers(membersData)
      
      // Sélectionner tous les membres par défaut
      const memberIds = membersData.map(m => m.userId).filter(id => id != null)
      setParticipantIds(memberIds)
      
      // Si l'utilisateur connecté est membre, le sélectionner comme payeur par défaut
      if (user?.id && memberIds.includes(user.id)) {
        setPaidById(user.id)
      } else if (memberIds.length > 0) {
        // Sinon, sélectionner le premier membre
        setPaidById(memberIds[0])
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      setError('Erreur lors du chargement des données')
    }
  }

  const toggleParticipant = (userId: number) => {
    setParticipantIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (participantIds.length === 0) {
      setError('Veuillez sélectionner au moins un participant')
      return
    }

    // Vérifier la limite budgétaire si une catégorie est sélectionnée
    if (categoryId) {
      const selectedCategory = categories.find(c => c.id === categoryId)
      // Utiliser userBudgetLimit (budget personnel) au lieu de budgetLimit
      if (selectedCategory?.userBudgetLimit) {
        const currentTotal = categoryExpenses[categoryId] || 0
        const newAmount = parseFloat(amount)
        const newTotal = currentTotal + newAmount
        
        if (newTotal > selectedCategory.userBudgetLimit) {
          const remaining = selectedCategory.userBudgetLimit - currentTotal
          setError(
            `Limite budgétaire personnelle dépassée pour "${selectedCategory.name}". ` +
            `Limite: ${Number(selectedCategory.userBudgetLimit).toFixed(3)} DT, ` +
            `Dépensé: ${currentTotal.toFixed(3)} DT, ` +
            `Restant: ${remaining.toFixed(3)} DT`
          )
          setLoading(false)
          return
        }
      }
    }

    setLoading(true)

    try {
      const expense = await expensesApi.create({
        title,
        amount: parseFloat(amount),
        paidById,
        groupId,
        categoryId,
        date: new Date(date),
        participantIds,
        splitType,
        notes,
      })
      
      // Upload des fichiers si présents
      if (attachments && attachments.length > 0) {
        const formData = new FormData()
        attachments.forEach(file => {
          formData.append('files', file)
        })
        
        // Vérifier que le FormData contient bien des fichiers
        const hasFiles = formData.has('files')
        
        if (hasFiles) {
          try {
            const { api } = await import('@/lib/api')
            await api.post(`/expenses/${expense.id}/attachments`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            })
          } catch (uploadError: any) {
            console.error('Erreur upload fichiers:', uploadError)
            console.error('Détails:', uploadError.response?.data)
            // Continue même si l'upload échoue
          }
        }
      }
      
      // Marquer qu'il faut recharger la page Home
      if (typeof window !== 'undefined') {
        localStorage.setItem('homeNeedsRefresh', 'true')
      }
      
      // Redirection avec rechargement forcé
      router.push(`/groups/${groupId}?refresh=${Date.now()}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la dépense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/groups/${groupId}`} className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour au groupe
        </Link>
      </div>

      <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pb-6">
          <CardTitle className="text-xl font-bold text-gray-900">Ajouter une dépense</CardTitle>
          <CardDescription className="text-base mt-2">
            Enregistrez une nouvelle dépense pour ce groupe
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm font-medium flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                placeholder="Ex: Restaurant, Courses, Essence..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Montant (DT) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="paidBy" className="text-sm font-medium text-gray-700">
                Payé par <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="paidBy"
                  className="flex h-14 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium appearance-none cursor-pointer hover:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                  value={paidById || ''}
                  onChange={(e) => setPaidById(Number(e.target.value))}
                  required
                  style={{ 
                    backgroundImage: 'none',
                    paddingRight: '3rem'
                  }}
                >
                  <option value="" disabled>Sélectionnez qui a payé...</option>
                  {members.map(member => (
                    <option key={member.userId} value={member.userId}>
                      {member.user?.name || `User ${member.userId}`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500">La personne qui a avancé l'argent</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-gray-700">
                Catégorie <span className="text-gray-400">(optionnel)</span>
              </label>
              <div className="relative">
                <select
                  id="category"
                  className="flex h-14 w-full rounded-xl border-2 border-gray-200 bg-white py-3 text-base font-medium appearance-none cursor-pointer hover:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                  style={{ 
                    backgroundImage: 'none',
                    paddingLeft: categoryId ? '3.5rem' : '1rem',
                    paddingRight: '3rem'
                  }}
                >
                  <option value="" className="text-gray-500">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option 
                      key={category.id} 
                      value={category.id}
                      className="py-2"
                    >
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                {/* Icône flèche personnalisée */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {/* Affichage de la catégorie sélectionnée avec icône */}
                {categoryId && (() => {
                  const selectedCat = categories.find(c => c.id === categoryId)
                  return selectedCat && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                      <span className="text-2xl">{selectedCat.icon}</span>
                    </div>
                  )
                })()}
              </div>
              {categoryId && (() => {
                const selectedCat = categories.find(c => c.id === categoryId)
                // Utiliser userBudgetLimit (budget personnel) au lieu de budgetLimit
                if (selectedCat?.userBudgetLimit) {
                  const spent = categoryExpenses[categoryId] || 0
                  const limit = Number(selectedCat.userBudgetLimit)
                  const remaining = limit - spent
                  const percentage = (spent / limit) * 100
                  
                  return (
                    <div className="mt-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">Budget utilisé</span>
                        <span className={`text-xs font-bold ${percentage >= 100 ? 'text-red-600' : percentage >= 80 ? 'text-orange-600' : 'text-emerald-600'}`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: percentage >= 100 ? '#dc2626' : percentage >= 80 ? '#ea580c' : '#10b981'
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        Dépensé: <span className="font-semibold">{spent.toFixed(3)} DT</span> / 
                        Limite: <span className="font-semibold">{limit.toFixed(3)} DT</span>
                        {remaining > 0 && (
                          <span className="ml-2 text-emerald-600">
                            (Restant: {remaining.toFixed(3)} DT)
                          </span>
                        )}
                        {remaining <= 0 && (
                          <span className="ml-2 text-red-600 font-semibold">
                            (Limite atteinte)
                          </span>
                        )}
                      </p>
                    </div>
                  )
                }
                return null
              })()}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Participants <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-64 overflow-y-auto">
                {members.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">Aucun membre dans ce groupe</p>
                ) : (
                  <div className="space-y-2">
                    {members.map(member => (
                      <label key={member.userId} className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2.5 rounded-md transition-colors border border-transparent hover:border-emerald-200">
                        <input
                          type="checkbox"
                          checked={participantIds.includes(member.userId)}
                          onChange={() => toggleParticipant(member.userId)}
                          className="w-4 h-4 text-emerald-600 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {(member.user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{member.user?.name || `User ${member.userId}`}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Sélectionnez les personnes qui partagent cette dépense</span>
                <span className="font-medium">{participantIds.length} sélectionné{participantIds.length > 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="splitType" className="text-sm font-medium text-gray-700">
                Type de répartition
              </label>
              <div className="relative">
                <select
                  id="splitType"
                  className="flex h-14 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium appearance-none cursor-pointer hover:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value)}
                  style={{ 
                    backgroundImage: 'none',
                    paddingRight: '3rem'
                  }}
                >
                  <option value="equal">Égale (divisé équitablement)</option>
                  <option value="custom">Personnalisée</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Notes <span className="text-gray-400">(optionnel)</span>
              </label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes supplémentaires..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="rounded-xl border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
              />
            </div>

            {/* Upload de fichiers */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Photos / Factures <span className="text-gray-400">(optionnel)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-emerald-400 transition-colors">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    if (e.target.files) {
                      setAttachments(Array.from(e.target.files))
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="attachments"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 mb-1">
                    Cliquez pour ajouter des fichiers
                  </span>
                  <span className="text-xs text-gray-500">
                    JPG, PNG ou PDF (max 5MB par fichier)
                  </span>
                </label>
              </div>
              
              {/* Prévisualisation des fichiers */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          {file.type.startsWith('image/') ? (
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 bg-gray-50 border-t border-gray-200 mt-6">
            <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
              <Link href={`/groups/${groupId}`}>Annuler</Link>
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </>
              ) : (
                'Créer la dépense'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
