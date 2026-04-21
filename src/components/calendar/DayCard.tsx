import { motion } from 'framer-motion'
import type { CalendarDay } from '@/types/calendar.types'
import AppBadge from '@/components/origen/AppBadge'
import { useAppStore } from '@/stores/app.store'
import { useCalendar } from '@/hooks/useCalendar'
import { DAY_LABELS } from '@/data/calendar.data'

interface DayCardProps {
  day: CalendarDay
  index: number
}

const sizeClasses: Record<number, string> = {
  1: 'col-span-2 row-span-2',
  10: 'col-span-2',
  14: 'col-span-2',
  18: 'col-span-2',
  24: 'col-span-2',
}

export default function DayCard({ day, index }: DayCardProps) {
  const { openChallenge, showToast } = useAppStore()
  const { canAttemptDay } = useCalendar()

  const handleClick = () => {
    if (day.status === 'locked') {
      showToast(`Disponible el ${DAY_LABELS[day.day]}`)
      return
    }
    if (day.status === 'digital-detox') {
      showToast('Día de desconexión digital — descansa')
      return
    }
    if (!canAttemptDay(day.day)) {
      showToast('Completa los retos anteriores primero')
      return
    }
    openChallenge(day.day)
  }

  const gridClass = sizeClasses[day.day] || 'col-span-1'

  const statusStyles = {
    locked: 'bg-[#0D0D0D] opacity-50 cursor-not-allowed',
    'digital-detox': 'bg-surface cursor-default',
    accessible: 'bg-surface-2 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_hsl(245_52%_67%/0.1)] cursor-pointer',
    today: 'bg-surface-2 border-accent pulse-today cursor-pointer',
    completed: 'bg-surface opacity-70 cursor-pointer',
  }

  return (
    <motion.div
      className={`${gridClass} border border-border rounded-card p-4 flex flex-col justify-between gap-3 transition-all duration-200 ${statusStyles[day.status]} ${day.isSpecial ? 'border-gold shimmer-border' : ''}`}
      onClick={handleClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
    >
      <div className="flex items-start justify-between">
        <span className={`text-2xl font-medium ${day.status === 'locked' ? 'blur-[2px]' : ''} ${day.isSpecial ? 'text-gold-light' : 'text-foreground'}`}>
          {day.day}
        </span>
        <div className="flex gap-1.5 items-center">
          {day.status === 'today' && <AppBadge label="HOY" variant="today" />}
          {day.status === 'digital-detox' && <AppBadge label="Desconexión" variant="detox" />}
          {day.isSpecial && <AppBadge label="Especial" variant="special" />}
          {day.challenge && day.status !== 'digital-detox' && (
            <AppBadge label={day.challenge.label} variant={day.challenge.type} />
          )}
        </div>
      </div>

      {day.status === 'locked' && (
        <div className="flex items-center justify-center flex-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      )}

      {day.status === 'digital-detox' && (
        <p className="text-xs text-muted-foreground">Desconecta y recarga</p>
      )}

      {(day.status === 'accessible' || day.status === 'today') && day.challenge && (
        <div>
          <p className="text-sm font-medium text-foreground">{day.challenge.title}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{day.challenge.description}</p>
        </div>
      )}

      {day.status === 'completed' && (
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="2" strokeLinecap="round" className="draw-check">
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs text-muted-foreground">Completado</span>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60 mt-auto">{day.date}</p>
    </motion.div>
  )
}
