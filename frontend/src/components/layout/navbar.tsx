'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Logo } from '@/components/logo'
import { useAuthStore } from '@/lib/store'
import { usersApi } from '@/lib/api'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const isActive = (path: string) => pathname === path

  // Cacher la navbar sur les pages d'authentification
  if (pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full py-4 bg-transparent">
      <div className="container mx-auto px-6">
        <div 
          className={`flex items-center justify-between px-6 py-3 rounded-3xl transition-all duration-300 ${
            scrolled 
              ? 'bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200/50' 
              : 'bg-white/90 backdrop-blur-lg shadow-lg border border-gray-100/50'
          }`}
        >
          {/* Logo */}
          <Link 
            href={isAuthenticated ? '/home' : '/'} 
            className="flex items-center gap-3 hover:scale-105 transition-transform"
          >
            <Logo size="md" />
          </Link>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Navigation moderne avec indicateur glissant */}
                <div className="hidden md:flex items-center gap-1 bg-gray-50/80 backdrop-blur-sm rounded-2xl p-1.5 relative">
                  {/* Indicateur glissant */}
                  <div 
                    className={`absolute top-1.5 bottom-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-md transition-all duration-300 ease-out ${
                      pathname === '/home' ? 'left-1.5 w-[72px]' :
                      pathname === '/groups' ? 'left-[calc(72px+0.25rem+0.375rem)] w-[90px]' :
                      pathname === '/categories' ? 'left-[calc(162px+0.5rem+0.75rem)] w-[108px]' :
                      'left-1.5 w-[72px]'
                    }`}
                  />
                  
                  <Link href="/home" className="relative z-10">
                    <div 
                      className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-200 whitespace-nowrap ${
                        isActive('/home') 
                          ? 'text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span>Home</span>
                    </div>
                  </Link>
                  
                  <Link href="/groups" className="relative z-10">
                    <div 
                      className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-200 whitespace-nowrap ${
                        isActive('/groups') 
                          ? 'text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span>Groupes</span>
                    </div>
                  </Link>

                  <Link href="/categories" className="relative z-10">
                    <div 
                      className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-200 whitespace-nowrap ${
                        isActive('/categories') 
                          ? 'text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span>Catégories</span>
                    </div>
                  </Link>
                </div>
              
              {/* Avatar moderne avec effet glassmorphism */}
              <DropdownMenu
                trigger={
                  <div className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm hover:from-emerald-50/80 hover:to-teal-50/80 transition-all duration-300 cursor-pointer border border-gray-200/50 hover:border-emerald-200 hover:shadow-lg hover:scale-105">
                    {user?.avatar ? (
                      <div className="relative w-10 h-10 rounded-full ring-2 ring-white shadow-md overflow-hidden group-hover:ring-emerald-200 transition-all duration-300">
                        <Image 
                          src={usersApi.getAvatarUrl(user.avatar)}
                          alt={user.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                          priority
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow duration-300">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300 leading-tight">
                        {user?.name}
                      </span>
                      <span className="text-xs text-gray-500 group-hover:text-emerald-500 transition-colors duration-300 leading-tight">
                        @{user?.username || 'username'}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 hidden sm:block group-hover:text-emerald-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                }
              >
                <div className="px-5 py-4 bg-gradient-to-br from-emerald-50 to-teal-50">
                  <div className="flex items-center gap-3">
                    {user?.avatar ? (
                      <div className="relative w-12 h-12 rounded-full ring-2 ring-white shadow-sm overflow-hidden">
                        <Image 
                          src={usersApi.getAvatarUrl(user.avatar)}
                          alt={user.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                          priority
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-emerald-600 font-medium truncate mt-0.5">@{user?.username}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                  >
                    Mon Profil
                  </DropdownMenuItem>
                </div>
                
                <DropdownMenuSeparator />
                
                <div className="py-2">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    variant="danger"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    }
                  >
                    Déconnexion
                  </DropdownMenuItem>
                </div>
              </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <button className="px-6 py-2.5 rounded-xl font-semibold text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 backdrop-blur-sm transition-all duration-300">
                    Connexion
                  </button>
                </Link>
                <Link href="/auth/register">
                  <button className="group relative px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative">Inscription</span>
                  </button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
