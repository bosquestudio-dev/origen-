import { Lock, RotateCcw, Star, CheckCircle2, Moon, PenLine, Play, List, Gift, Heart } from 'lucide-react'
import type { ChallengeType } from '@/types/challenge.types'

const STATUS_CONFIG = {
  futuro:      { label: 'Próximo',        Icon: Lock },
  desconexion: { label: 'Fin de semana',  Icon: Moon },
  pasado:      { label: 'Pasado',         Icon: RotateCcw },
  hoy:         { label: 'Hoy',            Icon: Star },
  completado:  { label: 'Completado',     Icon: CheckCircle2 },
} as const

type StatusVariant = keyof typeof STATUS_CONFIG

const TYPE_CONFIG: Record<ChallengeType, { label: string; Icon: React.ElementType; cssClass: string }> = {
  text:     { label: 'Reflexión', Icon: PenLine, cssClass: 'badge-texto' },
  video:    { label: 'Video',     Icon: Play,    cssClass: 'badge-video' },
  survey:   { label: 'Encuesta',  Icon: List,    cssClass: 'badge-encuesta' },
  raffle:   { label: 'Sorteo',    Icon: Gift,    cssClass: 'badge-sorteo' },
  donation: { label: 'Donación',  Icon: Heart,   cssClass: 'badge-donacion' },
}

interface AppBadgeProps {
  variant: StatusVariant | ChallengeType
  label?: string
  size?: 'sm' | 'md'
}

export default function AppBadge({ variant, label, size = 'md' }: AppBadgeProps) {
  const sizeClass = size === 'sm' ? 'badge-sm' : ''

  if (variant in STATUS_CONFIG) {
    const config = STATUS_CONFIG[variant as StatusVariant]
    const { Icon } = config
    return (
      <span className={`badge-base badge-${variant} ${sizeClass}`}>
        <Icon size={12} />
        <span>{label ?? config.label}</span>
      </span>
    )
  }

  if (variant in TYPE_CONFIG) {
    const config = TYPE_CONFIG[variant as ChallengeType]
    const { Icon } = config
    return (
      <span className={`badge-base ${config.cssClass} ${sizeClass}`}>
        <Icon size={12} />
        <span>{label ?? config.label}</span>
      </span>
    )
  }

  return null
}
