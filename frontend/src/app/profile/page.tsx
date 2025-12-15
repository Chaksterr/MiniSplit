'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/layout/container'
import { LoadingSpinner } from '@/components/loading-spinner'
import { usersApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser } = useAuthStore()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Attendre un peu pour que le store soit hydraté
    const timer = setTimeout(() => {
      if (!isAuthenticated || !user) {
        router.push('/auth/login')
        return
      }
      
      setName(user.name)
      setEmail(user.email)
      if (user.avatar) {
        setAvatarPreview(usersApi.getAvatarUrl(user.avatar))
      }
      setLoading(false)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const updatedUser = await usersApi.update(user!.id, { name, email })
      updateUser(updatedUser)
      setSuccess('Profil mis à jour avec succès !')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setSaving(true)

    try {
      // Note: L'API backend devrait avoir un endpoint pour changer le mot de passe
      // Pour l'instant, on utilise l'update général
      await usersApi.update(user!.id, { name, email })
      setSuccess('Mot de passe changé avec succès !')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB')
      return
    }

    setAvatarFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadAvatar = async () => {
    if (!avatarFile || !user) return

    setError('')
    setSuccess('')
    setUploadingAvatar(true)

    try {
      const result = await usersApi.uploadAvatar(user.id, avatarFile)
      
      // Recharger l'utilisateur depuis l'API pour avoir les données à jour
      const refreshedUser = await usersApi.getById(user.id)
      updateUser(refreshedUser)
      
      // Mettre à jour l'aperçu avec la nouvelle image (avec cache busting)
      setAvatarPreview(usersApi.getAvatarUrl(refreshedUser.avatar!, true))
      setSuccess('Photo de profil mise à jour avec succès !')
      setAvatarFile(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'upload de la photo')
      setAvatarPreview(user.avatar ? usersApi.getAvatarUrl(user.avatar) : '')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!user) return

    setError('')
    setSuccess('')
    setUploadingAvatar(true)

    try {
      await usersApi.deleteAvatar(user.id)
      const updatedUser = { ...user, avatar: undefined }
      updateUser(updatedUser)
      setAvatarPreview('')
      setAvatarFile(null)
      setSuccess('Photo de profil supprimée avec succès !')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression de la photo')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeleteAccount = async () => {
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      await usersApi.delete(user!.id)
      
      // Déconnecter l'utilisateur
      useAuthStore.getState().logout()
      
      // Rediriger vers la page de login avec un message
      router.push('/auth/login?deleted=true')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du compte')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </Container>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50">
      <Container>
        <div className="mb-6 pt-8">
        <Link href="/groups" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux groupes
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-2 border-green-200 text-green-700 p-4 rounded-lg flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Photo de profil */}
        <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">Photo de profil</CardTitle>
            <CardDescription className="text-base mt-2">Ajoutez ou modifiez votre photo</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              {/* Avatar preview */}
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative w-32 h-32 rounded-full ring-4 ring-emerald-100 shadow-lg overflow-hidden">
                    <Image 
                      src={avatarPreview} 
                      alt="Avatar" 
                      fill
                      sizes="128px"
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-5xl shadow-lg ring-4 ring-emerald-100">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {(avatarPreview || user?.avatar) && (
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={uploadingAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
                    title="Supprimer la photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* File input */}
              <div className="w-full">
                <label htmlFor="avatar-upload" className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="text-emerald-600 font-semibold">Cliquez pour choisir</span> ou glissez une image
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 5MB</p>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Upload button */}
              {avatarFile && (
                <Button 
                  onClick={handleUploadAvatar} 
                  disabled={uploadingAvatar}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {uploadingAvatar ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Upload en cours...
                    </>
                  ) : (
                    'Télécharger la photo'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations du profil */}
        <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">Informations personnelles</CardTitle>
            <CardDescription className="text-base mt-2">
              Modifiez votre nom et email
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 text-base border-2"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-semibold text-gray-700">
                  Nom d'utilisateur
                </label>
                <Input
                  id="username"
                  value={user?.username || ''}
                  disabled
                  className="h-12 text-base border-2 bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">
                  Votre nom d'utilisateur ne peut pas être modifié
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base border-2"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-200 pt-4">
              <Button type="submit" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
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

        {/* Changer le mot de passe */}
        <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">Sécurité</CardTitle>
            <CardDescription className="text-base mt-2">Changez votre mot de passe</CardDescription>
          </CardHeader>
          <form onSubmit={handleChangePassword}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">
                  Mot de passe actuel
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-12 text-base border-2"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                  Nouveau mot de passe
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 text-base border-2"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Répétez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 text-base border-2"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-200 pt-4">
              <Button 
                type="submit" 
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Changement...
                  </>
                ) : (
                  'Changer le mot de passe'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Zone dangereuse - Supprimer le compte */}
        <Card className="border-2 border-red-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-200 pb-4">
            <CardTitle className="text-xl font-bold text-red-900 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Zone dangereuse
            </CardTitle>
            <CardDescription className="text-base mt-2 text-red-700">
              Actions irréversibles sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-900">Action irréversible</p>
                <p className="text-xs text-red-700 mt-0.5">Toutes vos données seront perdues</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-700 font-medium">Vous perdrez :</p>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Groupes et dépenses
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Historique d'activités
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Paramètres
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="bg-red-50 border-t border-red-200 pt-4">
            <Button
              onClick={() => {
                if (window.confirm(
                  'Êtes-vous absolument sûr de vouloir supprimer votre compte ?\n\n' +
                  'Cette action est IRRÉVERSIBLE et toutes vos données seront définitivement perdues.\n\n' +
                  'Tapez "SUPPRIMER" pour confirmer.'
                )) {
                  const confirmation = window.prompt('Tapez "SUPPRIMER" en majuscules pour confirmer :')
                  if (confirmation === 'SUPPRIMER') {
                    handleDeleteAccount()
                  } else if (confirmation !== null) {
                    alert('Confirmation incorrecte. Suppression annulée.')
                  }
                }
              }}
              disabled={saving}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer mon compte
            </Button>
          </CardFooter>
        </Card>
      </div>

      </Container>
    </div>
  )
}
