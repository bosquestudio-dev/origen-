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
    if (day.status === 'completed' && day.challenge?.type === 'raffle') {
      showToast('Ya estás inscrito en este sorteo')
      return
    }
    if (day.status === 'completed' && day.challenge?.type === 'survey') {
      showToast('Ya participaste en esta encuesta')
      return
    }
    if (!canAttemptDay(day.day)) {
      showToast('Completa al menos los dos retos anteriores primero')
      return
    }
    openChallenge(day.day)
  }

  const gridClass = sizeClasses[day.day] || 'col-span-1'

  const getCardClass = () => {
    if (day.isSpecial) return 'day-card day-card-especial shimmer-border'
    switch (day.status) {
      case 'today':         return 'day-card day-card-hoy pulse-today'
      case 'completed':     return 'day-card day-card-completado'
      case 'accessible':    return 'day-card day-card-pasado'
      case 'locked':        return 'day-card day-card-futuro'
      case 'digital-detox': return 'day-card day-card-desconexion'
      default:              return 'day-card'
    }
  }

  const getBadgeVariant = () => {
    switch (day.status) {
      case 'today':         return 'hoy' as const
      case 'completed':     return 'completado' as const
      case 'accessible':    return 'pasado' as const
      case 'locked':        return 'futuro' as const
      case 'digital-detox': return 'desconexion' as const
      default:              return 'futuro' as const
    }
  }

  const getGradientClass = () => {
    switch (day.status) {
      case 'today':         return 'card-gradient-today'
      case 'completed':     return 'card-gradient-completed'
      case 'accessible':    return 'card-gradient-accessible'
      case 'locked':        return 'card-gradient-locked'
      case 'digital-detox': return 'card-gradient-detox'
      default:              return 'card-gradient-locked'
    }
  }

  return (
    <motion.div
      className={gridClass}
      onClick={handleClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
    >
      <div className={getCardClass()}>
        {/* Gradient overlay */}
        <div className={`card-gradient-overlay ${getGradientClass()}`} />

        {/* Badge de estado — esquina superior derecha */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
          <AppBadge variant={getBadgeVariant()} size="sm" />
        </div>

        {/* Badge de tipo de reto — esquina inferior derecha */}
        {day.challenge && day.status !== 'digital-detox' && day.status !== 'locked' && (
          <div style={{ position: 'absolute', bottom: '14px', right: '12px', zIndex: 2 }}>
            <AppBadge variant={day.challenge.type} size="sm" />
          </div>
        )}

        {/* Número y fecha — esquina inferior izquierda */}
        <div style={{ position: 'absolute', bottom: '14px', left: '16px', zIndex: 2 }}>
          <div className="card-day-number">{day.day}</div>
          <div className="card-day-date">{day.date.split(' ')[0]}</div>
        </div>
      </div>
    </motion.div>
  )
}
