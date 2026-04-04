import { useMemo } from 'react'
import { useCalendarStore } from '@/stores/calendar.store'
import { DIGITAL_DETOX_DAYS, SIMULATED_TODAY } from '@/data/calendar.data'

export function useProgress() {
  const { completedDays } = useCalendarStore()

  const availableDays = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => i + 1)
      .filter(d => d <= SIMULATED_TODAY && !DIGITAL_DETOX_DAYS.includes(d)),
    []
  )

  const completedCount = useMemo(() =>
    completedDays.filter(d => availableDays.includes(d)).length,
    [completedDays, availableDays]
  )

  const progressPercentage = useMemo(() =>
    availableDays.length > 0
      ? Math.round((completedCount / availableDays.length) * 100)
      : 0,
    [completedCount, availableDays]
  )

  const companionPercentage = useMemo(() => {
    const seed = completedDays.length
    return 45 + (seed * 7 % 33)
  }, [completedDays])

  return { completedCount, totalAvailable: availableDays.length, progressPercentage, companionPercentage }
}
