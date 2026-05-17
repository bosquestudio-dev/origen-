import { motion } from 'framer-motion'
import { RefreshCw, LockKeyhole } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect, useLayoutEffect } from 'react'
import type { CalendarDay } from '@/types/calendar.types'
import { useAppStore } from '@/stores/app.store'
import { useCalendar } from '@/hooks/useCalendar'
import { DAY_LABELS, HOLIDAY_DAYS } from '@/data/calendar.data'

interface DayCardProps {
  day: CalendarDay
  index: number
  dataStatus?: string
  dataSpecial?: string
}

// Returns 3-letter abbreviation from day label e.g. "Lunes 1" → "LUN"
const getDayAbbr = (day: number) => {
  const label = DAY_LABELS[day]?.split(' ')[0] ?? ''
  return label.slice(0, 3).toUpperCase()
}

// ─── Desktop card styles ───────────────────────────────────────────────────────
const CARD_STYLES_DESKTOP: Record<string, React.CSSProperties> = {
  completed:      { background: '#182A22', border: '1px solid #22C35D' },
  accessible:     { background: '#434548', border: '1px solid #BCC0C7' },
  today:          { background: '#89573E', border: '2px solid #FB7026' },
  locked:         { background: '#1C1C20', border: '1px solid rgba(255,255,255,0.12)' },
  'digital-detox':{ background: 'rgba(41,44,49,0.75)', border: '1px solid #41454E' },
  'catch-up':     { background: '#1A1A2E', border: '1.5px solid #7B6FE8' },
}
const SPECIAL_CARD_DESKTOP: React.CSSProperties = { background: '#3E351D', border: '2px solid #DAA520' }

// ─── Mobile card styles ────────────────────────────────────────────────────────
const CARD_STYLES_MOBILE: Record<string, React.CSSProperties> = {
  completed:      { background: 'rgba(34,195,93,0.25)',  border: '2px solid #22C35D' },
  accessible:     { background: 'rgba(247,247,248,0.25)',border: '2px solid #BCC0C7' },
  today:          { background: 'rgba(252,150,95,0.50)', border: '2px solid #FB7026' },
  locked:         { background: 'transparent',           border: '2px solid #585E6A' },
  'digital-detox':{ background: 'transparent',           border: '2px solid #2A2D32' },
  'catch-up':     { background: '#1A1A2E',               border: '1.5px solid #7B6FE8' },
}
const SPECIAL_CARD_MOBILE: React.CSSProperties = { background: 'rgba(218,165,32,0.40)', border: '2px solid #DAA520' }

// ─── Number colors ─────────────────────────────────────────────────────────────
const NUMBER_COLOR: Record<string, string> = {
  completed:      '#22C35D',
  accessible:     '#727988',
  today:          '#FB7026',
  locked:         '#585E6A',
  'digital-detox':'#41454E',
  'catch-up':     '#7B6FE8',
}
const SPECIAL_NUM_COLOR = '#DAA520'

// ─── Badge config ──────────────────────────────────────────────────────────────
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
    style: { background: '#ACADB0', color: '#41454E', border: 'none', borderRadius: 85 } as React.CSSProperties,
  },
  'catch-up': {
    label: 'Ponte al día',
    icon: null,
    style: { background: '#7B6FE8', color: '#FFFFFF', border: 'none' } as React.CSSProperties,
  },
} as const

export default function DayCard({ day, index, dataStatus, dataSpecial }: DayCardProps) {
  const { openChallenge, showToast } = useAppStore()
  const { canAttemptDay } = useCalendar()
  const [isMobile, setIsMobile] = useState(false)

  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 767)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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

  const desktopCardStyle = isSpecial ? SPECIAL_CARD_DESKTOP : (CARD_STYLES_DESKTOP[day.status] ?? CARD_STYLES_DESKTOP.locked)
  const mobileCardStyle  = isSpecial ? SPECIAL_CARD_MOBILE  : (CARD_STYLES_MOBILE[day.status]  ?? CARD_STYLES_MOBILE.locked)

  const numColor = isSpecial ? SPECIAL_NUM_COLOR : (NUMBER_COLOR[day.status] ?? 'rgba(255,255,255,0.25)')
  const badge = BADGE_CONFIG[day.status as keyof typeof BADGE_CONFIG]

  // Gap between number and day abbreviation (mobile)
  const abbrGap = (day.status === 'locked' || isSpecial) ? 12.5 : 8

  return (
    <motion.div
      onClick={handleClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.018, ease: 'easeOut' }}
      className="day-card-root"
      data-status={dataStatus ?? day.status}
      data-special={dataSpecial ?? (isSpecial ? 'true' : 'false')}
      style={isMobile ? {
        ...mobileCardStyle,
        width: '100%',
        height: 78.5,
        minHeight: 78.5,
        maxHeight: 78.5,
        borderRadius: 8,
        position: 'relative',
        overflow: 'hidden',
        cursor: (isDetox || day.status === 'catch-up') ? 'default' : (day.status === 'locked' ? 'not-allowed' : 'pointer'),
        userSelect: 'none',
        boxSizing: 'border-box',
        padding: 16,
      } : {
        ...desktopCardStyle,
        height: 160,
        minHeight: 160,
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        cursor: (isDetox || day.status === 'catch-up') ? 'default' : (day.status === 'locked' ? 'not-allowed' : 'pointer'),
        userSelect: 'none',
        boxSizing: 'border-box',
        padding: 16,
      }}
    >
      {/* ── DESKTOP layout ──────────────────────────────────────────────────── */}

      {/* Day number — bottom left, blurred if detox */}
      <div
        className="day-number-desktop"
        style={{
          position: 'absolute', bottom: 12, left: 16, zIndex: 1,
          filter: isDetox ? 'blur(5px)' : undefined,
        }}
      >
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700, fontSize: '40px', lineHeight: 1,
          color: numColor,
        }}>
          {day.day}
        </div>
      </div>

      {/* Digital-detox desktop — lock centered */}
      {isDetox && (
        <div
          className="day-detox-desktop"
          style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 3.4, pointerEvents: 'none',
          }}
        >
          <LockKeyhole size={24} color="#F4F5F0" strokeWidth={1.5} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, fontWeight: 500, color: '#F4F5F0',
            textAlign: 'center', lineHeight: '14px', whiteSpace: 'pre-line',
          }}>
            {isHoliday ? 'Festivo' : 'Desconexión\ndigital'}
          </span>
        </div>
      )}

      {/* Badge — top right, desktop, non-detox */}
      {!isDetox && (
        <div
          className="day-badge-desktop"
          style={{
            position: 'absolute', top: 10, right: 10,
            display: 'flex', alignItems: 'center', gap: 4,
            borderRadius: 85, height: 20.8, padding: '3.4px 6.8px',
            fontSize: 9.35, fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1, whiteSpace: 'nowrap',
            ...(isSpecial
              ? { background: '#DAA520', color: '#F4F5F0', border: 'none' }
              : (badge?.style ?? {})),
            zIndex: 3,
          }}
        >
          {isSpecial
            ? <img src="/final-challenge-medal.svg" width={ICON_SIZE} height={ICON_SIZE} alt="Último día" />
            : day.status === 'catch-up'
              ? <RefreshCw size={11} strokeWidth={2} />
              : badge?.icon && <img src={badge.icon} width={ICON_SIZE} height={ICON_SIZE} alt={badge.label} />
          }
          <span>{isSpecial ? 'Último día' : badge?.label}</span>
        </div>
      )}

      {/* ── MOBILE layout ───────────────────────────────────────────────────── */}

      {/* Mobile: number + abbr centered, only for non-detox */}
      {!isDetox && (
        <div
          className="day-mobile-content"
          style={{
            display: 'none', /* shown via CSS */
            flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            position: 'absolute', inset: 0, zIndex: 1,
          }}
        >
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500, fontSize: 34, lineHeight: 1,
            color: numColor, textAlign: 'center',
          }}>
            {day.day}
          </div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500, fontSize: 14, lineHeight: 1,
            color: numColor, textAlign: 'center',
            marginTop: abbrGap, letterSpacing: 0,
            textTransform: 'uppercase',
          }}>
            {getDayAbbr(day.day)}
          </div>
        </div>
      )}

      {/* Mobile: detox — lock + label centered */}
      {isDetox && (
        <div
          className="day-mobile-detox"
          style={{
            display: 'none', /* shown via CSS */
            flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            position: 'absolute', inset: 0, zIndex: 2,
            gap: 6, pointerEvents: 'none',
          }}
        >
          <img src="/weekend-holiday-locked.svg" width={24} height={24} alt={isHoliday ? 'Festivo' : 'Fin de semana'} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10, fontWeight: 500, color: '#F4F5F0',
            textAlign: 'center', lineHeight: 1.3, whiteSpace: 'pre-line',
          }}>
            {isHoliday ? 'Festivo' : 'Desconexión\ndigital'}
          </span>
        </div>
      )}
    </motion.div>
  )
}
