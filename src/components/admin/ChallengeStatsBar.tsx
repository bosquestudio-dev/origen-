interface ChallengeStatsBarProps {
  day: number
  percentage: number
  maxPercentage: number
}

export default function ChallengeStatsBar({ day, percentage, maxPercentage }: ChallengeStatsBarProps) {
  const height = maxPercentage > 0 ? (percentage / maxPercentage) * 100 : 0

  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <div className="w-full h-32 bg-surface-3 rounded-sm overflow-hidden flex items-end">
        <div
          className="w-full bg-accent/60 rounded-t-sm transition-all duration-500"
          style={{ height: `${height}%` }}
        />
      </div>
      <span className="text-[9px] text-muted-foreground">{day}</span>
      <span className="text-[9px] text-muted-foreground/60">{percentage}%</span>
    </div>
  )
}
