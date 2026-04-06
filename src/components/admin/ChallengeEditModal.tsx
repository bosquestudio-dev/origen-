import { useState, useEffect } from 'react'
import type { Challenge, ChallengeType } from '@/types/challenge.types'
import AppModal from '@/components/origen/AppModal'
import AppButton from '@/components/origen/AppButton'

interface ChallengeEditModalProps {
  challenge: Challenge | null
  isOpen: boolean
  onClose: () => void
  onSave: (day: number, updates: Partial<Challenge>) => void
}

const typeOptions: { value: ChallengeType; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'video', label: 'Vídeo' },
  { value: 'survey', label: 'Encuesta' },
  { value: 'raffle', label: 'Sorteo' },
]

export default function ChallengeEditModal({ challenge, isOpen, onClose, onSave }: ChallengeEditModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ChallengeType>('text')
  const [contentText, setContentText] = useState('')

  useEffect(() => {
    if (challenge) {
      setTitle(challenge.title)
      setDescription(challenge.description)
      setType(challenge.type)
      setContentText(
        challenge.content.videoUrl || challenge.content.raffleText || challenge.content.actionText || ''
      )
    }
  }, [challenge])

  const handleSave = () => {
    if (!challenge) return
    const content = { ...challenge.content }
    if (type === 'video') content.videoUrl = contentText
    else if (type === 'raffle') content.raffleText = contentText
    else content.actionText = contentText

    onSave(challenge.day, { title, description, type, content })
    onClose()
  }

  return (
    <AppModal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-5">
        <h3 className="text-lg font-medium text-foreground">Editar día {challenge?.day}</h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest">Título</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full mt-1 bg-surface-3 border border-border rounded-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full mt-1 bg-surface-3 border border-border rounded-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest">Tipo</label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`py-2 rounded-card border text-xs transition-all ${
                    type === opt.value
                      ? 'border-accent bg-accent/10 text-foreground'
                      : 'border-border text-muted-foreground hover:border-accent/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest">
              {type === 'video' ? 'URL del vídeo' : type === 'raffle' ? 'Texto del sorteo' : 'Contenido'}
            </label>
            <textarea
              value={contentText}
              onChange={e => setContentText(e.target.value)}
              rows={2}
              className="w-full mt-1 bg-surface-3 border border-border rounded-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <AppButton variant="ghost" onClick={onClose}>Cancelar</AppButton>
          <AppButton onClick={handleSave}>Guardar cambios</AppButton>
        </div>
      </div>
    </AppModal>
  )
}
