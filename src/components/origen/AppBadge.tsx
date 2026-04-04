import type { ChallengeType } from '@/types/challenge.types'

interface AppBadgeProps {
  label: string
  variant?: ChallengeType | 'detox' | 'today' | 'special'
}

export default function AppBadge({ label, variant = 'text' }: AppBadgeProps) {
  const variants: Record<string, string> = {
    text: 'bg-surface-3 text-muted-foreground',
    video: 'bg-accent/15 text-accent',
    survey: 'bg-emerald-500/15 text-emerald-400',
    raffle: 'bg-gold/15 text-gold-light',
    detox: 'bg-surface-3 text-muted-foreground',
    today: 'bg-accent/20 text-accent',
    special: 'bg-gold/20 text-gold-light',
  }

  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-medium ${variants[variant] || variants.text}`}>
      {label}
    </span>
  )
}
