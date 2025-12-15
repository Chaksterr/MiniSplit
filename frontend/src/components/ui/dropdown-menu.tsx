'use client'

import { useState, useRef, useEffect } from 'react'

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
}

export function DropdownMenu({ trigger, children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownMenuItemProps {
  onClick?: () => void
  icon?: React.ReactNode
  children: React.ReactNode
  variant?: 'default' | 'danger'
}

export function DropdownMenuItem({ onClick, icon, children, variant = 'default' }: DropdownMenuItemProps) {
  const baseClasses = "w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-150 group"
  const variantClasses = variant === 'danger' 
    ? "text-red-600 hover:bg-red-50 hover:text-red-700" 
    : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      {icon && <span className="flex-shrink-0 transition-transform duration-150 group-hover:scale-110">{icon}</span>}
      <span className="font-medium text-sm">{children}</span>
    </button>
  )
}

interface DropdownMenuSeparatorProps {}

export function DropdownMenuSeparator({}: DropdownMenuSeparatorProps) {
  return <div className="my-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
}
