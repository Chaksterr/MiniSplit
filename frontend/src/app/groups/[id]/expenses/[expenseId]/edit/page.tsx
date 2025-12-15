'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { expensesApi, categoriesApi, groupMembersApi, api, Category, GroupMember, Expense } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function EditExpensePage() {
  const params = useParams()
  const router = useRouter()
  const groupId = Number(params.id)
  const expenseId = Number(params.expenseId)
  const user = useAuthStore((state) => state.user)
  
  const [expense, setExpense] = useState<Expense | null>(null)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [paidById, setPaidById] = useState<number>(0)
  const [participantIds, setParticipantIds] = useState<number[]>([])
  const [attachments, setAttachments] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<string[]>([])
  
  const [categories, setCategories] = useState<Category[]>([])
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [expenseId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [expenseData, categoriesData, membersData] = await Promise.all([
        expensesApi.getById(expenseId),
        categoriesApi.getAll(),
        groupMembersApi.getMembers(groupId),
      ])
      
      setExpense(expenseData)
      setTitle(expenseData.title)
      setAmount(expenseData.amount.toString())
      setDate(new Date(expenseData.date).toISOString().split('T')[0])
      setNotes(expenseData.notes || '')
      setCategoryId(expenseData.category?.id)
      setPaidById(expenseData.paidBy.id)
      setParticipantIds(expenseData.participants.map(p => p.id))
      setExistingAttachments(expenseData.attachments || [])
      
      setCategories(categoriesData)
      setMembers(membersData)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      setError('Erreur lors du chargement de la dépense')
    } finally {
      setLoading(false)
    }
  }

  const toggleParticipant = (userId: number) => {
    setParticipantIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const removeExistingAttachment = async (filename: string) => {
    if (!confirm('Supprimer ce fichier ?')) return
    
    try {
      await api.delete(`/expenses/${expenseId}/attachments/${filename}`)
      setExistingAttachments(prev => prev.filter(f => f !== filename))
    } catch (error) {
      console.error('Erreur suppression fichier:', error)
      alert('Erreur lors de la suppression du fichier')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (participantIds.length === 0) {
      setError('Veuillez sélectionner au moins un participant')
      return
    }

    setSaving(true)

    try {
      await expensesApi.update(expenseId, {
        title,
        amount: parseFloat(amount),
        description: notes,
        date: new Date(date).toISOString(),
        paidBy: paidById,
        categoryId: categoryId,
        participants: participantIds,
      })
      
      // Upload des nouveaux fichiers si présents
      if (attachments.length > 0) {
        const formData = new FormData()
        attachments.forEach(file => {
          formData.append('files', file)
        })
        
        try {
          await api.post(`/expenses/${expenseId}/attachments`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
        } catch (uploadError) {
          console.error('Erreur upload fichiers:', uploadError)
        }
      }
      
      router.push(`/groups/${groupId}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      await expensesApi.delete(expenseId)
      // Marquer qu'il faut recharger la page Home
      if (typeof window !== 'undefined') {
        localStorage.setItem('homeNeedsRefresh', 'true')
      }
      router.push(`/groups/${groupId}?refresh=${Date.now()}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">Dépense introuvable</p>
            <Button asChild>
              <Link href={`/groups/${groupId}`}>Retour au groupe</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Link href={`/groups/${groupId}`} className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au groupe
          </Link>
        </div>

        <Card className="border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-gray-900">Modifier la dépense</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Titre <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-14 text-base rounded-xl border-2"
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="h-14 text-base rounded-xl border-2"
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
                    className="h-14 text-base rounded-xl border-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Catégorie
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
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {categoryId && (() => {
                    const selectedCat = categories.find(c => c.id === categoryId)
                    return selectedCat && (
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                        <span className="text-2xl">{selectedCat.icon}</span>
                      </div>
                    )
                  })()}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Participants <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 max-h-64 overflow-y-auto">
                  {members.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">Aucun membre</p>
                  ) : (
                    <div className="space-y-2">
                      {members.map(member => (
                        <label key={member.userId} className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2.5 rounded-md transition-colors">
                          <input
                            type="checkbox"
                            checked={participantIds.includes(member.userId)}
                            onChange={() => toggleParticipant(member.userId)}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {member.user?.name || `User ${member.userId}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  placeholder="Ajoutez des notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="rounded-xl border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                />
              </div>

              {/* Fichiers existants */}
              {existingAttachments.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Fichiers actuels
                  </label>
                  <div className="space-y-2">
                    {existingAttachments.map((filename, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{filename}</p>
                            <a 
                              href={`http://localhost:3001/uploads/expenses/${filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Voir le fichier
                            </a>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingAttachment(filename)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nouveaux fichiers */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ajouter des fichiers
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
                  <label htmlFor="attachments" className="flex flex-col items-center justify-center cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Cliquez pour ajouter</span>
                  </label>
                </div>
                
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
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

            <CardFooter className="flex justify-between gap-3 bg-gray-50 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDelete}
                disabled={deleting || saving}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Suppression...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </>
                )}
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/groups/${groupId}`}>Annuler</Link>
                </Button>
                <Button type="submit" disabled={saving || deleting} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
