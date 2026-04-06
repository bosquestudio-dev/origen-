import type { AdminDashboardData } from '@/types/admin.types'
import type { CompanyTheme } from '@/types/company.types'

export const MOCK_STATS: AdminDashboardData = {
  totalEmployees: 47,
  activeToday: 31,
  overallCompletion: 68,
  challengeStats: Array.from({ length: 24 }, (_, i) => ({
    day: i + 1,
    completionCount: Math.floor(Math.random() * 40 + 5),
    completionPercentage: Math.floor(Math.random() * 60 + 20),
    totalEmployees: 47,
  })),
}

export const MOCK_COMPANY_THEME: CompanyTheme = {
  primaryColor: '#7F77DD',
  secondaryColor: '#5DCAA5',
  logoUrl: undefined,
  companyName: 'Empresa Demo',
}
