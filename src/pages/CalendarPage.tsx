import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/stores/auth.store'
import { useAppStore } from '@/stores/app.store'
import { useCalendarStore } from '@/stores/calendar.store'
import { useProgress } from '@/hooks/useProgress'
import { useCalendar } from '@/hooks/useCalendar'
import { CHALLENGES_DATA } from '@/data/challenges.data'
import ProgressRing from '@/components/origen/ProgressRing'
import AppToast from '@/components/origen/AppToast'
import AppModal from '@/components/origen/AppModal'
import AppButton from '@/components/origen/AppButton'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import ChallengeModalContent from '@/components/challenge/ChallengeModalContent'
import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import LoadingScreen from '@/components/auth/LoadingScreen'

export default function CalendarPage() {
  const { user, isSessionValid, logout } = useAuth()
  const { activeModal, closeChallenge } = useAppStore()
  const { completedDays } = useCalendarStore()
  const { progressPercentage, companionPercentage, completedCount, totalAvailable } = useProgress()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [pageReady, setPageReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!isSessionValid) {
      logout()
      navigate('/', { replace: true })
    }
  }, [isSessionValid, logout, navigate])

  if (!isSessionValid || !user) return null

  const activeChallenge = activeModal ? CHALLENGES_DATA.find(c => c.day === activeModal) : null
  const firstName = user.name.split(' ')[0]

  const handleLogout = () => {
    setShowLogoutModal(false)
    logout()
    navigate('/')
  }

  return (
    <>
    <LoadingScreen isVisible={!pageReady} />
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: pageReady ? 1 : 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center px-4 md:px-8">
        <div className="flex-1 flex items-center gap-3">
          <p className="text-sm text-foreground font-light">Hola, <span className="font-medium">{firstName}</span></p>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            title="Salir"
          >
            <LogOut size={14} />
          </button>
        </div>
        <h1 className="text-sm font-medium tracking-[0.15em] text-foreground">ORIGEN</h1>
        <div className="flex-1 flex items-center justify-end gap-3">
          <ProgressRing percentage={progressPercentage} />
          <div className="text-right hidden sm:block">
            <p className="text-xs text-foreground">{completedCount} / {totalAvailable}</p>
            <p className="text-[10px] text-muted-foreground">El {companionPercentage}% completó hoy</p>
          </div>
        </div>
      </header>

      {/* Calendar */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <CalendarGrid />
      </main>

      {/* Challenge Modal */}
      <AppModal isOpen={!!activeChallenge} onClose={closeChallenge}>
        {activeChallenge && (
          <ChallengeModalContent
            challenge={activeChallenge}
            completed={completedDays.includes(activeChallenge.day)}
          />
        )}
      </AppModal>

      {/* Logout Confirmation Modal */}
      <AppModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <div className="space-y-4 text-center">
          <h3 className="text-lg font-medium text-foreground">¿Seguro que quieres salir?</h3>
          <p className="text-sm text-muted-foreground">Podrás volver a acceder cuando quieras con tu correo o DNI</p>
          <div className="flex gap-3 justify-center pt-2">
            <AppButton variant="ghost" onClick={() => setShowLogoutModal(false)}>Cancelar</AppButton>
            <AppButton onClick={handleLogout}>Salir</AppButton>
          </div>
        </div>
      </AppModal>

      <AppToast />
    </motion.div>
    </>
  )
}
