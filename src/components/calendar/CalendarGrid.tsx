import { useCalendar } from '@/hooks/useCalendar'
import DayCard from './DayCard'
import { HOLIDAY_DAYS } from '@/data/calendar.data'

const WEEKDAYS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO']

// December 1, 2026 = Tuesday → 1 empty Monday cell
const START_DAY_INDEX = 1

// Mobile background per status
const MOBILE_BG: Record<string, string> = {
  completed:      'rgba(34,195,93,0.25)',
  accessible:     'rgba(247,247,248,0.25)',
  today:          'rgba(252,150,95,0.50)',
  locked:         'transparent',
  'digital-detox':'transparent',
  'catch-up':     '#1A1A2E',
}
const MOBILE_BORDER: Record<string, string> = {
  completed:      '2px solid #22C35D',
  accessible:     '2px solid #BCC0C7',
  today:          '2px solid #FB7026',
  locked:         '2px solid #585E6A',
  'digital-detox':'2px solid #2A2D32',
  'catch-up':     '1.5px solid #7B6FE8',
}

export default function CalendarGrid() {
  const { calendarDays } = useCalendar()

  const gridCells: (typeof calendarDays[0] | null)[] = [
    ...Array(START_DAY_INDEX).fill(null),
    ...calendarDays,
    ...Array(28 - START_DAY_INDEX - calendarDays.length).fill(null),
  ]

  return (
    <div style={{ padding: '20px', background: '#17191C', borderRadius: 16 }}>
      <style>{`
        /* ── Desktop: 7-col fixed 182px cards ── */
        .cal-headers { display: grid; grid-template-columns: repeat(7, minmax(0, 182px)); gap: 12px; margin-bottom: 12px; }
        .cal-grid    { display: grid; grid-template-columns: repeat(7, minmax(0, 182px)); gap: 12px; }
        .cal-empty   { height: 160px; min-height: 160px; }

        /* Desktop: show desktop elements, hide mobile */
        .day-number-desktop  { display: block; }
        .day-detox-desktop   { display: flex; }
        .day-badge-desktop   { display: flex; }
        .day-mobile-content  { display: none !important; }
        .day-mobile-detox    { display: none !important; }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .cal-headers { display: none; }
          .cal-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            padding: 0 0;
          }
          .cal-empty { display: none; }

          /* Mobile card size & layout */
          .day-card-root {
            width: 100% !important;
            height: 78.5px !important;
            min-height: 78.5px !important;
            border-radius: 8px !important;
            padding: 16px !important;
          }

          /* Override desktop card bg/border with mobile values via data attrs */
          .day-card-root[data-status="completed"]      { background: rgba(34,195,93,0.25) !important;   border: 2px solid #22C35D !important; }
          .day-card-root[data-status="accessible"]     { background: rgba(247,247,248,0.25) !important; border: 2px solid #BCC0C7 !important; }
          .day-card-root[data-status="today"]          { background: rgba(252,150,95,0.50) !important;  border: 2px solid #FB7026 !important; }
          .day-card-root[data-status="locked"]         { background: transparent !important;            border: 2px solid #585E6A !important; }
          .day-card-root[data-status="digital-detox"]  { background: transparent !important;            border: 2px solid #2A2D32 !important; }
          .day-card-root[data-status="catch-up"]       { background: #1A1A2E !important;                border: 1.5px solid #7B6FE8 !important; }
          .day-card-root[data-special="true"]          { background: rgba(218,165,32,0.40) !important;  border: 2px solid #DAA520 !important; }

          /* Hide desktop elements */
          .day-number-desktop { display: none !important; }
          .day-detox-desktop  { display: none !important; }
          .day-badge-desktop  { display: none !important; }

          /* Show mobile elements */
          .day-mobile-content { display: flex !important; }
          .day-mobile-detox   { display: flex !important; }
        }
      `}</style>

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
