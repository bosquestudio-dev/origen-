import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface CalendarState {
  completedDays: number[]
  completeDay: (day: number) => void
  resetDays: () => void
}

const CalendarContext = createContext<CalendarState | null>(null)
const STORAGE_KEY = 'origen_completions'
const DEMO_COMPLETIONS = [1,2,3,4,5,6,7,8,10,11,12]

function loadCompletions(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_COMPLETIONS))
      return DEMO_COMPLETIONS
    }
    return JSON.parse(raw)
  } catch { return DEMO_COMPLETIONS }
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

  const resetDays = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_COMPLETIONS))
    setCompletedDays([...DEMO_COMPLETIONS])
  }, [])

  return (
    <CalendarContext.Provider value={{ completedDays, completeDay, resetDays }}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendarStore() {
  const ctx = useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendarStore must be used within CalendarProvider')
  return ctx
}
