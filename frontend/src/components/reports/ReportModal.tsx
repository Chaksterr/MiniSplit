'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  userData: {
    name: string
    username: string
    email: string
  }
  stats: {
    totalGroups: number
    totalExpenses: number
    totalSpent: number
    recentExpenses: any[]
    topCategories: any[]
  }
}

export function ReportModal({ isOpen, onClose, userData, stats }: ReportModalProps) {
  const [reportType, setReportType] = useState<'monthly' | 'daily'>('monthly')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)

  if (!isOpen) return null

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount)
    return `${formatted} DT`
  }

  const getFilteredExpenses = () => {
    if (reportType === 'daily') {
      const date = new Date(selectedDate)
      return stats.recentExpenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        return (
          expenseDate.getDate() === date.getDate() &&
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getFullYear() === date.getFullYear()
        )
      })
    } else {
      const [year, month] = selectedMonth.split('-').map(Number)
      return stats.recentExpenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        return (
          expenseDate.getMonth() === month - 1 &&
          expenseDate.getFullYear() === year
        )
      })
    }
  }

  const generatePreview = () => {
    const filteredExpenses = getFilteredExpenses()
    
    const totalAmount = filteredExpenses.reduce((sum, exp) => {
      const amount = typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount
      return sum + amount
    }, 0)

    const categoryBreakdown = new Map()
    filteredExpenses.forEach((expense) => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
      const categoryName = expense.category?.name || 'Sans catégorie'
      categoryBreakdown.set(
        categoryName,
        (categoryBreakdown.get(categoryName) || 0) + amount
      )
    })

    setPreviewData({
      expenses: filteredExpenses,
      totalAmount,
      categoryBreakdown: Array.from(categoryBreakdown.entries()).map(([name, amount]) => ({
        name,
        amount,
      })),
    })
    setShowPreview(true)
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    const filteredExpenses = getFilteredExpenses()

    // En-tête
    doc.setFillColor(16, 185, 129)
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text('Rapport de Dépenses', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    const dateText = reportType === 'daily'
      ? new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : new Date(selectedMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    doc.text(dateText, 105, 30, { align: 'center' })

    // Informations utilisateur
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(`Utilisateur: ${userData.name} (@${userData.username})`, 20, 50)
    doc.text(`Email: ${userData.email}`, 20, 56)
    doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, 20, 62)

    // Statistiques globales
    const totalAmount = filteredExpenses.reduce((sum, exp) => {
      const amount = typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount
      return sum + amount
    }, 0)

    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Résumé', 20, 75)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text(`Nombre de dépenses: ${filteredExpenses.length}`, 20, 82)
    doc.text(`Montant total: ${formatCurrency(totalAmount)}`, 20, 88)

    // Tableau des catégories
    const categoryBreakdown = new Map()
    filteredExpenses.forEach((expense) => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
      const categoryName = expense.category?.name || 'Sans catégorie'
      categoryBreakdown.set(
        categoryName,
        (categoryBreakdown.get(categoryName) || 0) + amount
      )
    })

    const categoryData = Array.from(categoryBreakdown.entries()).map(([name, amount]) => [
      name,
      formatCurrency(amount as number),
      `${(((amount as number) / totalAmount) * 100).toFixed(1)}%`,
    ])

    autoTable(doc, {
      startY: 95,
      head: [['Catégorie', 'Montant', 'Pourcentage']],
      body: categoryData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
    })

    // Tableau des dépenses
    const expenseData = filteredExpenses.map((expense) => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
      return [
        new Date(expense.date).toLocaleDateString('fr-FR'),
        expense.title,
        expense.category?.name || 'N/A',
        expense.group?.name || 'N/A',
        formatCurrency(amount),
      ]
    })

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Date', 'Description', 'Catégorie', 'Groupe', 'Montant']],
      body: expenseData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 8 },
    })

    // Pied de page
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Page ${i} sur ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }

    // Télécharger avec nom significatif
    let dateStr = ''
    if (reportType === 'daily') {
      dateStr = new Date(selectedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
    } else {
      const date = new Date(selectedMonth)
      const monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
      dateStr = `${monthNames[date.getMonth()]}_${date.getFullYear()}`
    }
    
    const userName = userData.username.replace(/[^a-zA-Z0-9]/g, '_')
    const reportTypeName = reportType === 'daily' ? 'Journalier' : 'Mensuel'
    const fileName = `Rapport_${reportTypeName}_${userName}_${dateStr}.pdf`
    doc.save(fileName)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Générer un Rapport</h2>
              <p className="text-emerald-100 mt-1">Rapport personnalisé de vos dépenses</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showPreview ? (
            <div className="space-y-6">
              {/* Type de rapport */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Type de rapport
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setReportType('monthly')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      reportType === 'monthly'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        reportType === 'monthly' ? 'bg-emerald-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-6 h-6 ${reportType === 'monthly' ? 'text-emerald-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Mensuel</p>
                        <p className="text-xs text-gray-500">Rapport du mois</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setReportType('daily')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      reportType === 'daily'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        reportType === 'daily' ? 'bg-emerald-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-6 h-6 ${reportType === 'daily' ? 'text-emerald-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Journalier</p>
                        <p className="text-xs text-gray-500">Rapport d'un jour</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sélection de date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {reportType === 'monthly' ? 'Sélectionner le mois' : 'Sélectionner le jour'}
                </label>
                {reportType === 'monthly' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Mois</label>
                      <select
                        value={new Date(selectedMonth).getMonth()}
                        onChange={(e) => {
                          const year = new Date(selectedMonth).getFullYear()
                          const month = String(parseInt(e.target.value) + 1).padStart(2, '0')
                          setSelectedMonth(`${year}-${month}`)
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="0">Janvier</option>
                        <option value="1">Février</option>
                        <option value="2">Mars</option>
                        <option value="3">Avril</option>
                        <option value="4">Mai</option>
                        <option value="5">Juin</option>
                        <option value="6">Juillet</option>
                        <option value="7">Août</option>
                        <option value="8">Septembre</option>
                        <option value="9">Octobre</option>
                        <option value="10">Novembre</option>
                        <option value="11">Décembre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Année</label>
                      <select
                        value={new Date(selectedMonth).getFullYear()}
                        onChange={(e) => {
                          const month = String(new Date(selectedMonth).getMonth() + 1).padStart(2, '0')
                          setSelectedMonth(`${e.target.value}-${month}`)
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                )}
              </div>

              {/* Aperçu rapide */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Période sélectionnée:</span>{' '}
                  {reportType === 'daily'
                    ? new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : new Date(selectedMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Prévisualisation */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Aperçu du Rapport</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Nombre de dépenses</p>
                    <p className="text-2xl font-bold text-emerald-600">{previewData.expenses.length}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Montant total</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(previewData.totalAmount)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Répartition par catégorie</h4>
                  <div className="space-y-2">
                    {previewData.categoryBreakdown.map((cat: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{cat.name}</span>
                        <span className="text-sm font-semibold text-emerald-600">{formatCurrency(cat.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
                  <h4 className="font-semibold text-gray-900 mb-3">Dépenses détaillées</h4>
                  <div className="space-y-2">
                    {previewData.expenses.slice(0, 10).map((expense: any) => {
                      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
                      return (
                        <div key={expense.id} className="flex items-center justify-between text-sm">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{expense.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(expense.date).toLocaleDateString('fr-FR')} • {expense.category?.name}
                            </p>
                          </div>
                          <span className="font-semibold text-emerald-600">{formatCurrency(amount)}</span>
                        </div>
                      )
                    })}
                    {previewData.expenses.length > 10 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        ... et {previewData.expenses.length - 10} autres dépenses
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            {showPreview ? (
              <>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                >
                  ← Retour
                </button>
                <button
                  onClick={generatePDF}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger PDF
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={generatePreview}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Prévisualiser
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
