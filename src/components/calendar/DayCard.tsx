import { motion } from 'framer-motion'
import { RefreshCw, LockKeyhole } from 'lucide-react'
import { toast } from 'sonner'
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
  // Figma: #22C35D a 10%
  completed:      { background: 'rgba(34,195,93,0.1)', border: '1px solid #22C35D' },
  accessible:     { background: 'rgba(247,247,248,0.2)', border: '1px solid #BCC0C7' },
  // Figma: #FC965F a 10% (mobile) / borde #FB7026 2px
  today:          { background: 'rgba(252,150,95,0.1)', border: '2px solid #FB7026' },
  // Figma: transparent / borde #41454E
  locked:         { background: 'transparent', border: '1px solid #41454E' },
  'digital-detox':{ background: 'rgba(114,121,136,0.2)', border: '1px solid #585E6A' },
  // No en Figma — valores propios
  'catch-up':     { background: '#1A1A2E', border: '1.5px solid #7B6FE8' },
}

const GRADIENT_OVERLAY: Record<string, string | null> = {
  completed:      null,
  accessible:     null,
  today:          null,
  locked:         null,
  'digital-detox':null,
  'catch-up':     null,
}

const NUMBER_COLOR: Record<string, string> = {
  completed:      '#22C35D',   // Figma: #22C35D
  accessible:     '#727988',
  today:          '#FB7026',   // Figma: #FB7026 (mobile)
  locked:         '#41454E',   // Figma: #41454E
  'digital-detox':'#41454E',
  'catch-up':     '#7B6FE8',
}

// SVG icon size for regular badges
const ICON_SIZE = 10.2

const BADGE_CONFIG = {
  today: {
    label: 'Hoy',
    icon: '/today.svg',
    style: { background: '#FB7026', color: '#F4F5F0', border: 'none' } as React.CSSProperties,
  },
  accessible: {
    label: 'Pasado',
    icon: '/past.svg',
    style: { background: '#F7F7F8', color: '#727988', border: 'none', borderRadius: 85 } as React.CSSProperties,
  },
  completed: {
    label: 'Completado',
    icon: '/completed.svg',
    style: { background: '#22C35D', color: '#F4F5F0', border: 'none' } as React.CSSProperties,
  },
  locked: {
    label: 'Próximo',
    icon: '/locked-until-available.svg',
    style: { background: '#ECEDEF', color: '#41454E', border: 'none', borderRadius: 85 } as React.CSSProperties,
  },
  'catch-up': {
    label: 'Ponte al día',
    icon: null,
    style: { background: '#7B6FE8', color: '#FFFFFF', border: 'none' } as React.CSSProperties,
  },
} as const

// Figma: #DAA520 a 20% / borde #DAA520 2px
const SPECIAL_CARD: React.CSSProperties = { background: 'rgba(218,165,32,0.2)', border: '2px solid #DAA520' }
const SPECIAL_NUM_COLOR = '#DAA520'

export default function DayCard({ day, index }: DayCardProps) {
  const { openChallenge, showToast } = useAppStore()
  const { canAttemptDay } = useCalendar()

  const handleClick = () => {
    if (day.status === 'digital-detox') return
    if (day.status === 'catch-up') {
      toast.info('Día de ponerse al día', {
        description: 'Usa este día para completar retos pendientes.',
        duration: 3000,
      })
      return
    }
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
        cursor: (isDetox || day.status === 'catch-up') ? 'default' : (day.status === 'locked' ? 'not-allowed' : 'pointer'),
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

      {/* Day number — zIndex 1 (detox: blurred con filter) */}
      <div style={{ position: 'absolute', bottom: 12, left: 16, zIndex: 1, filter: isDetox ? 'blur(5px)' : undefined }}>
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
        {!isDetox && (
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
        )}
      </div>

      {/* Digital-detox — badge centrado (icono + texto), sin overlay */}
      {isDetox && (
        <div style={{
          position: 'absolute', inset: 0,
          zIndex: 2,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 3.4,
          pointerEvents: 'none',
        }}>
          <LockKeyhole size={24} color="#F4F5F0" strokeWidth={1.5} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, fontWeight: 500,
            color: '#F4F5F0',
            textAlign: 'center',
            lineHeight: '14px',
            whiteSpace: 'pre-line',
          }}>
            {isHoliday ? 'Festivo' : 'Desconexión\ndigital'}
          </span>
        </div>
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
            : day.status === 'catch-up'
              ? <RefreshCw size={11} strokeWidth={2} />
              : badge && badge.icon && <img src={badge.icon} width={ICON_SIZE} height={ICON_SIZE} alt={badge.label} />
          }
          <span>{isSpecial ? 'Último día' : badge?.label}</span>
        </div>
      )}
    </motion.div>
  )
}
