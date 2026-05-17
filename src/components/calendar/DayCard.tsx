import { motion } from 'framer-motion'
import type { CalendarDay } from '@/types/calendar.types'
import { useAppStore } from '@/stores/app.store'
import { useCalendar } from '@/hooks/useCalendar'
import { DAY_LABELS, HOLIDAY_DAYS } from '@/data/calendar.data'

interface DayCardProps {
  day: CalendarDay
  index: number
}

const getDayAbbr = (day: number) => DAY_LABELS[day]?.split(' ')[0] ?? ''

const CARD_STYLES: Record<string, React.CSSProperties> = {
  completed:      { background: '#182A22', border: '1px solid #22C35D' },
  accessible:     { background: '#434548', border: '1px solid #BCC0C7' },
  today:          { background: '#89573E', border: '2px solid #FB7026' },
  locked:         { background: '#1C1C20', border: '1px solid rgba(255,255,255,0.12)' },
  'digital-detox':{ background: 'rgba(41,44,49,0.75)', border: '1px solid #41454E' },
}

const GRADIENT_OVERLAY: Record<string, string | null> = {
  completed:      'radial-gradient(ellipse at 40% 60%, rgba(34,197,94,0.2), transparent 60%)',
  accessible:     null,
  today:          'radial-gradient(ellipse at 40% 60%, rgba(249,115,22,0.25), transparent 60%)',
  locked:         null,
  'digital-detox': null,
}

const NUMBER_COLOR: Record<string, string> = {
  completed:      '#22C55E',
  accessible:     'rgba(255,255,255,0.5)',
  today:          '#F97316',
  locked:         'rgba(255,255,255,0.25)',
  'digital-detox':'rgba(255,255,255,0.06)',
}

// SVG icon size for regular badges
const ICON_SIZE = 10.2

const BADGE_CONFIG = {
  today: {
    label: 'Hoy',
    icon: '/today.svg',
    style: { background: '#F97316', color: '#FFFFFF', border: 'none' } as React.CSSProperties,
  },
  accessible: {
    label: 'Pasado',
    icon: '/past.svg',
    style: { background: '#F7F7F8', color: '#727988', border: 'none', borderRadius: 85 } as React.CSSProperties,
  },
  completed: {
    label: 'Completado',
    icon: '/completed.svg',
    style: { background: '#22C55E', color: '#FFFFFF', border: 'none' } as React.CSSProperties,
  },
  locked: {
    label: 'Próximo',
    icon: '/locked-until-available.svg',
    style: { background: '#ACADB0', color: '#41454E', border: 'none', borderRadius: 85 } as React.CSSProperties,
  },
} as const

const SPECIAL_CARD: React.CSSProperties = { background: '#3E351D', border: '2px solid #DAA520' }
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
  const isHoliday = HOLIDAY_DAYS.includes(day.day)
  const cardStyle = isSpecial ? SPECIAL_CARD : (CARD_STYLES[day.status] ?? CARD_STYLES.locked)
  const numColor = isSpecial ? SPECIAL_NUM_COLOR : (NUMBER_COLOR[day.status] ?? 'rgba(255,255,255,0.15)')
  const gradient = isSpecial ? null : (GRADIENT_OVERLAY[day.status] ?? null)
  const badge = BADGE_CONFIG[day.status as keyof typeof BADGE_CONFIG]

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
      {/* Gradient overlay */}
      {gradient && (
        <div style={{
          position: 'absolute', inset: 0,
          background: gradient,
          pointerEvents: 'none',
          borderRadius: 'inherit',
          zIndex: 0,
        }} />
      )}

      {/* Day number — siempre visible */}
      <div style={{ position: 'absolute', bottom: 12, left: 16, zIndex: 1 }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: '40px',
          lineHeight: 1,
          color: numColor,
        }}>
          {day.day}
        </div>
        {/* Day name — mobile only */}
        <div
          className="day-abbr-mobile"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, fontWeight: 400,
            color: numColor, opacity: 0.6,
            marginTop: 2, letterSpacing: '0.03em',
          }}
        >
          {getDayAbbr(day.day)}
        </div>
      </div>

      {/* Digital-detox — overlay oscuro + icono SVG centrado */}
      {isDetox && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(41,44,49,0.82)',
            borderRadius: 'inherit',
            zIndex: 1,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, zIndex: 2,
          }}>
            <img
              src="/weekend-holiday-locked.svg"
              width={24} height={24}
              alt={isHoliday ? 'Festivo' : 'Fin de semana'}
            />
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12, fontWeight: 500,
              color: '#F4F5F0',
              textAlign: 'center',
              lineHeight: 1.3,
              whiteSpace: 'pre-line',
            }}>
              {isHoliday ? 'Festivo' : 'Desconexión\ndigital'}
            </span>
          </div>
        </>
      )}

      {/* Badge — top right, solo días NO detox */}
      {!isDetox && (
        <div style={{
          position: 'absolute',
          top: 10, right: 10,
          display: 'flex', alignItems: 'center', gap: 4,
          borderRadius: 85,
          height: 20.8,
          padding: '3.4px 6.8px',
          fontSize: 9.35,
          fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1,
          whiteSpace: 'nowrap',
          ...(isSpecial
            ? { background: '#DAA520', color: '#F4F5F0', border: 'none' }
            : (badge?.style ?? {})),
          zIndex: 3,
        }}>
          {isSpecial
            ? <img src="/final-challenge-medal.svg" width={ICON_SIZE} height={ICON_SIZE} alt="Último día" />
            : badge && <img src={badge.icon} width={ICON_SIZE} height={ICON_SIZE} alt={badge.label} />
          }
          <span>{isSpecial ? 'Último día' : badge?.label}</span>
        </div>
      )}
    </motion.div>
  )
}
