import { useCalendar } from '@/hooks/useCalendar'
import DayCard from './DayCard'

export default function CalendarGrid() {
  const { calendarDays } = useCalendar()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" style={{ perspective: '1200px' }}>
      {calendarDays.map((day, index) => (
        <DayCard key={day.day} day={day} index={index} />
      ))}
    </div>
  )
}
