interface ProgressRingProps {
  percentage: number
  size?: number
}

export default function ProgressRing({ percentage, size = 40 }: ProgressRingProps) {
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="hsl(var(--surface-3))"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-600 ease-out"
      />
    </svg>
  )
}
