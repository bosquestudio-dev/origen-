import { useMemo } from 'react'
import { useCalendarStore } from '@/stores/calendar.store'
import { DIGITAL_DETOX_DAYS, SIMULATED_TODAY, DAY_LABELS, SPECIAL_DAY } from '@/data/calendar.data'
import { CHALLENGES_DATA } from '@/data/challenges.data'
import type { DayStatus, CalendarDay } from '@/types/calendar.types'

export function useCalendar() {
  const { completedDays } = useCalendarStore()

  const getDayStatus = (day: number): DayStatus => {
    if (DIGITAL_DETOX_DAYS.includes(day)) return 'digital-detox'
    if (day > SIMULATED_TODAY) return 'locked'
    if (day === SIMULATED_TODAY) return 'today'
    if (completedDays.includes(day)) return 'completed'
    return 'accessible'
  }

  const canAttemptDay = (day: number): boolean => {
    const status = getDayStatus(day)
    if (status === 'locked' || status === 'digital-detox') return false
    const previousChallengeDays = [day - 1, day - 2]
      .filter(d => d > 0 && !DIGITAL_DETOX_DAYS.includes(d))
    return previousChallengeDays.every(d =>
      completedDays.includes(d) || d >= SIMULATED_TODAY
    )
  }

  const calendarDays: CalendarDay[] = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => {
      const day = i + 1
      return {
        day,
        date: DAY_LABELS[day],
        status: getDayStatus(day),
        challenge: CHALLENGES_DATA.find(c => c.day === day),
        isSpecial: day === SPECIAL_DAY,
      }
    }), [completedDays])

  return { getDayStatus, canAttemptDay, calendarDays }
}
