interface MetricCardProps {
  label: string
  value: string | number
  subtitle?: string
}

export default function MetricCard({ label, value, subtitle }: MetricCardProps) {
  return (
    <div className="bg-surface-2 border border-border rounded-card p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-medium text-foreground">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  )
}
