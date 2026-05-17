import { useMemo } from 'react'
import { useCalendarStore } from '@/stores/calendar.store'
import { DIGITAL_DETOX_DAYS, CATCH_UP_DAYS, SIMULATED_TODAY } from '@/data/calendar.data'

const TOTAL_CHALLENGES = Array.from({ length: 24 }, (_, i) => i + 1)
  .filter(d => !DIGITAL_DETOX_DAYS.includes(d) && !CATCH_UP_DAYS.includes(d))
  .length // 14

export function useProgress() {
  const { completedDays } = useCalendarStore()

  const availableDays = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => i + 1)
      .filter(d =>
        d <= SIMULATED_TODAY &&
        !DIGITAL_DETOX_DAYS.includes(d) &&
        !CATCH_UP_DAYS.includes(d)
      ),
    []
  )

  const completedCount = useMemo(() =>
    completedDays.filter(d => availableDays.includes(d)).length,
    [completedDays, availableDays]
  )

  const progressPercentage = useMemo(() =>
    TOTAL_CHALLENGES > 0
      ? Math.round((completedCount / TOTAL_CHALLENGES) * 100)
      : 0,
    [completedCount]
  )

  const companionPercentage = useMemo(() => {
    const seed = completedDays.length
    return 45 + (seed * 7 % 33)
  }, [completedDays])

  return { completedCount, totalAvailable: TOTAL_CHALLENGES, progressPercentage, companionPercentage }
}
