import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AdminDashboardData } from '@/types/admin.types'
import type { CompanyTheme } from '@/types/company.types'
import type { Challenge } from '@/types/challenge.types'
import { MOCK_STATS, MOCK_COMPANY_THEME } from '@/data/admin.data'
import { CHALLENGES_DATA } from '@/data/challenges.data'

interface AdminState {
  stats: AdminDashboardData
  theme: CompanyTheme
  challenges: Challenge[]
  updateTheme: (newTheme: Partial<CompanyTheme>) => void
  toggleChallengeActive: (day: number) => void
  updateChallenge: (day: number, updates: Partial<Challenge>) => void
}

const AdminContext = createContext<AdminState | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [stats] = useState<AdminDashboardData>(MOCK_STATS)
  const [theme, setTheme] = useState<CompanyTheme>(MOCK_COMPANY_THEME)
  const [challenges, setChallenges] = useState<Challenge[]>([...CHALLENGES_DATA])

  const updateTheme = useCallback((newTheme: Partial<CompanyTheme>) => {
    setTheme(prev => ({ ...prev, ...newTheme }))
    // TODO Fase 2: supabase.from('companies').update(newTheme)
  }, [])

  const toggleChallengeActive = useCallback((day: number) => {
    setChallenges(prev => prev.map(c =>
      c.day === day ? { ...c, isActive: !c.isActive } : c
    ))
    // TODO Fase 2: supabase.from('challenges').update({ isActive })
  }, [])

  const updateChallenge = useCallback((day: number, updates: Partial<Challenge>) => {
    setChallenges(prev => prev.map(c =>
      c.day === day ? { ...c, ...updates } : c
    ))
    // TODO Fase 2: supabase.from('challenges').update(updates)
  }, [])

  return (
    <AdminContext.Provider value={{ stats, theme, challenges, updateTheme, toggleChallengeActive, updateChallenge }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdminStore() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdminStore must be used within AdminProvider')
  return ctx
}
