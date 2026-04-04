import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface CalendarState {
  completedDays: number[]
  completeDay: (day: number) => void
}

const CalendarContext = createContext<CalendarState | null>(null)
const STORAGE_KEY = 'origen_completions'

function loadCompletions(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [completedDays, setCompletedDays] = useState<number[]>(loadCompletions)

  const completeDay = useCallback((day: number) => {
    setCompletedDays(prev => {
      if (prev.includes(day)) return prev
      const next = [...prev, day]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <CalendarContext.Provider value={{ completedDays, completeDay }}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendarStore() {
  const ctx = useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendarStore must be used within CalendarProvider')
  return ctx
}
