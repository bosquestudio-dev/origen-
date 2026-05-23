import { useCalendar } from '@/hooks/useCalendar'
import { useIsMobile } from '@/hooks/use-mobile'
import DayCard from './DayCard'
import type { CalendarDay } from '@/types/calendar.types'

const WEEKDAYS_DESKTOP = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO']
const WEEKDAYS_MOBILE = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE']

const START_DAY_INDEX = 1 // Dec 1 = Tuesday

// Column index for Mon-Fri weekday days (0=Mon … 4=Fri)
const MOBILE_COL: Record<number, number> = {
  1: 1,  2: 2,  3: 3,  4: 4,
  7: 0,  8: 1,  9: 2, 10: 3, 11: 4,
  14: 0, 15: 1, 16: 2, 17: 3, 18: 4,
  21: 0, 22: 1, 23: 2, 24: 3,
}

// Weekend days that become the separator row
const WEEKEND_SET = new Set([5, 6, 12, 13, 19, 20])

export default function CalendarGrid() {
  const { calendarDays } = useCalendar()
  const isMobile = useIsMobile()

  // ── Desktop grid: 7 cols, Mon empty, 24 days, filler ──
  const desktopCells: (CalendarDay | null)[] = [
    ...Array(START_DAY_INDEX).fill(null),
    ...calendarDays,
    ...Array(28 - START_DAY_INDEX - calendarDays.length).fill(null),
  ]

  // ── Mobile grid: 5 cols (Mon-Fri), weekends replaced by separator rows ──
  const mobileRows: (CalendarDay | null)[][] = []
  const dayMap = new Map(calendarDays.map(d => [d.day, d]))
  let currentRow: (CalendarDay | null)[] = Array(5).fill(null)

  for (let day = 1; day <= 24; day++) {
    if (WEEKEND_SET.has(day)) {
      if (currentRow.some(d => d !== null)) {
        mobileRows.push([...currentRow])
        currentRow = Array(5).fill(null)
      }
      continue
    }
    const col = MOBILE_COL[day]
    if (col !== undefined) {
      currentRow[col] = dayMap.get(day) || null
    }
  }
  if (currentRow.some(d => d !== null)) {
    mobileRows.push([...currentRow])
  }

  // ── Weekend separator row component ──
  const WeekendSeparator = () => (
    <div className="cal-weekend-sep">
      <div className="cal-weekend-line" />
      <span className="cal-weekend-text">Finde - Desconexión digital</span>
      <div className="cal-weekend-line" />
    </div>
  )

  if (isMobile) {
    return (
      <div className="cal-grid-wrapper">
        {/* Weekday headers */}
        <div className="cal-headers-mobile">
          {WEEKDAYS_MOBILE.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Day rows + separators */}
        <div className="cal-grid-mobile">
          {mobileRows.map((rowCells, rowIdx) => (
            <div key={`row-${rowIdx}`}>
              <div className="cal-grid-row-mobile">
                {rowCells.map((cell, colIdx) => (
                  <div key={`cell-${rowIdx}-${colIdx}`} className="cal-cell-mobile">
                    {cell ? (
                      <DayCard
                        day={cell}
                        index={rowIdx * 5 + colIdx}
                        dataStatus={cell.status}
                        dataSpecial={cell.isSpecial ? 'true' : 'false'}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
              {rowIdx < mobileRows.length - 1 && <WeekendSeparator />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Desktop render ──
  return (
    <div className="cal-grid-wrapper">
      <div className="cal-headers">
        {WEEKDAYS_DESKTOP.map((d) => (
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

      <div className="cal-grid">
        {desktopCells.map((cell, i) =>
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
