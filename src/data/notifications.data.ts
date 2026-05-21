export interface Notification {
  id: string
  title: string
  message: string
  emoji?: string
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: '🎉 Ganador del sorteo del día 4',
    message: 'El ganador del sorteo es <strong>Carlos López</strong>. ¡Enhorabuena! Nos pondremos en contacto contigo pronto.',
  },
]

// TODO Fase 2: supabase.from('notifications').select()
