export type ChallengeType = 'text' | 'video' | 'survey' | 'raffle' | 'donation' | 'catch-up'

export interface Challenge {
  id: number
  day: number
  title: string
  description: string
  type: ChallengeType
  content: ChallengeContent
  label: string
  isActive: boolean
}

export interface ChallengeContent {
  videoUrl?: string
  questions?: SurveyQuestion[]
  raffleText?: string
  actionText?: string
  imageUrl?: string
  donationLink?: string
  donationText?: string
  bodyText?: string
}

export interface SurveyQuestion {
  id: string
  question: string
  options: string[]
}
