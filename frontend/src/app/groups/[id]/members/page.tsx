'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { groupsApi, groupMembersApi, usersApi, Group, GroupMember, User } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Container } from '@/components/layout/container'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function GroupMembersPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user: currentUser } = useAuthStore()
  const groupId = parseInt(params.id as string)
  
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    loadData()
  }, [groupId, isAuthenticated, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [groupData, membersData] = await Promise.all([
        groupsApi.getById(groupId),
        groupMembersApi.getMembers(groupId),
      ])

      setGroup(groupData)
      setMembers(membersData)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError('')
    setSearching(true)

    try {
      // Rechercher l'utilisateur par username
      const user = await usersApi.getByUsername(username)
      
      // Vérifier si l'utilisateur est déjà membre
      const alreadyMember = members.some(m => m.userId === user.id)
      if (alreadyMember) {
        setSearchError('Cet utilisateur est déjà membre du groupe')
        setSearching(false)
        return
      }

      // Ajouter le membre
      await groupMembersApi.addMember(groupId, user.id)
      
      // Recharger les données
      await loadData()
      setUsername('')
      setSearchError('')
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'Utilisateur introuvable')
    } finally {
      setSearching(false)
    }
  }

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) {
      return
    }

    try {
      await groupMembersApi.removeMember(groupId, userId)
      await loadData()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression'
      setSearchError(errorMessage)
      // Scroll vers le haut pour voir l'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePromoteToAdmin = async (userId: number, userName: string) => {
    if (!confirm(`Voulez-vous promouvoir ${userName} en administrateur ?`)) {
      return
    }

    try {
      await groupMembersApi.promoteToAdmin(groupId, userId)
      await loadData()
      setSearchError('')
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'Erreur lors de la promotion')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleLeaveGroup = async () => {
    if (!currentUser) return

    // Vérifier s'il y a d'autres admins
    const adminCount = members.filter(m => m.role === 'admin').length
    const isCurrentUserAdmin = members.find(m => m.userId === currentUser.id)?.role === 'admin'
    
    if (isCurrentUserAdmin && adminCount === 1) {
      setSearchError('Vous êtes le seul administrateur. Veuillez promouvoir un autre membre en administrateur avant de quitter le groupe.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!confirm('Êtes-vous sûr de vouloir quitter ce groupe ? Cette action est irréversible.')) {
      return
    }

    try {
      await groupMembersApi.removeMember(groupId, currentUser.id)
      router.push('/groups')
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'Erreur lors de la sortie du groupe')
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
            <p className="text-red-600 mb-4">{error || 'Groupe introuvable'}</p>
            <Button asChild>
              <Link href="/groups">Retour aux groupes</Link>
            </Button>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50">
      <Container>
        <div className="mb-6 pt-8">
          <Link href={`/groups/${groupId}`} className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au groupe
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">{group.name}</h1>
          <p className="text-gray-600 text-lg">Gestion des membres</p>
        </div>

        {/* Bouton pour quitter le groupe */}
        <div className="mb-6">
          <Button
            onClick={handleLeaveGroup}
            variant="outline"
            className="border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Quitter le groupe
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ajouter un membre */}
          <Card className="border border-gray-200 shadow-sm rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-900">Ajouter un membre</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddMember} className="space-y-4">
                {searchError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <p className="text-sm text-red-800">{searchError}</p>
                  </div>
                )}
                
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ex: jeandupont"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Entrez le nom d'utilisateur de la personne à ajouter
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  disabled={searching}
                >
                  {searching ? (
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Liste des membres */}
          <Card className="border border-gray-200 shadow-sm rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Membres ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun membre dans ce groupe</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => {
                    const userName = member.user?.name || 'Utilisateur inconnu'
                    const userInitial = userName.charAt(0).toUpperCase()
                    const isCurrentUser = member.userId === currentUser?.id
                    const isAdmin = member.role === 'admin'
                    
                    return (
                      <div
                        key={member.id}
                        className={`flex items-center justify-between p-4 bg-white border-2 rounded-xl hover:shadow-sm transition-all ${
                          isAdmin ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {member.user?.avatar ? (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/avatars/${member.user.avatar}`}
                              alt={userName}
                              className={`w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ${
                                isAdmin ? 'ring-amber-300' : 'ring-emerald-200'
                              }`}
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                              isAdmin ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                            }`}>
                              {userInitial}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900">
                                {userName}
                              </p>
                              {isCurrentUser && (
                                <span className="text-xs text-emerald-600 font-medium px-2 py-0.5 bg-emerald-100 rounded-full">
                                  Vous
                                </span>
                              )}
                              {isAdmin && (
                                <span className="text-xs text-amber-700 font-bold px-2 py-0.5 bg-amber-200 rounded-full flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              @{member.user?.username || 'unknown'}
                            </p>
                          </div>
                        </div>
                        
                        {isCurrentUser ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLeaveGroup}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Quitter
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            {!isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePromoteToAdmin(member.userId, userName)}
                                className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
                              >
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Promouvoir
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMember(member.userId)}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                              Retirer
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}
