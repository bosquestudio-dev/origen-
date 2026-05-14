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
      {/* Track — Figma: r=0.255 g=0.272 b=0.305 → #41454E */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="#41454E"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress — Figma: r=0.135 g=0.765 b=0.366 → #22C35D */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="#22C35D"
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
