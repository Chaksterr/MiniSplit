'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/layout/container'
import { LoadingSpinner } from '@/components/loading-spinner'
import { groupsApi, Group } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function GroupSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const groupId = Number(params.id)
  
  const [group, setGroup] = useState<Group | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    loadGroup()
  }, [groupId, isAuthenticated, router])

  const loadGroup = async () => {
    try {
      const groupData = await groupsApi.getById(groupId)
      setGroup(groupData)
      setName(groupData.name)
      setDescription(groupData.description || '')
    } catch (err: any) {
      setError('Erreur lors du chargement du groupe')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      await groupsApi.update(groupId, { name, description })
      setSuccess('Groupe mis à jour avec succès !')
      await loadGroup()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible.')) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      await groupsApi.delete(groupId)
      router.push('/groups')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Container className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </Container>
    )
  }

  if (!group) {
    return (
      <Container>
        <Card className="border border-gray-200">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">Groupe introuvable</p>
            <Button asChild>
              <Link href="/groups">Retour aux groupes</Link>
            </Button>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <Container>
      <div className="mb-6">
        <Link href={`/groups/${groupId}`} className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour au groupe
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres du groupe</h1>
        <p className="text-gray-600">{group.name}</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Modifier le groupe */}
        <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pb-6">
            <CardTitle className="text-xl font-bold text-gray-900">Modifier les informations</CardTitle>
            <CardDescription className="text-base mt-2">Changez le nom ou la description du groupe</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdate}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nom du groupe <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description <span className="text-gray-400">(optionnel)</span>
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-200">
              <Button type="submit" disabled={saving} className="w-full">
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
            </CardFooter>
          </form>
        </Card>

        {/* Zone de danger */}
        <Card className="border border-red-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 pb-6">
            <CardTitle className="text-xl font-bold text-red-700">Zone de danger</CardTitle>
            <CardDescription className="text-base mt-2">Actions irréversibles</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">Supprimer le groupe</h3>
                <p className="text-sm text-red-700 mb-4">
                  Cette action supprimera définitivement le groupe, toutes les dépenses et l'historique. Cette action ne peut pas être annulée.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full"
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
                    'Supprimer définitivement'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
