import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User } from '@/types/auth.types'
import { MOCK_USERS } from '@/data/users.data'

const STORAGE_KEY = 'origen_user'
const COMPLETIONS_KEY = 'origen_completions'
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000

interface StoredAuth {
  user: User
  loginTimestamp: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isSessionValid: boolean
  login: (identifier: string, type: 'email' | 'dni') => boolean
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function loadAuth(): { user: User | null; loginTimestamp: number | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, loginTimestamp: null }
    const parsed: StoredAuth = JSON.parse(raw)
    // Check 90-day expiry on load
    if (Date.now() - parsed.loginTimestamp > NINETY_DAYS_MS) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(COMPLETIONS_KEY)
      return { user: null, loginTimestamp: null }
    }
    return { user: parsed.user, loginTimestamp: parsed.loginTimestamp }
  } catch {
    return { user: null, loginTimestamp: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadAuth()
  const [user, setUser] = useState<User | null>(initial.user)
  const [loginTimestamp, setLoginTimestamp] = useState<number | null>(initial.loginTimestamp)

  // TODO Fase 2: supabase.auth.getSession() reemplazará esta lógica
  const isSessionValid = !!user && !!loginTimestamp && (Date.now() - loginTimestamp < NINETY_DAYS_MS)

  const login = useCallback((identifier: string, type: 'email' | 'dni') => {
    const found = MOCK_USERS.find(u =>
      type === 'email' ? u.email === identifier : u.dni === identifier
    )
    if (found) {
      const ts = Date.now()
      setUser(found)
      setLoginTimestamp(ts)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: found, loginTimestamp: ts }))
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setLoginTimestamp(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(COMPLETIONS_KEY)
    // En Fase 2: llamar a supabase.auth.signOut() aquí
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isSessionValid, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
