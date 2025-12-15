import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'DT'): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount)
  return `${formatted} ${currency}`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Fonction pour calculer le total des dépenses de manière sûre
export function calculateTotal(expenses: any[]): number {
  if (!expenses || !Array.isArray(expenses)) return 0
  
  return expenses.reduce((sum, exp) => {
    if (!exp || !exp.amount) return sum
    
    const amount = typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount
    
    // Vérifier que c'est un nombre valide
    if (isNaN(amount) || !isFinite(amount)) return sum
    
    return sum + amount
  }, 0)
}
