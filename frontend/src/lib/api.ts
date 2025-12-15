import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Récupérer le token depuis le store Zustand persisté
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage)
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`
            console.log('Token found and added to request')
          } else {
            console.log('No token in auth storage')
          }
        } catch (e) {
          console.error('Error parsing auth storage:', e)
        }
      } else {
        console.log('No auth storage found')
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Variable pour éviter les redirections multiples
let isRedirecting = false

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      if (typeof window !== 'undefined') {
        // Ne rediriger que si on n'est pas déjà sur la page de login/register
        const currentPath = window.location.pathname
        if (!currentPath.startsWith('/auth/')) {
          isRedirecting = true
          // Nettoyer le store Zustand
          localStorage.removeItem('auth-storage')
          window.location.href = '/auth/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Types
export interface User {
  id: number
  name: string
  username: string
  email: string
  avatar?: string
}

export interface Group {
  id: number
  name: string
  code: string
  description?: string
  category?: string
  memberships?: GroupMember[]
  expenses?: Expense[]
}

export interface GroupMember {
  id: number
  userId: number
  groupId: number
  role: string
  joinedAt: Date
  user?: User
  group?: Group
}

export interface Category {
  id: number
  name: string
  icon?: string
  color?: string
  budgetLimit?: number | null  // Ancien champ (déprécié)
  userBudgetLimit?: number | null  // Nouveau : budget personnel de l'utilisateur
}

export interface Expense {
  id: number
  title: string
  amount: number
  currency: string
  paidBy: User
  group: Group
  category?: Category
  date: Date
  participants: User[]
  splitType: string
  splitDetails?: any
  notes?: string
  createdAt: Date
}

export interface Balance {
  userId: number
  userName?: string
  paid?: number
  share?: number
  balance: number
  user?: User & { profilePhoto?: string }
}

export interface Settlement {
  id: number
  fromUserId: number
  toUserId: number
  groupId: number
  amount: number
  currency: string
  settledAt?: Date
  createdAt: Date
  fromUser?: User
  toUser?: User
  group?: Group
}

export interface Activity {
  id: number
  groupId: number
  userId: number
  action?: string  // Backend utilise 'action'
  actionType?: string  // Ancien champ pour compatibilité
  entityType: string
  entityId: number
  details?: any
  createdAt: Date
  user?: User
  group?: Group
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  register: async (name: string, username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, username, email, password })
    return response.data
  },
}

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users')
    return response.data
  },
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },
  getByUsername: async (username: string): Promise<User> => {
    const response = await api.get(`/users/username/${username}`)
    return response.data
  },
  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
  uploadAvatar: async (id: number, file: File): Promise<{ message: string; avatar: string; avatarUrl: string }> => {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.post(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  deleteAvatar: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}/avatar`)
    return response.data
  },
  getAvatarUrl: (avatar?: string, bustCache: boolean = false): string => {
    if (!avatar) return ''
    const url = `${API_URL}/uploads/avatars/${avatar}`
    // Ajouter un timestamp seulement si demandé (après upload)
    return bustCache ? `${url}?t=${Date.now()}` : url
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}

// Groups API
export const groupsApi = {
  getAll: async (category?: string): Promise<Group[]> => {
    const params = category ? { category } : {}
    const response = await api.get('/groups', { params })
    return response.data
  },
  getById: async (id: number): Promise<Group> => {
    const response = await api.get(`/groups/${id}`)
    return response.data
  },
  create: async (data: { name: string; description?: string; category?: string }): Promise<Group> => {
    const response = await api.post('/groups', data)
    return response.data
  },
  update: async (id: number, data: Partial<Group>): Promise<Group> => {
    const response = await api.put(`/groups/${id}`, data)
    return response.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/groups/${id}`)
  },
}

// Group Members API
export const groupMembersApi = {
  addMember: async (groupId: number, userId: number): Promise<GroupMember> => {
    const response = await api.post('/group-members', { groupId, userId })
    return response.data
  },
  removeMember: async (groupId: number, userId: number): Promise<void> => {
    // Le backend attend l'ID du GroupMember, pas groupId/userId
    // On doit d'abord trouver le GroupMember
    const members = await groupMembersApi.getMembers(groupId)
    const member = members.find(m => m.userId === userId)
    if (member) {
      await api.delete(`/group-members/${member.id}`)
    }
  },
  promoteToAdmin: async (groupId: number, userId: number): Promise<GroupMember> => {
    const members = await groupMembersApi.getMembers(groupId)
    const member = members.find(m => m.userId === userId)
    if (!member) {
      throw new Error('Membre introuvable')
    }
    const response = await api.post(`/group-members/${member.id}/promote`)
    return response.data
  },
  getMembers: async (groupId: number): Promise<GroupMember[]> => {
    const response = await api.get(`/group-members/group/${groupId}`)
    return response.data
  },
}

// Expenses API
export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    const response = await api.get('/expenses')
    return response.data
  },
  getById: async (id: number): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`)
    return response.data
  },
  getByGroup: async (groupId: number): Promise<Expense[]> => {
    const response = await api.get(`/expenses/group/${groupId}`)
    return response.data
  },
  create: async (data: {
    title: string
    amount: number
    currency?: string
    paidById: number
    groupId: number
    categoryId?: number
    date?: Date
    participantIds: number[]
    splitType?: string
    splitDetails?: any
    notes?: string
  }): Promise<Expense> => {
    // Transformer les données pour correspondre au DTO backend
    const backendData = {
      title: data.title,
      amount: data.amount,
      description: data.notes,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      paidBy: data.paidById, // Backend attend 'paidBy' pas 'paidById'
      groupId: data.groupId,
      participants: data.participantIds, // Backend attend 'participants' pas 'participantIds'
      categoryId: data.categoryId,
      splitType: data.splitType || 'equal',
      splitDetails: data.splitDetails,
    }
    const response = await api.post('/expenses', backendData)
    return response.data
  },
  update: async (id: number, data: Partial<Expense>): Promise<Expense> => {
    const response = await api.put(`/expenses/${id}`, data)
    return response.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`)
  },
}

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories')
    return response.data
  },
  getAllWithBudgets: async (): Promise<Category[]> => {
    const response = await api.get('/categories/with-budgets')
    return response.data
  },
  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },
  create: async (data: { name: string; icon?: string; color?: string }): Promise<Category> => {
    const response = await api.post('/categories', data)
    return response.data
  },
  update: async (id: number, data: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`)
  },
  // Gestion des budgets personnels
  setUserBudget: async (categoryId: number, budgetLimit: number) => {
    const response = await api.post(`/categories/${categoryId}/budget`, { budgetLimit })
    return response.data
  },
  getUserBudget: async (categoryId: number) => {
    const response = await api.get(`/categories/${categoryId}/budget`)
    return response.data
  },
  getUserBudgets: async () => {
    const response = await api.get('/categories/user/budgets')
    return response.data
  },
  deleteUserBudget: async (categoryId: number) => {
    const response = await api.delete(`/categories/${categoryId}/budget`)
    return response.data
  },
}

// Balances API
export const balancesApi = {
  getGroupBalances: async (groupId: number): Promise<any> => {
    const response = await api.get(`/balances/group/${groupId}`)
    // L'API retourne { groupId, totalSpent, balances: [...], settlementPlan: [...] }
    // On retourne toute la structure avec les données complètes
    return response.data
  },
}

// Settlements API
export const settlementsApi = {
  getAll: async (): Promise<Settlement[]> => {
    const response = await api.get('/settlements')
    return response.data
  },
  getByGroup: async (groupId: number): Promise<Settlement[]> => {
    const response = await api.get(`/settlements/group/${groupId}`)
    return response.data
  },
  create: async (data: {
    fromUserId: number
    toUserId: number
    groupId: number
    amount: number
    currency?: string
  }): Promise<Settlement> => {
    const response = await api.post('/settlements', data)
    return response.data
  },
  update: async (id: number, data: Partial<Settlement>): Promise<Settlement> => {
    const response = await api.put(`/settlements/${id}`, data)
    return response.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/settlements/${id}`)
  },
}

// Activities API
export const activitiesApi = {
  getByGroup: async (groupId: number): Promise<Activity[]> => {
    const response = await api.get(`/activities/group/${groupId}`)
    return response.data
  },
}
