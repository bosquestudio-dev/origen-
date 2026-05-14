import { useCalendar } from '@/hooks/useCalendar'
import DayCard from './DayCard'

const WEEKDAYS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO']

// December 1, 2026 = Tuesday → 1 empty Monday cell
const START_DAY_INDEX = 1

export default function CalendarGrid() {
  const { calendarDays } = useCalendar()

  const gridCells: (typeof calendarDays[0] | null)[] = [
    ...Array(START_DAY_INDEX).fill(null),
    ...calendarDays,
    ...Array(28 - START_DAY_INDEX - calendarDays.length).fill(null),
  ]

  return (
    <div style={{ padding: '0 0 24px' }}>
      <style>{`
        /* Desktop: 7-col fixed 182px cards */
        .cal-headers { display: grid; grid-template-columns: repeat(7, minmax(0, 182px)); gap: 8px; margin-bottom: 8px; }
        .cal-grid    { display: grid; grid-template-columns: repeat(7, minmax(0, 182px)); gap: 8px; }
        .cal-empty   { height: 160px; min-height: 160px; }
        .day-abbr-mobile { display: none; }

        /* Mobile: 2-col, no headers, empty cells hidden */
        @media (max-width: 767px) {
          .cal-headers { display: none; }
          .cal-grid    { grid-template-columns: repeat(2, 1fr); gap: 6px; }
          .cal-empty   { display: none; }
          .day-abbr-mobile { display: block; }
        }
      `}</style>

      {/* Weekday column headers — desktop only */}
      <div className="cal-headers">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            style={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'center',
              paddingBottom: 8,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="cal-grid">
        {gridCells.map((cell, i) =>
          cell === null ? (
            <div key={`empty-${i}`} className="cal-empty" />
          ) : (
            <DayCard key={cell.day} day={cell} index={i} />
          )
        )}
      </div>
    </div>
  )
}
