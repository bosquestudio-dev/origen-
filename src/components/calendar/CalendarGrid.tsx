import { useCalendar } from '@/hooks/useCalendar'
import DayCard from './DayCard'

export default function CalendarGrid() {
  const { calendarDays } = useCalendar()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {calendarDays.map(day => (
        <DayCard key={day.day} day={day} />
      ))}
    </div>
  )
}
