import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'

interface AppState {
  activeModal: number | null
  toast: { message: string; visible: boolean }
  openChallenge: (day: number) => void
  closeChallenge: () => void
  showToast: (message: string) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<number | null>(null)
  const [toast, setToast] = useState({ message: '', visible: false })
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const openChallenge = useCallback((day: number) => setActiveModal(day), [])
  const closeChallenge = useCallback(() => setActiveModal(null), [])
  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast({ message: '', visible: false }), 3000)
  }, [])

  return (
    <AppContext.Provider value={{ activeModal, toast, openChallenge, closeChallenge, showToast }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used within AppProvider')
  return ctx
}
