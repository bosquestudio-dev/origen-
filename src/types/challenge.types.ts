export type ChallengeType = 'text' | 'video' | 'survey' | 'raffle'

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
}

export interface SurveyQuestion {
  id: string
  question: string
  options: string[]
}
