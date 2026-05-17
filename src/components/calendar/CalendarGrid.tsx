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
    <div className="cal-grid-wrapper">
      {/* Weekday column headers — desktop only */}
      <div className="cal-headers">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            style={{
              fontSize: 12, fontWeight: 400,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: '#989EA9', textAlign: 'center',
              paddingBottom: 8, fontFamily: "'DM Sans', sans-serif",
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
            <DayCard
              key={cell.day}
              day={cell}
              index={i}
              dataStatus={cell.status}
              dataSpecial={cell.isSpecial ? 'true' : 'false'}
            />
          )
        )}
      </div>
    </div>
  )
}
