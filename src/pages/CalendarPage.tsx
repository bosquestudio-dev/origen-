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
import CalendarGrid from '@/components/calendar/CalendarGrid'
import ChallengeModalContent from '@/components/challenge/ChallengeModalContent'
import { useEffect } from 'react'

export default function CalendarPage() {
  const { user, isAuthenticated } = useAuth()
  const { activeModal, closeChallenge } = useAppStore()
  const { completedDays } = useCalendarStore()
  const { progressPercentage, companionPercentage, completedCount, totalAvailable } = useProgress()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  if (!isAuthenticated || !user) return null

  const activeChallenge = activeModal ? CHALLENGES_DATA.find(c => c.day === activeModal) : null
  const firstName = user.name.split(' ')[0]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center px-4 md:px-8">
        <div className="flex-1">
          <p className="text-sm text-foreground font-light">Hola, <span className="font-medium">{firstName}</span></p>
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

      <AppToast />
    </div>
  )
}
