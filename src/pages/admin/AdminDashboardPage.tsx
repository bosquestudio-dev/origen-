import { useAdminStore } from '@/stores/admin.store'
import MetricCard from '@/components/admin/MetricCard'
import ChallengeStatsBar from '@/components/admin/ChallengeStatsBar'

export default function AdminDashboardPage() {
  const { stats } = useAdminStore()
  const maxPct = Math.max(...stats.challengeStats.map(s => s.completionPercentage), 1)

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-medium text-foreground">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total empleados" value={stats.totalEmployees} />
        <MetricCard label="Activos hoy" value={stats.activeToday} subtitle={`${Math.round((stats.activeToday / stats.totalEmployees) * 100)}% del total`} />
        <MetricCard label="Completado general" value={`${stats.overallCompletion}%`} />
        <MetricCard label="Retos completados" value={stats.challengeStats.reduce((s, c) => s + c.completionCount, 0)} subtitle="acumulado" />
      </div>

      <div className="bg-surface-2 border border-border rounded-card p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">% completado por día</p>
        <div className="flex gap-1">
          {stats.challengeStats.map(s => (
            <ChallengeStatsBar key={s.day} day={s.day} percentage={s.completionPercentage} maxPercentage={maxPct} />
          ))}
        </div>
      </div>
    </div>
  )
}
