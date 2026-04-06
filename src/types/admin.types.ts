export interface ChallengeStats {
  day: number
  completionCount: number
  completionPercentage: number
  totalEmployees: number
}

export interface AdminDashboardData {
  totalEmployees: number
  activeToday: number
  overallCompletion: number
  challengeStats: ChallengeStats[]
}
