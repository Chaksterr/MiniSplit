'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/layout/container'
import { api, groupMembersApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function JoinGroupPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [groupInfo, setGroupInfo] = useState<any>(null)

  const handleSearchGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setGroupInfo(null)
    setLoading(true)

    try {
      // Rechercher le groupe par code
      const response = await api.get(`/groups/code/${code.toUpperCase()}`)
      setGroupInfo(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Groupe introuvable avec ce code')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!groupInfo || !user) return

    setLoading(true)
    setError('')

    try {
      // Vérifier si l'utilisateur est déjà membre
      const isMember = groupInfo.memberships?.some((m: any) => m.userId === user.id)
      
      if (isMember) {
        setError('Vous êtes déjà membre de ce groupe')
        setLoading(false)
        return
      }

      // Ajouter l'utilisateur au groupe
      await groupMembersApi.addMember(groupInfo.id, user.id)
      
      // Rediriger vers le groupe
      router.push(`/groups/${groupInfo.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la tentative de rejoindre le groupe')
    } finally {
      setLoading(false)
    }
  }

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

        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Rejoindre un groupe</h1>
            <p className="text-lg text-gray-600">Entrez le code du groupe pour le rejoindre</p>
          </div>

          <Card className="border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-900">Code du groupe</CardTitle>
              <CardDescription className="text-base mt-2">
                Le code est composé de 8 caractères (ex: ABC12345)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSearchGroup} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-in slide-in-from-left-2">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                    Code du groupe <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="ABC12345"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    maxLength={8}
                    className="h-14 text-lg font-mono text-center rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all uppercase"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Demandez le code à l'administrateur du groupe
                  </p>
                </div>

                {!groupInfo && (
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all"
                    disabled={loading || code.length !== 8}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Recherche...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Rechercher le groupe
                      </span>
                    )}
                  </Button>
                )}
              </form>

              {groupInfo && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {groupInfo.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{groupInfo.name}</h3>
                        {groupInfo.description && (
                          <p className="text-gray-600 mb-3">{groupInfo.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {groupInfo.memberships?.length || 0} membre(s)
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {groupInfo.expenses?.length || 0} dépense(s)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setGroupInfo(null)
                        setCode('')
                        setError('')
                      }}
                      className="flex-1 h-12 rounded-xl border-2"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleJoinGroup}
                      disabled={loading}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Rejoindre...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Rejoindre le groupe
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}
