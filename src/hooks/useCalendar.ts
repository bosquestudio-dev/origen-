import { useMemo } from 'react'
import { useCalendarStore } from '@/stores/calendar.store'
import { DIGITAL_DETOX_DAYS, CATCH_UP_DAYS, SIMULATED_TODAY, DAY_LABELS, SPECIAL_DAY } from '@/data/calendar.data'
import { CHALLENGES_DATA } from '@/data/challenges.data'
import type { DayStatus, CalendarDay } from '@/types/calendar.types'

export function useCalendar() {
  const { completedDays } = useCalendarStore()

  const getDayStatus = (day: number): DayStatus => {
    if (DIGITAL_DETOX_DAYS.includes(day)) return 'digital-detox'
    if (CATCH_UP_DAYS.includes(day)) return 'catch-up'
    if (day > SIMULATED_TODAY) return 'locked'
    if (day === SIMULATED_TODAY) return 'today'
    if (completedDays.includes(day)) return 'completed'
    return 'accessible'
  }

  const canAttemptDay = (day: number): boolean => {
    const status = getDayStatus(day)
    if (status === 'locked' || status === 'digital-detox' || status === 'catch-up') return false
    if (status === 'accessible' || status === 'completed') return true

    // Para 'today': requiere los 2 retos anteriores completados
    // (excluyendo digital-detox y catch-up, que no son retos)
    const required: number[] = []
    for (let d = day - 1; d >= 1 && required.length < 2; d--) {
      if (!DIGITAL_DETOX_DAYS.includes(d) && !CATCH_UP_DAYS.includes(d)) {
        required.push(d)
      }
    }
    return required.every(d => completedDays.includes(d))
  }

  const calendarDays: CalendarDay[] = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => {
      const day = i + 1
      return {
        day,
        date: DAY_LABELS[day],
        status: getDayStatus(day),
        challenge: CATCH_UP_DAYS.includes(day) ? undefined : CHALLENGES_DATA.find(c => c.day === day),
        isSpecial: day === SPECIAL_DAY,
      }
    }), [completedDays])

  return { getDayStatus, canAttemptDay, calendarDays }
}
