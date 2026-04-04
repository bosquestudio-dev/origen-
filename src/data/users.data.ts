import type { User } from '@/types/auth.types'

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Ana García', email: 'ana.garcia@empresa.com', company: 'Empresa Demo' },
  { id: '2', name: 'Carlos López', email: 'carlos.lopez@empresa.com', company: 'Empresa Demo' },
  { id: '3', name: 'María Martín', email: 'maria.martin@empresa.com', company: 'Empresa Demo' },
  { id: '4', name: 'Pedro Sánchez', dni: '12345678A', company: 'Empresa Demo' },
  { id: '5', name: 'Laura Fernández', dni: '87654321B', company: 'Empresa Demo' },
]
