'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'

export default function TestStoragePage() {
  const [logs, setLogs] = useState<string[]>([])
  const { user, token, isAuthenticated, _hasHydrated } = useAuthStore()

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addLog('Component mounted')
    addLog(`hasHydrated: ${_hasHydrated}`)
    addLog(`isAuthenticated: ${isAuthenticated}`)
    addLog(`user: ${user ? user.name : 'null'}`)
    addLog(`token: ${token ? token.substring(0, 20) + '...' : 'null'}`)
    
    // Vérifier localStorage
    const authStorage = localStorage.getItem('auth-storage')
    addLog(`localStorage auth-storage: ${authStorage ? 'exists' : 'null'}`)
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage)
        addLog(`Parsed storage: ${JSON.stringify(parsed, null, 2)}`)
      } catch (e) {
        addLog(`Error parsing: ${e}`)
      }
    }
  }, [_hasHydrated, isAuthenticated, user, token])

  const testSave = () => {
    const testUser = { id: 999, name: 'Test User', email: 'test@test.com' }
    const testToken = 'test-token-123456789'
    useAuthStore.getState().login(testUser, testToken)
    addLog('Test data saved to store')
    
    setTimeout(() => {
      const storage = localStorage.getItem('auth-storage')
      addLog(`After save - localStorage: ${storage}`)
    }, 500)
  }

  const clearStorage = () => {
    localStorage.removeItem('auth-storage')
    useAuthStore.getState().logout()
    addLog('Storage cleared')
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Storage Debug</h1>
      
      <div className="mb-4 space-x-2">
        <button 
          onClick={testSave}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Test Save
        </button>
        <button 
          onClick={clearStorage}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Clear Storage
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Reload Page
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Current State:</h2>
        <pre className="text-sm">
          hasHydrated: {String(_hasHydrated)}{'\n'}
          isAuthenticated: {String(isAuthenticated)}{'\n'}
          user: {user ? user.name : 'null'}{'\n'}
          token: {token ? token.substring(0, 30) + '...' : 'null'}
        </pre>
      </div>

      <div className="mt-4 bg-white border p-4 rounded">
        <h2 className="font-bold mb-2">Logs:</h2>
        <div className="space-y-1 text-sm font-mono">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
