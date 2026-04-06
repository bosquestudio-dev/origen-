export type UserRole = 'employee' | 'admin'

export interface User {
  id: string
  name: string
  email?: string
  dni?: string
  company: string
  role: UserRole
}
