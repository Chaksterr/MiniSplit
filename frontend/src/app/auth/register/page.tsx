'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La photo ne doit pas dépasser 5 MB')
        return
      }
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      const response = await authApi.register(name, username, email, password)
      
      // Login d'abord pour avoir le token
      login(response.user, response.access_token)
      
      // Upload avatar si présent
      if (avatar) {
        try {
          const formData = new FormData()
          formData.append('avatar', avatar)
          const avatarResponse = await fetch(`http://localhost:3001/users/${response.user.id}/avatar`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${response.access_token}`
            },
            body: formData
          })
          
          if (avatarResponse.ok) {
            const avatarData = await avatarResponse.json()
            // Récupérer les données utilisateur mises à jour
            const userResponse = await fetch(`http://localhost:3001/users/${response.user.id}`, {
              headers: {
                'Authorization': `Bearer ${response.access_token}`
              }
            })
            
            if (userResponse.ok) {
              const updatedUser = await userResponse.json()
              // Mettre à jour le store avec les nouvelles données
              login(updatedUser, response.access_token)
            }
          }
        } catch (avatarErr) {
          console.error('Erreur upload avatar:', avatarErr)
        }
      }
      
      router.push('/home')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Register Form */}
      <motion.div 
        className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white order-1 relative"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.22, 1, 0.36, 1],
          delay: 0.05
        }}
      >
        {/* Bouton retour à l'accueil */}
        <Link 
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">Accueil</span>
        </Link>

        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">💰</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">MiniSplit</h1>
            </div>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Créer un compte</h2>
            <p className="text-lg text-gray-600">Commencez à partager vos dépenses</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="space-y-4">
              {/* Photo de profil */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Photo de profil (optionnel)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Preview" 
                        className="w-20 h-20 rounded-full object-cover border-4 border-emerald-100"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-gray-100">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-sm">
                      Choisir une photo
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatar(null)
                        setAvatarPreview(null)
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG ou GIF. Max 5 MB</p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="jeandupont"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Utilisé pour vous ajouter facilement dans les groupes</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Répétez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </span>
              ) : (
                'Créer mon compte'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Déjà inscrit ?</span>
              </div>
            </div>

            <Link href="/auth/login">
              <Button 
                type="button"
                variant="outline"
                className="w-full h-14 text-base font-semibold rounded-xl border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300"
              >
                Se connecter
              </Button>
            </Link>
          </form>
        </div>
      </motion.div>

      {/* Right Side - Animation */}
      <motion.div 
        className="lg:w-1/2 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 relative overflow-hidden flex flex-col items-center justify-center p-8 lg:p-16 order-2"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.22, 1, 0.36, 1],
          delay: 0.1
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center h-full">
          <div className="relative">
            {/* Speech bubble */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white rounded-3xl px-8 py-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              </div>
              <p className="text-gray-800 font-bold text-xl whitespace-nowrap">
                Partagez vos dépenses facilement ! 💸
              </p>
              {/* Tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white rotate-45"></div>
            </div>

            {/* Large character illustration */}
            <div className="relative w-96 h-96 flex items-center justify-center animate-in zoom-in duration-500">
              <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                <g transform="translate(100, 120)">
                  {/* Floating animation */}
                  <animateTransform attributeName="transform" type="translate" values="100,120; 100,115; 100,120" dur="3s" repeatCount="indefinite"/>
                  
                  {/* Shadow */}
                  <ellipse cx="0" cy="95" rx="35" ry="8" fill="rgba(0,0,0,0.15)">
                    <animate attributeName="opacity" values="0.15;0.1;0.15" dur="3s" repeatCount="indefinite"/>
                  </ellipse>
                  
                  {/* Body */}
                  <ellipse cx="0" cy="35" rx="28" ry="35" fill="#27AE60"/>
                  
                  {/* Arms waving */}
                  <g>
                    <line x1="-28" y1="25" x2="-42" y2="35" stroke="#FFD4A3" strokeWidth="12" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="rotate" values="0 -28 25; -15 -28 25; 0 -28 25" dur="2s" repeatCount="indefinite"/>
                    </line>
                    <circle cx="-42" cy="35" r="7" fill="#FFD4A3">
                      <animateTransform attributeName="transform" type="translate" values="0,0; 2,-3; 0,0" dur="2s" repeatCount="indefinite"/>
                    </circle>
                  </g>
                  
                  <g>
                    <line x1="28" y1="25" x2="42" y2="35" stroke="#FFD4A3" strokeWidth="12" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="rotate" values="0 28 25; 15 28 25; 0 28 25" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                    </line>
                    <circle cx="42" cy="35" r="7" fill="#FFD4A3">
                      <animateTransform attributeName="transform" type="translate" values="0,0; -2,-3; 0,0" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                    </circle>
                  </g>
                  
                  {/* Neck */}
                  <rect x="-8" y="5" width="16" height="12" fill="#FFD4A3" rx="3"/>
                  
                  {/* Head */}
                  <circle cx="0" cy="-10" r="30" fill="#FFD4A3" filter="url(#glow)"/>
                  
                  {/* Hair */}
                  <ellipse cx="0" cy="-25" rx="32" ry="20" fill="#E67E22"/>
                  <ellipse cx="-8" cy="-30" rx="14" ry="16" fill="#D35400"/>
                  <ellipse cx="8" cy="-30" rx="14" ry="16" fill="#D35400"/>
                  
                  {/* Eyes */}
                  <circle cx="-10" cy="-12" r="5" fill="#333"/>
                  <circle cx="-9" cy="-13" r="2" fill="white"/>
                  <circle cx="10" cy="-12" r="5" fill="#333"/>
                  <circle cx="11" cy="-13" r="2" fill="white"/>
                  
                  {/* Cheeks */}
                  <circle cx="-20" cy="-5" r="6" fill="#FF9999" opacity="0.6"/>
                  <circle cx="20" cy="-5" r="6" fill="#FF9999" opacity="0.6"/>
                  
                  {/* Big smile */}
                  <path d="M -12 -2 Q 0 8 12 -2" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  
                  {/* Legs */}
                  <rect x="-16" y="68" width="32" height="38" fill="#4A90E2" rx="4"/>
                  <line x1="0" y1="72" x2="0" y2="102" stroke="#3A7BC8" strokeWidth="2"/>
                  
                  {/* Shoes */}
                  <ellipse cx="-8" cy="106" rx="10" ry="5" fill="#2C3E50"/>
                  <ellipse cx="8" cy="106" rx="10" ry="5" fill="#2C3E50"/>
                </g>
              </svg>
            </div>
          </div>


        </div>
      </motion.div>
    </div>
  )
}
