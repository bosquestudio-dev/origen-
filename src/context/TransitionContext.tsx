import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import TransitionOverlay from '@/components/TransitionOverlay'

interface TransitionContextType {
  navigateWithTransition: (to: string) => void
}

const TransitionContext = createContext<TransitionContextType>({
  navigateWithTransition: () => {},
})

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const navigate = useNavigate()

  const navigateWithTransition = useCallback((to: string) => {
    setIsActive(true)

    setTimeout(() => {
      navigate(to)
    }, 600)

    setTimeout(() => {
      setIsActive(false)
    }, 1300)
  }, [navigate])

  return (
    <TransitionContext.Provider value={{ navigateWithTransition }}>
      {children}
      <TransitionOverlay isActive={isActive} />
    </TransitionContext.Provider>
  )
}

export function useTransition() {
  return useContext(TransitionContext)
}
