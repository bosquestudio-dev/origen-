import { useState } from 'react'
import { useAdminStore } from '@/stores/admin.store'
import { DAY_LABELS, DIGITAL_DETOX_DAYS } from '@/data/calendar.data'
import type { Challenge } from '@/types/challenge.types'
import AppBadge from '@/components/origen/AppBadge'
import ChallengeEditModal from '@/components/admin/ChallengeEditModal'

export default function AdminChallengesPage() {
  const { challenges, toggleChallengeActive, updateChallenge } = useAdminStore()
  const [editing, setEditing] = useState<Challenge | null>(null)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-foreground">Gestión de retos</h2>

      <div className="space-y-2">
        {challenges.map(c => {
          const isDetox = DIGITAL_DETOX_DAYS.includes(c.day)
          return (
            <div key={c.day} className="flex items-center gap-4 bg-surface-2 border border-border rounded-card px-4 py-3">
              <span className="text-lg font-medium text-foreground w-8">{c.day}</span>
              <span className="text-xs text-muted-foreground w-16">{DAY_LABELS[c.day]}</span>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{c.title}</p>
              </div>

              <AppBadge label={isDetox ? 'Desconexión' : c.type} variant={isDetox ? 'detox' : c.type} />

              {/* Toggle */}
              <button
                onClick={() => toggleChallengeActive(c.day)}
                className={`w-10 h-5 rounded-full transition-colors relative ${c.isActive ? 'bg-accent' : 'bg-surface-3'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${c.isActive ? 'left-5' : 'left-0.5'}`} />
              </button>

              <button
                onClick={() => setEditing(c)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                Editar
              </button>
            </div>
          )
        })}
      </div>

      <ChallengeEditModal
        challenge={editing}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onSave={(day, updates) => updateChallenge(day, updates)}
      />
    </div>
  )
}
