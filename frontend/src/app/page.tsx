'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: '👥',
      title: 'Groupes illimités',
      description: 'Créez autant de groupes que vous voulez pour vos différents cercles',
      color: 'from-emerald-400 to-teal-500',
      delay: '0ms'
    },
    {
      icon: '💰',
      title: 'Suivi en temps réel',
      description: 'Visualisez instantanément qui doit quoi à qui',
      color: 'from-blue-400 to-cyan-500',
      delay: '100ms'
    },
    {
      icon: '⚡',
      title: 'Calculs automatiques',
      description: 'Fini les prises de tête, on calcule tout pour vous',
      color: 'from-purple-400 to-pink-500',
      delay: '200ms'
    },
    {
      icon: '🎯',
      title: 'Interface intuitive',
      description: 'Simple et rapide, même votre grand-mère peut l\'utiliser',
      color: 'from-orange-400 to-red-500',
      delay: '300ms'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl"
          style={{
            top: '10%',
            left: `${20 + mousePosition.x * 0.01}%`,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-teal-300/20 rounded-full blur-3xl"
          style={{
            bottom: '10%',
            right: `${20 + mousePosition.y * 0.01}%`,
            transition: 'all 0.3s ease-out'
          }}
        />
      </div>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="text-center max-w-5xl mx-auto mb-24">
          {/* Badge animé */}
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-200 rounded-full text-sm font-semibold text-emerald-700 shadow-lg animate-bounce">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            100% Gratuit • Sans pub • Open Source
          </div>

          {/* Titre principal avec effet gradient animé */}
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            Partagez vos
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                dépenses
              </span>
              <svg className="absolute -bottom-4 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10C50 2 100 2 150 6C200 10 250 10 298 6" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br />
            sans prise de tête
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            L'app qui rend le partage de frais aussi simple qu'un jeu d'enfant. 
            <span className="font-semibold text-emerald-600"> Fini les calculs compliqués !</span>
          </p>

          {/* CTA Buttons avec animations */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/auth/register">
              <Button size="lg" className="group relative w-full sm:w-auto text-lg px-10 py-7 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-2xl shadow-emerald-500/30 overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  Commencer gratuitement
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="group w-full sm:w-auto text-lg px-10 py-7 border-2 border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/50 relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative">Se connecter</span>
              </Button>
            </Link>
          </div>

          {/* Valeurs clés */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium">100% Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium">Rapide & Simple</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Gratuit</span>
            </div>
          </div>
        </div>

        {/* Features Grid avec animations au scroll */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-24">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group relative p-6 border-2 hover:border-emerald-300 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
              style={{ animationDelay: feature.delay }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="text-5xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>

              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          ))}
        </div>

        {/* CTA Final */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Prêt à simplifier vos finances ?
              </h2>
              <p className="text-xl text-emerald-50 mb-8">
                Commencez dès maintenant et dites adieu aux calculs compliqués
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 text-lg px-10 py-7 shadow-xl">
                  Créer mon compte gratuitement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-20 border-t border-gray-200 relative z-10">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">© 2025 MiniSplit</p>
          <p className="text-sm mt-2">Fait avec 💚 pour simplifier vos finances de groupe</p>
        </div>
      </footer>
    </div>
  )
}
