import type { Challenge } from './challenge.types'

export type DayStatus =
  | 'locked'
  | 'accessible'
  | 'today'
  | 'completed'
  | 'digital-detox'
  | 'catch-up'

export interface CalendarDay {
  day: number
  date: string
  status: DayStatus
  challenge?: Challenge
  isSpecial?: boolean
}
