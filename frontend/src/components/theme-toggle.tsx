'use client'

import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 dark:from-indigo-600 dark:to-purple-600 transition-all duration-500 flex items-center shadow-lg shadow-amber-500/30 dark:shadow-indigo-500/30 group active:scale-95 overflow-hidden"
      aria-label="Toggle theme"
    >
      {/* Fond animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/40 to-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      {/* Bouton glissant */}
      <div className={`absolute w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 flex items-center justify-center ${
        theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
      }`}>
        {/* Icône soleil */}
        <svg
          className={`w-4 h-4 text-amber-500 transition-all duration-500 ${
            theme === 'dark' ? 'rotate-180 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>

        {/* Icône lune */}
        <svg
          className={`absolute w-4 h-4 text-indigo-600 transition-all duration-500 ${
            theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-180 scale-0 opacity-0'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>
      
      {/* Étoiles décoratives en mode dark */}
      {theme === 'dark' && (
        <>
          <div className="absolute left-2 top-2 w-1 h-1 bg-white rounded-full animate-pulse" />
          <div className="absolute left-3 top-5 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-100" />
        </>
      )}
    </button>
  )
}
