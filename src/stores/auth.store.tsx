import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User } from '@/types/auth.types'
import { MOCK_USERS } from '@/data/users.data'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (identifier: string, type: 'email' | 'dni') => boolean
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const STORAGE_KEY = 'origen_user'

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser)

  const login = useCallback((identifier: string, type: 'email' | 'dni') => {
    const found = MOCK_USERS.find(u =>
      type === 'email' ? u.email === identifier : u.dni === identifier
    )
    if (found) {
      setUser(found)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
