import { motion } from 'framer-motion'
import { Sun, RotateCcw, CheckCircle2, Lock, Moon } from 'lucide-react'
import type { CalendarDay } from '@/types/calendar.types'
import { useAppStore } from '@/stores/app.store'
import { useCalendar } from '@/hooks/useCalendar'
import { DAY_LABELS } from '@/data/calendar.data'

interface DayCardProps {
  day: CalendarDay
  index: number
}

const getDayAbbr = (day: number) => DAY_LABELS[day]?.split(' ')[0] ?? ''

const CARD_STYLES: Record<string, React.CSSProperties> = {
  completed:      { background: '#0D2B1A', border: '1.5px solid #22C55E' },
  accessible:     { background: '#242428', border: '1px solid #BCC0C7' },
  today:          { background: '#2D1A0A', border: '1.5px solid #F97316' },
  locked:         { background: '#1A1A1E', border: '1px solid #BCC0C7' },
  'digital-detox':{ background: '#18161F', border: '1px solid #D1BDFF' },
}

const GRADIENT_OVERLAY: Record<string, string | null> = {
  completed:      'radial-gradient(ellipse at 40% 60%, rgba(34,197,94,0.2), transparent 60%)',
  accessible:     null,
  today:          'radial-gradient(ellipse at 40% 60%, rgba(249,115,22,0.25), transparent 60%)',
  locked:         null,
  'digital-detox':'radial-gradient(ellipse at 50% 60%, rgba(127,119,221,0.12), transparent 60%)',
}

const NUMBER_COLOR: Record<string, string> = {
  completed:      '#22C55E',
  accessible:     'rgba(255,255,255,0.5)',
  today:          '#F97316',
  locked:         'rgba(255,255,255,0.15)',
  'digital-detox':'#D1BDFF',
}

const BADGE_CONFIG = {
  today: {
    label: 'Hoy', Icon: Sun,
    style: { background: '#F97316', color: '#FFFFFF', border: 'none' } as React.CSSProperties,
  },
  accessible: {
    label: 'Pasado', Icon: RotateCcw,
    // #ECEDEF bg, dark text
    style: { background: '#ECEDEF', color: '#2A2D32', border: 'none' } as React.CSSProperties,
  },
  completed: {
    label: 'Completado', Icon: CheckCircle2,
    style: { background: '#22C55E', color: '#FFFFFF', border: 'none' } as React.CSSProperties,
  },
  locked: {
    label: 'Próximo', Icon: Lock,
    // #ECEDEF bg, dark text
    style: { background: '#ECEDEF', color: '#2A2D32', border: 'none' } as React.CSSProperties,
  },
  'digital-detox': {
    label: 'Fin de semana', Icon: Moon,
    style: {
      background: 'rgba(127,119,221,0.1)',
      color: '#D1BDFF',
      border: '1px solid rgba(127,119,221,0.2)',
    } as React.CSSProperties,
  },
} as const

const SPECIAL_CARD: React.CSSProperties = { background: '#1F1800', border: '1.5px solid #C9A227' }
const SPECIAL_NUM_COLOR = '#C9A227'

export default function DayCard({ day, index }: DayCardProps) {
  const { openChallenge, showToast } = useAppStore()
  const { canAttemptDay } = useCalendar()

  const handleClick = () => {
    if (day.status === 'digital-detox') return
    if (day.status === 'locked') {
      showToast(`Disponible el ${DAY_LABELS[day.day]}`)
      return
    }
    if (!canAttemptDay(day.day)) {
      showToast('Completa al menos los dos retos anteriores primero')
      return
    }
    openChallenge(day.day)
  }

  const isSpecial = day.isSpecial
  const isDetox = day.status === 'digital-detox'
  const cardStyle = isSpecial ? SPECIAL_CARD : (CARD_STYLES[day.status] ?? CARD_STYLES.locked)
  const numColor = isSpecial ? SPECIAL_NUM_COLOR : (NUMBER_COLOR[day.status] ?? 'rgba(255,255,255,0.15)')
  const gradient = isSpecial ? null : (GRADIENT_OVERLAY[day.status] ?? null)
  const badge = BADGE_CONFIG[day.status as keyof typeof BADGE_CONFIG]
  const { Icon } = badge

  return (
    <motion.div
      onClick={handleClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.018, ease: 'easeOut' }}
      style={{
        ...cardStyle,
        borderRadius: 12,
        height: 160,
        minHeight: 160,
        position: 'relative',
        overflow: 'hidden',
        cursor: isDetox ? 'default' : day.status === 'locked' ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        boxSizing: 'border-box',
        padding: 16,
      }}
    >
      {/* Gradient overlay — zIndex 0 */}
      {gradient && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: gradient,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0,
          }}
        />
      )}

      {/* Day number — zIndex 1 (below detox blur, above gradient) */}
      <div
        style={{
          position: 'absolute',
          bottom: 12, left: 16,
          zIndex: 1,
          opacity: isDetox ? 0.3 : 1,
        }}
      >
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(48px, 6vw, 88px)',
            lineHeight: 1,
            color: numColor,
          }}
        >
          {day.day}
        </div>

        {/* Day name — mobile only */}
        <div
          className="day-abbr-mobile"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 400,
            color: numColor,
            opacity: 0.6,
            marginTop: 2,
            letterSpacing: '0.03em',
          }}
        >
          {getDayAbbr(day.day)}
        </div>
      </div>

      {/* Digital-detox blur overlay — zIndex 2 (above number) */}
      {isDetox && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(244,240,255,0.10)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 2,
          }}
        />
      )}

      {/* Badge — top right, zIndex 3 (always above blur) */}
      <div
        style={{
          position: 'absolute',
          top: 10, right: 10,
          display: 'flex', alignItems: 'center', gap: 4,
          borderRadius: 20,
          padding: '3px 7px',
          fontSize: 10,
          fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1,
          whiteSpace: 'nowrap',
          ...(isSpecial
            ? { background: 'rgba(201,162,39,0.15)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.3)' }
            : badge.style),
          zIndex: 3,
        }}
      >
        <Icon size={11} strokeWidth={2} />
        <span>{isSpecial ? 'Especial' : badge.label}</span>
      </div>
    </motion.div>
  )
}
