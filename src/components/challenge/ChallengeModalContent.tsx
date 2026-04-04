import { useState } from 'react'
import AppButton from '@/components/origen/AppButton'
import { useCalendarStore } from '@/stores/calendar.store'
import { useAppStore } from '@/stores/app.store'
import { useAuth } from '@/stores/auth.store'
import type { Challenge } from '@/types/challenge.types'

function TextChallenge({ challenge, completed }: { challenge: Challenge; completed: boolean }) {
  const { completeDay } = useCalendarStore()
  const { closeChallenge, showToast } = useAppStore()
  const [done, setDone] = useState(completed)

  const handleComplete = () => {
    completeDay(challenge.day)
    setDone(true)
    showToast('¡Reto completado!')
    setTimeout(closeChallenge, 1200)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>
      {challenge.content.actionText && (
        <div className="bg-surface-3 rounded-card p-4 border border-border">
          <p className="text-sm text-foreground">{challenge.content.actionText}</p>
        </div>
      )}
      {done ? (
        <div className="flex items-center gap-2 text-emerald-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="draw-check">
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm">Completado</span>
        </div>
      ) : (
        <AppButton onClick={handleComplete}>Marcar como completado</AppButton>
      )}
    </div>
  )
}

function VideoChallenge({ challenge, completed }: { challenge: Challenge; completed: boolean }) {
  const { completeDay } = useCalendarStore()
  const { closeChallenge, showToast } = useAppStore()
  const [showCta, setShowCta] = useState(completed)
  const [done, setDone] = useState(completed)

  useState(() => {
    if (!completed) {
      const timer = setTimeout(() => setShowCta(true), 30000)
      return () => clearTimeout(timer)
    }
  })

  const handleComplete = () => {
    completeDay(challenge.day)
    setDone(true)
    showToast('¡Reto completado!')
    setTimeout(closeChallenge, 1200)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{challenge.description}</p>
      {challenge.content.videoUrl && (
        <div className="aspect-video rounded-card overflow-hidden bg-background">
          <iframe
            src={challenge.content.videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {challenge.content.actionText && (
        <p className="text-xs text-muted-foreground">{challenge.content.actionText}</p>
      )}
      {done ? (
        <div className="flex items-center gap-2 text-emerald-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="draw-check"><path d="M5 13l4 4L19 7" /></svg>
          <span className="text-sm">Completado</span>
        </div>
      ) : showCta ? (
        <AppButton onClick={handleComplete}>He visto el vídeo</AppButton>
      ) : (
        <p className="text-xs text-muted-foreground/60">El botón aparecerá en unos segundos…</p>
      )}
    </div>
  )
}

function SurveyChallenge({ challenge, completed }: { challenge: Challenge; completed: boolean }) {
  const { completeDay } = useCalendarStore()
  const { closeChallenge, showToast } = useAppStore()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [done, setDone] = useState(completed)
  const questions = challenge.content.questions || []

  const handleSelect = (qId: string, opt: string) => {
    if (done) return
    setAnswers(prev => ({ ...prev, [qId]: opt }))
  }

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      showToast('Responde todas las preguntas')
      return
    }
    completeDay(challenge.day)
    setDone(true)
    showToast('¡Encuesta enviada!')
    setTimeout(closeChallenge, 1200)
  }

  if (done) {
    return (
      <div className="bg-surface-3 rounded-card p-4 border border-border text-sm text-muted-foreground">
        Ya participaste en esta encuesta
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{challenge.description}</p>
      {questions.map(q => (
        <div key={q.id} className="space-y-3">
          <p className="text-sm font-medium text-foreground">{q.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map(opt => (
              <button
                key={opt}
                onClick={() => handleSelect(q.id, opt)}
                className={`text-left text-sm p-3 rounded-card border transition-all duration-200 ${
                  answers[q.id] === opt
                    ? 'border-accent bg-accent/10 text-foreground'
                    : 'border-border bg-surface-3 text-muted-foreground hover:border-accent/40'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <AppButton onClick={handleSubmit}>Enviar respuesta</AppButton>
    </div>
  )
}

function RaffleChallenge({ challenge, completed }: { challenge: Challenge; completed: boolean }) {
  const { completeDay } = useCalendarStore()
  const { closeChallenge, showToast } = useAppStore()
  const { user } = useAuth()
  const [done, setDone] = useState(completed)
  const [spinning, setSpinning] = useState(false)

  const handleJoin = () => {
    setSpinning(true)
    setTimeout(() => {
      completeDay(challenge.day)
      setDone(true)
      setSpinning(false)
      showToast(`¡Estás dentro, ${user?.name?.split(' ')[0]}!`)
    }, 2000)
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="bg-surface-3 rounded-card p-4 border border-border text-sm text-muted-foreground">
          Ya estás inscrito en este sorteo
        </div>
        <p className="text-xs text-muted-foreground">Te avisaremos si eres el ganador</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{challenge.description}</p>
      {challenge.content.raffleText && (
        <div className="bg-gold/5 border border-gold/20 rounded-card p-4">
          <p className="text-sm text-gold-light">{challenge.content.raffleText}</p>
        </div>
      )}
      {spinning ? (
        <div className="h-16 flex items-center justify-center overflow-hidden">
          <div className="animate-pulse text-lg font-medium text-accent">{user?.name}</div>
        </div>
      ) : (
        <AppButton onClick={handleJoin}>Inscribirme al sorteo</AppButton>
      )}
    </div>
  )
}

interface ChallengeModalContentProps {
  challenge: Challenge
  completed: boolean
}

export default function ChallengeModalContent({ challenge, completed }: ChallengeModalContentProps) {
  const components: Record<string, React.FC<{ challenge: Challenge; completed: boolean }>> = {
    text: TextChallenge,
    video: VideoChallenge,
    survey: SurveyChallenge,
    raffle: RaffleChallenge,
  }
  const Component = components[challenge.type] || TextChallenge

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Día {challenge.day}</p>
        <h2 className="text-xl font-medium text-foreground">{challenge.title}</h2>
      </div>
      <Component challenge={challenge} completed={completed} />
    </div>
  )
}
