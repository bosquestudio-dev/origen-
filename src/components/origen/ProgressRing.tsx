interface ProgressRingProps {
  percentage: number
  size?: number
}

export default function ProgressRing({ percentage, size = 52 }: ProgressRingProps) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, borderRadius: 14.21 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#41454E"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
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
      {/* Percentage label inside */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 10,
        fontWeight: 400,
        color: '#F7F7F8',
        lineHeight: 1,
      }}>
        {percentage.toFixed(1).replace('.', ',')}%
      </div>
    </div>
  )
}
